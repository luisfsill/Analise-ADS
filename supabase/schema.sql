-- =============================================================================
-- Análise de performance dos anúncios — schema do banco (Supabase / Postgres)
-- Versão SaaS: vários clientes, cada um com login próprio e dados isolados.
--
-- Como usar: Supabase > SQL Editor > New query > cole este arquivo inteiro > Run.
-- Pode rodar de novo sem perder dados (é idempotente).
--
-- Depois de criar a SUA conta pelo app, rode o comando do final deste arquivo
-- para virar administrador.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) Parâmetros do negócio
-- -----------------------------------------------------------------------------
-- Dias de teste grátis para quem se cadastra sozinho pelo app.
-- Coloque 0 para exigir ativação manual pelo admin (cadastro fica "inativo").
create or replace function public.dias_de_teste()
returns int language sql immutable set search_path = '' as $$ select 7 $$;

-- -----------------------------------------------------------------------------
-- 1) Perfis: um por usuário do Supabase Auth
-- -----------------------------------------------------------------------------
create table if not exists public.perfis (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null default '',
  nome        text not null default '',
  papel       text not null default 'cliente',
  status      text not null default 'teste',
  acesso_ate  timestamptz,               -- null = sem data de vencimento
  observacao  text not null default '',  -- anotação interna do admin (plano, pagamento…)
  criado_em   timestamptz not null default now()
);

-- Migração de versões antigas do schema (papel mentorado/equipe → cliente/admin)
alter table public.perfis add column if not exists email      text not null default '';
alter table public.perfis add column if not exists status     text not null default 'teste';
alter table public.perfis add column if not exists acesso_ate timestamptz;
alter table public.perfis add column if not exists observacao text not null default '';
alter table public.perfis drop constraint if exists perfis_papel_check;
update public.perfis set papel = 'cliente' where papel not in ('cliente', 'admin');
alter table public.perfis alter column papel set default 'cliente';
alter table public.perfis add constraint perfis_papel_check check (papel in ('cliente', 'admin'));
alter table public.perfis drop constraint if exists perfis_status_check;
alter table public.perfis add constraint perfis_status_check check (status in ('teste', 'ativo', 'inativo'));
alter table public.perfis drop constraint if exists perfis_nome_tam;
alter table public.perfis add constraint perfis_nome_tam check (char_length(nome) <= 120);

create index if not exists perfis_email_idx on public.perfis (lower(email));

-- Cria o perfil automaticamente quando alguém se cadastra (ou é convidado)
create or replace function public.criar_perfil()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  dias int := public.dias_de_teste();
begin
  insert into public.perfis (id, email, nome, status, acesso_ate)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'nome', ''), 120),
    case when dias > 0 then 'teste' else 'inativo' end,
    case when dias > 0 then now() + make_interval(days => dias) else null end
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- Mantém o e-mail do perfil igual ao do login quando o usuário troca de e-mail
create or replace function public.sincronizar_email()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.perfis set email = coalesce(new.email, '') where id = new.id;
  return new;
end $$;

drop trigger if exists ao_mudar_email on auth.users;
create trigger ao_mudar_email
  after update of email on auth.users
  for each row execute function public.sincronizar_email();

-- Preenche o e-mail de perfis antigos
update public.perfis p set email = u.email from auth.users u where u.id = p.id and p.email = '';

-- -----------------------------------------------------------------------------
-- 2) Análises salvas (cada linha pertence a um usuário)
-- -----------------------------------------------------------------------------
create table if not exists public.analises (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade default auth.uid(),
  campanha      text not null default '',
  entradas      jsonb not null,              -- números digitados (ver lib/analise/tipos.ts > Entradas)
  passos_feitos jsonb not null default '{}', -- passos do plano marcados como feitos
  nota          int,                         -- nota de 0 a 100 no momento em que foi salva
  gargalo       text,                        -- 'Impressões' | 'Cliques' | 'Vendas' | null
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists analises_user_atualizado_idx on public.analises (user_id, atualizado_em desc);

-- Limites de tamanho: impede que alguém encha o banco com dados gigantes
alter table public.analises drop constraint if exists analises_tamanhos;
alter table public.analises add constraint analises_tamanhos check (
  char_length(campanha) <= 120
  and pg_column_size(entradas) <= 8192
  and pg_column_size(passos_feitos) <= 65536
  and (nota is null or nota between 0 and 100)
  and (gargalo is null or gargalo in ('Impressões', 'Cliques', 'Vendas'))
);

create or replace function public.tocar_atualizado_em()
returns trigger language plpgsql set search_path = '' as $$
begin new.atualizado_em = now(); return new; end $$;
drop trigger if exists analises_atualizado on public.analises;
create trigger analises_atualizado before update on public.analises
  for each row execute function public.tocar_atualizado_em();

-- Limite de análises por cliente (proteção contra abuso). Ajuste se precisar.
create or replace function public.limitar_analises()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.analises where user_id = new.user_id) >= 2000 then
    raise exception 'Limite de análises atingido para esta conta.';
  end if;
  return new;
