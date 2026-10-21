// Segurança do banco: roda o supabase/schema.sql de verdade num Postgres em memória (PGlite),
// com uma simulação mínima do Supabase (papéis anon/authenticated, auth.users e auth.uid()).
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { temAcesso } from "../lib/regras-acesso";

const SCHEMA = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");
const SIMULACAO_SUPABASE = `
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}', last_sign_in_at timestamptz);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;`;

const ADMIN = "11111111-1111-1111-1111-111111111111";
const A = "22222222-2222-2222-2222-222222222222";
const B = "33333333-3333-3333-3333-333333333333";

let db: PGlite;

/** Roda SQL como um usuário logado (ou anon / dono do banco). */
async function como<T = Record<string, unknown>>(quem: string | "anon" | "dono", sql: string, params: unknown[] = []) {
  await db.exec("reset role; select set_config('request.jwt.claim.sub', '', false)");
  if (quem === "anon") await db.exec("set role anon");
  else if (quem !== "dono") await db.exec(`select set_config('request.jwt.claim.sub', '${quem}', false); set role authenticated`);
  try {
    return (await db.query<T>(sql, params)).rows;
  } finally {
    await db.exec("reset role");
  }
}
const falha = (quem: string, sql: string) => expect(como(quem, sql)).rejects.toThrow();

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SIMULACAO_SUPABASE);
  await db.exec(SCHEMA);
});

