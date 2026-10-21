# Código e arquitetura

## Stack real

| Parte | Tecnologia e versão |
|---|---|
| Framework | Next.js 16.4.2 (App Router, Turbopack), React 19.3.1, TypeScript 5.9 strict |
| Runtime | Node.js ≥ 20.9 (engines), npm, `package-lock.json` |
| Auth e banco | Supabase: Auth (e-mail + senha, JWT em cookies via `@supabase/ssr` 0.12), Postgres com RLS (`@supabase/supabase-js` 2.118) |
| Estilo | CSS puro, `app/globals.css`, tokens em variáveis CSS (claro/escuro) |
| PDF | jsPDF 4, gerado no navegador |
| Testes | Vitest 5 (regras de negócio) |
| Hospedagem | Vercel (`vercel.json`, região `gru1`) + Supabase |

Não há ORM nem servidor próprio: o acesso a dados é feito pelo cliente Supabase, e a autorização é das políticas RLS.

## Mapa do código

```
app/
  layout.tsx                    HTML raiz, fontes, metadados
  globals.css                   todos os estilos e tokens
  apresentacao/                 página pública de vendas (page.tsx + landing.css, escopo .lp); servida em "/" para visitantes
  login, cadastro, recuperar-senha, redefinir-senha   telas públicas (client components)
  assinatura/page.tsx           teste/plano vencido ou conta inativa
  auth/callback/route.ts        links de e-mail (token_hash ou code), redirect seguro
  (app)/layout.tsx              área logada: exige login + tem_acesso; faixa de teste
  (app)/page.tsx                histórico do próprio usuário
  (app)/analise/nova, [id]      painel de análise (somente leitura para admin vendo cliente)
  (app)/conta                   nome, senha, situação
  (app)/admin                   painel do dono + server actions (criar/excluir usuário)
  (app)/admin/usuario/[id]      análises de um cliente (suporte)
components/
  Analisador.tsx                painel inteiro (entrada, nota, indicadores, funil, plano, salvar/PDF)
  Anel.tsx                      anel de progresso dos indicadores (painel e prévia)
  PreviaAnalise.tsx             prévia estática do painel na apresentação (exemplo calculado pelas regras reais)
  BotaoSair.tsx
lib/
  analise/                      regras de negócio puras (regras.ts = parâmetros; analise.ts = cálculo)
  pdf.ts                        relatório PDF
  supabase/client.ts            cliente do navegador (chave pública)
  supabase/server.ts            cliente de servidor com cookies (age como o usuário)
  supabase/admin.ts             cliente com chave de serviço (ignora RLS; só servidor, só admin)
  acesso.ts / regras-acesso.ts  usuário atual + regra temAcesso (espelho de tem_acesso())
  env.ts                        variáveis de ambiente e mensagens de configuração
proxy.ts                        renova sessão e redireciona quem não está logado (ex-middleware)
supabase/schema.sql             tabelas, gatilhos, funções, RLS (idempotente)
tests/analise.test.ts           testes das regras
eslint-rules/, eslint*.mjs      quality gates (ver docs/quality.md)
```

## Fronteiras e fluxo

1. `proxy.ts` roda antes de cada página: renova a sessão Supabase e manda quem não está logado para `/?entrar=1`, a apresentação com o modal de login aberto (rotas públicas: cadastro, recuperar-senha, auth, apresentacao). Não existe página `/login`: o login é o modal `components/ModalLogin.tsx` com o card `components/CardLogin.tsx`. Visitante em `/` recebe a apresentação por rewrite (a URL continua `/`); logado em `/` vê o histórico.
2. `app/(app)/layout.tsx` (servidor) busca o perfil e redireciona para `/assinatura` sem acesso válido.
3. Páginas de servidor leem dados com `criarClienteServidor()`; componentes de cliente gravam com `criarClienteNavegador()`. Ambos agem **como o usuário** e passam pela RLS.
4. Só as server actions de `app/(app)/admin/actions.ts` usam `criarClienteServico()`, depois de `exigirAdmin()`.
5. A camada final de autorização é o banco: mesmo que a interface falhe, `analises_criar`/`analises_editar` exigem `tem_acesso()`, e perfis só permitem `update (nome)` ao próprio usuário.

## Dados

- `perfis` (1 por usuário Auth): email, nome, papel (`cliente`/`admin`), status (`teste`/`ativo`/`inativo`), acesso_ate, observacao. Criado pelo gatilho `ao_criar_usuario` com `dias_de_teste()` (7).
- `analises`: user_id, campanha, entradas (jsonb), passos_feitos (jsonb), nota, gargalo. Limites de tamanho e de 2.000 por usuário.
- Funções: `eh_admin()`, `tem_acesso()`, `admin_listar_usuarios()`, `admin_atualizar_usuario(...)`, todas `security definer` com `search_path` vazio.
- "Migrações": `schema.sql` é idempotente e reaplicável no SQL Editor. Não há ferramenta de migração; mudanças de schema entram no mesmo arquivo, com `if not exists` / `drop ... if exists`.

## Decisões

| Decisão | Motivo | Alternativa | Revisitar quando |
|---|---|---|---|
| Supabase em vez de back-end próprio + ORM | Auth com JWT e RLS prontos; sem servidor para hospedar | Drizzle + Postgres + auth própria | Precisar de lógica pesada no servidor ou sair do Supabase |
| Autorização na RLS, interface só reflete | Defesa que não depende do front | Checagens só no servidor Next | Nunca enfraquecer; só estender |
| CSS puro, sem Tailwind/shadcn | Visual já pronto e enxuto; migrar seria refazer telas | Tailwind + shadcn/ui | Redesign completo |
| Next 14 → 16 (out/2026) | Next 14 sem suporte e com falhas críticas (inclusive bypass de middleware) | Ficar no 14 | — |
| Liberação manual de acesso | Provedor de pagamento não definido | Webhook de pagamento | Escolha do provedor (ver PRODUCT.md) |

## Manutenção

Atualize este mapa quando diretórios, dependências relevantes, contratos ou fronteiras mudarem.