end $$;
drop trigger if exists analises_limite on public.analises;
create trigger analises_limite before insert on public.analises
  for each row execute function public.limitar_analises();

-- -----------------------------------------------------------------------------
-- 3) Funções de acesso
-- -----------------------------------------------------------------------------
-- O usuário logado é administrador da plataforma?
create or replace function public.eh_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfis where id = auth.uid() and papel = 'admin');
$$;

-- O usuário logado tem acesso liberado (admin, ou teste/ativo dentro do prazo)?
create or replace function public.tem_acesso()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid()
      and (
        papel = 'admin'
        or (status in ('teste', 'ativo') and (acesso_ate is null or acesso_ate > now()))
      )
  );
$$;

-- Remove a função antiga (papel "equipe" não existe mais)
drop function if exists public.eh_equipe() cascade;

-- -----------------------------------------------------------------------------
-- 4) Segurança por linha (RLS) — é isso que isola os dados de cada cliente
-- -----------------------------------------------------------------------------
alter table public.perfis   enable row level security;
alter table public.analises enable row level security;

-- Visitante não logado não acessa nada
revoke all on public.perfis   from anon;
revoke all on public.analises from anon;

-- Perfis: o usuário lê o próprio perfil e só pode mudar o NOME.
-- Papel, status e vencimento só mudam pelo admin (função admin_atualizar_usuario).
revoke insert, update, delete on public.perfis from authenticated;
grant select on public.perfis to authenticated;
grant update (nome) on public.perfis to authenticated;

drop policy if exists perfis_ler on public.perfis;
create policy perfis_ler on public.perfis for select to authenticated
  using (id = auth.uid() or public.eh_admin());
drop policy if exists perfis_editar on public.perfis;
create policy perfis_editar on public.perfis for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Análises: cada cliente vê e mexe só nas suas.
-- Criar e editar exige acesso liberado (assinatura em dia).
-- O admin pode LER todas (suporte), mas não edita as dos clientes.
grant select, insert, update, delete on public.analises to authenticated;

drop policy if exists analises_ler on public.analises;
create policy analises_ler on public.analises for select to authenticated
  using (user_id = auth.uid() or public.eh_admin());
drop policy if exists analises_criar on public.analises;
create policy analises_criar on public.analises for insert to authenticated
  with check (user_id = auth.uid() and public.tem_acesso());
drop policy if exists analises_editar on public.analises;
create policy analises_editar on public.analises for update to authenticated
  using (user_id = auth.uid() and public.tem_acesso())
  with check (user_id = auth.uid());
drop policy if exists analises_apagar on public.analises;
create policy analises_apagar on public.analises for delete to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 5) Funções do painel de administração (só funcionam para papel = 'admin')
-- -----------------------------------------------------------------------------
create or replace function public.admin_listar_usuarios()
returns table (
  id uuid, email text, nome text, papel text, status text, acesso_ate timestamptz,
  observacao text, criado_em timestamptz, total_analises bigint, ultimo_acesso timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.eh_admin() then raise exception 'Acesso negado'; end if;
  return query
    select p.id, p.email, p.nome, p.papel, p.status, p.acesso_ate, p.observacao, p.criado_em,
           (select count(*) from public.analises a where a.user_id = p.id),
           u.last_sign_in_at
    from public.perfis p
    left join auth.users u on u.id = p.id
    order by p.criado_em desc;
end $$;

create or replace function public.admin_atualizar_usuario(
  p_id uuid, p_papel text, p_status text, p_acesso_ate timestamptz, p_observacao text
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.eh_admin() then raise exception 'Acesso negado'; end if;
  if p_id = auth.uid() and p_papel <> 'admin' then
    raise exception 'Você não pode remover o seu próprio acesso de administrador.';
  end if;
  update public.perfis
     set papel = p_papel, status = p_status, acesso_ate = p_acesso_ate,
         observacao = left(coalesce(p_observacao, ''), 500)
   where id = p_id;
end $$;

-- Quem pode chamar o quê
revoke execute on function public.criar_perfil()        from public, anon, authenticated;
revoke execute on function public.sincronizar_email()   from public, anon, authenticated;
revoke execute on function public.limitar_analises()    from public, anon, authenticated;
revoke execute on function public.admin_listar_usuarios() from public, anon;
revoke execute on function public.admin_atualizar_usuario(uuid, text, text, timestamptz, text) from public, anon;
revoke execute on function public.eh_admin()   from public, anon;
revoke execute on function public.tem_acesso() from public, anon;
grant execute on function public.admin_listar_usuarios() to authenticated;
grant execute on function public.admin_atualizar_usuario(uuid, text, text, timestamptz, text) to authenticated;
grant execute on function public.eh_admin()   to authenticated;
grant execute on function public.tem_acesso() to authenticated;

-- =============================================================================
-- PRIMEIRO ADMIN — rode SEPARADAMENTE depois de criar sua conta no app,
-- trocando pelo seu e-mail:
--
--   update public.perfis set papel = 'admin', status = 'ativo', acesso_ate = null
--   where email = 'seu-email@exemplo.com';
-- =============================================================================