beforeEach(async () => {
  await db.exec("reset role; delete from auth.users;");
  await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values
    ('${ADMIN}', 'admin@x.com', '{"nome":"Dono"}'), ('${A}', 'a@x.com', '{"nome":"Cliente A"}'), ('${B}', 'b@x.com', '{}');
    update public.perfis set papel = 'admin', status = 'ativo', acesso_ate = null where id = '${ADMIN}';`);
});

describe("schema", () => {
  it("pode rodar de novo sem erro e sem perder dados (idempotente)", async () => {
    await como(A, "insert into public.analises (campanha, entradas) values ('mantida', '{}')");
    await db.exec(SCHEMA);
    await db.exec(SCHEMA);
    expect(await como("dono", "select campanha from public.analises")).toEqual([{ campanha: "mantida" }]);
    expect(await como("dono", `select papel from public.perfis where id = '${ADMIN}'`)).toEqual([{ papel: "admin" }]);
  });

  it("cadastro cria o perfil com 7 dias de teste e o nome limitado a 120 caracteres", async () => {
    await db.exec(`insert into auth.users (email, raw_user_meta_data) values ('novo@x.com', '{"nome":"${"n".repeat(200)}"}')`);
    const [p] = await como<{ status: string; papel: string; dias: number; tam: number }>("dono",
      "select status, papel, round(extract(epoch from acesso_ate - now()) / 86400)::int as dias, char_length(nome) as tam from public.perfis where email = 'novo@x.com'");
    expect(p).toEqual({ status: "teste", papel: "cliente", dias: 7, tam: 120 });
  });

  it("trocar o e-mail do login atualiza o perfil", async () => {
    await db.exec(`update auth.users set email = 'a2@x.com' where id = '${A}'`);
    expect(await como(A, "select email from public.perfis")).toEqual([{ email: "a2@x.com" }]);
  });

  it("excluir o usuário apaga o perfil e todas as análises", async () => {
    await como(A, "insert into public.analises (campanha, entradas) values ('x', '{}')");
    await db.exec(`delete from auth.users where id = '${A}'`);
    expect(await como("dono", `select count(*)::int as n from public.analises where user_id = '${A}'`)).toEqual([{ n: 0 }]);
    expect(await como("dono", `select count(*)::int as n from public.perfis where id = '${A}'`)).toEqual([{ n: 0 }]);
  });

  it("atualizado_em muda a cada edição", async () => {
    const [{ id }] = await como<{ id: string }>(A, "insert into public.analises (campanha, entradas) values ('x', '{}') returning id");
    await db.exec(`update public.analises set atualizado_em = now() - interval '1 day' where id = '${id}'`);
    await como(A, `update public.analises set campanha = 'y' where id = '${id}'`);
    const [r] = await como<{ recente: boolean }>("dono", `select atualizado_em > now() - interval '1 minute' as recente from public.analises where id = '${id}'`);
    expect(r.recente).toBe(true);
  });
});

describe("perfis", () => {
  it("cliente só enxerga o próprio perfil", async () => {
    expect(await como(A, "select id from public.perfis")).toEqual([{ id: A }]);
  });
  it("cliente muda o próprio nome, mas não o de outra pessoa", async () => {
    await como(A, "update public.perfis set nome = 'Novo'");
    await como(A, `update public.perfis set nome = 'hack' where id = '${B}'`);
    expect(await como("dono", "select id, nome from public.perfis where id in ($1, $2) order by id", [A, B])).toEqual([{ id: A, nome: "Novo" }, { id: B, nome: "" }]);
  });
  it.each(["papel = 'admin'", "status = 'ativo'", "acesso_ate = null", "observacao = 'x'", "email = 'z@x.com'"])(
    "cliente não consegue alterar %s",
    async (campo) => falha(A, `update public.perfis set ${campo} where id = auth.uid()`)
  );
  it("cliente não cria nem apaga perfis", async () => {
    await falha(A, `insert into public.perfis (id) values ('${A}')`);
    await falha(A, "delete from public.perfis");
  });
});

describe("análises: isolamento entre clientes", () => {
  beforeEach(async () => {
    await como(A, "insert into public.analises (campanha, entradas, nota, gargalo) values ('da A', '{}', 80, 'Cliques')");
  });

  it("cada cliente vê só as suas", async () => {
    expect(await como(B, "select * from public.analises")).toEqual([]);
    expect((await como(A, "select campanha from public.analises")).length).toBe(1);
  });
  it("outro cliente não edita nem apaga", async () => {
    await como(B, "update public.analises set campanha = 'hack'");
    await como(B, "delete from public.analises");
    expect(await como("dono", "select campanha from public.analises")).toEqual([{ campanha: "da A" }]);
  });
  it("ninguém cria análise em nome de outro", async () => {
    await falha(B, `insert into public.analises (user_id, campanha, entradas) values ('${A}', 'hack', '{}')`);
  });
  it("cliente não move a própria análise para outra conta", async () => {
    await falha(A, `update public.analises set user_id = '${B}'`);
  });
  it("admin lê as análises dos clientes (suporte), mas não edita", async () => {
    expect((await como(ADMIN, "select campanha from public.analises")).length).toBe(1);
    await como(ADMIN, "update public.analises set campanha = 'admin mexeu'");
    expect(await como("dono", "select campanha from public.analises")).toEqual([{ campanha: "da A" }]);
  });
  it("visitante sem login não acessa nada", async () => {
    await falha("anon", "select * from public.analises");
    await falha("anon", "select * from public.perfis");
    await falha("anon", "select public.tem_acesso()");
  });
});

describe("assinatura vencida ou bloqueada", () => {
  it("vencido: não cria nem edita, mas ainda lê e apaga as suas", async () => {
    await como(A, "insert into public.analises (campanha, entradas) values ('antes', '{}')");
    await db.exec(`update public.perfis set acesso_ate = now() - interval '1 day' where id = '${A}'`);
    expect(await como(A, "select public.tem_acesso() as ok")).toEqual([{ ok: false }]);
    await falha(A, "insert into public.analises (campanha, entradas) values ('depois', '{}')");
    await como(A, "update public.analises set campanha = 'editada'");
    expect(await como(A, "select campanha from public.analises")).toEqual([{ campanha: "antes" }]);
    await como(A, "delete from public.analises");
    expect(await como("dono", "select count(*)::int as n from public.analises")).toEqual([{ n: 0 }]);
  });
  it("bloqueado (inativo) não cria análise", async () => {
    await db.exec(`update public.perfis set status = 'inativo' where id = '${A}'`);
    await falha(A, "insert into public.analises (campanha, entradas) values ('x', '{}')");
  });
});

describe("limites de tamanho e valores", () => {
  it.each([
    ["campanha com mais de 120 caracteres", `insert into public.analises (campanha, entradas) values (repeat('x', 121), '{}')`],
    ["nota acima de 100", `insert into public.analises (entradas, nota) values ('{}', 101)`],
    ["nota negativa", `insert into public.analises (entradas, nota) values ('{}', -1)`],
    ["gargalo desconhecido", `insert into public.analises (entradas, gargalo) values ('{}', 'Frete')`],
    ["entradas gigantes", `insert into public.analises (entradas) values (jsonb_build_object('x', repeat(md5(random()::text), 400)))`],
    ["nome com mais de 120 caracteres", `update public.perfis set nome = repeat('x', 121)`],
  ])("recusa %s", async (_n, sql) => falha(A, sql));

  it("limite de 2.000 análises por conta", async () => {
    await db.exec(`insert into public.analises (user_id, entradas) select '${A}', '{}' from generate_series(1, 2000)`);
    await expect(como(A, "insert into public.analises (entradas) values ('{}')")).rejects.toThrow("Limite de análises");
  });
});

describe("funções do painel admin", () => {
  it("listar usuários traz contagem de análises e último acesso", async () => {
    await como(A, "insert into public.analises (entradas) values ('{}'), ('{}')");
    const linhas = await como<{ email: string; total_analises: number }>(ADMIN, "select email, total_analises::int from public.admin_listar_usuarios() order by email");
    expect(linhas).toEqual([{ email: "a@x.com", total_analises: 2 }, { email: "admin@x.com", total_analises: 0 }, { email: "b@x.com", total_analises: 0 }]);
  });
  it("admin libera, renova e anota", async () => {
    await como(ADMIN, `select public.admin_atualizar_usuario('${A}', 'cliente', 'ativo', now() + interval '30 days', '${"o".repeat(600)}')`);
    const [p] = await como<{ status: string; tam: number }>("dono", `select status, char_length(observacao) as tam from public.perfis where id = '${A}'`);
    expect(p).toEqual({ status: "ativo", tam: 500 });
  });
  it("admin não remove o próprio acesso de administrador", async () => {
    await expect(como(ADMIN, `select public.admin_atualizar_usuario('${ADMIN}', 'cliente', 'ativo', null, '')`)).rejects.toThrow("próprio acesso");
  });
  it("status ou papel inválido é recusado", async () => {
    await falha(ADMIN, `select public.admin_atualizar_usuario('${A}', 'cliente', 'vip', null, '')`);
    await falha(ADMIN, `select public.admin_atualizar_usuario('${A}', 'dono', 'ativo', null, '')`);
  });
  it("cliente não usa as funções de admin", async () => {
    await expect(como(A, "select * from public.admin_listar_usuarios()")).rejects.toThrow("Acesso negado");
    await expect(como(A, `select public.admin_atualizar_usuario('${A}', 'admin', 'ativo', null, '')`)).rejects.toThrow("Acesso negado");
  });
  it("funções internas dos gatilhos não podem ser chamadas pelo app", async () => {
    await falha(A, "select public.limitar_analises()");
  });
});

describe("regra de acesso: banco e app iguais", () => {
  const casos = (["cliente", "admin"] as const).flatMap((papel) =>
    (["teste", "ativo", "inativo"] as const).flatMap((status) => [null, -48, -1, 1, 240].map((horas) => ({ papel, status, horas })))
  );
  it(`tem_acesso() do banco = temAcesso() do app em ${casos.length} combinações`, async () => {
    for (const c of casos) {
      const ate = c.horas == null ? null : new Date(Date.now() + c.horas * 3_600_000).toISOString();
      await db.query("update public.perfis set papel = $1, status = $2, acesso_ate = $3 where id = $4", [c.papel, c.status, ate, B]);
      const [{ ok }] = await como<{ ok: boolean }>(B, "select public.tem_acesso() as ok");
      expect({ ...c, ok }).toEqual({ ...c, ok: temAcesso({ papel: c.papel, status: c.status, acesso_ate: ate }) });
    }
  });
});
