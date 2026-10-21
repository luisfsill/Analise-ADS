# Análise ADS

SaaS de diagnóstico de campanhas de Mercado Livre Ads. Cada cliente tem login próprio e vê só os próprios dados; o dono gerencia o acesso em `/admin`.

## Produto e stack

- Produto, escopo e critérios: `PRODUCT.md`. Regras de negócio do diagnóstico: `docs/REGRAS.md`.
- Stack: Next.js 16.4 (App Router) + React 19 + TypeScript 5.9 (strict), npm, Node ≥ 20.9. Supabase (Auth + Postgres com RLS) via `@supabase/ssr`. CSS puro em `app/globals.css` (sem Tailwind/shadcn). jsPDF no navegador. Vitest.
- Mapa do código e decisões: `docs/architecture.md`. Interface: `docs/design.md`. Preparação local: `docs/onboarding.md`. Checks: `docs/quality.md`. Ferramentas e evidências do setup: `docs/setup.md`. Deploy: `docs/DEPLOY.md`.

## Comandos canônicos

- Instalar: `npm install`
- Desenvolver: `npm run dev` (porta 3002)
- Lint: `npm run lint`
- Lint tipado (async): `npm run lint:typed`
- Tipos: `npm run typecheck`
- Regras locais de lint (self-check): `npm run lint:rules`
- Testes: `npm test`
- Build: `npm run build`
- Verificar tudo: `npm run check` (lint + tipos + regras + testes + build; não publica nada)

## Restrições do projeto

- **Segurança está no banco.** Isolamento entre clientes, bloqueio por assinatura e papéis vivem nas políticas RLS e funções de `supabase/schema.sql`. Qualquer mudança de acesso altera o schema primeiro; a tela só reflete. `lib/regras-acesso.ts` espelha `tem_acesso()` e precisa continuar igual.
- `SUPABASE_SERVICE_ROLE_KEY` só em código de servidor (`lib/supabase/admin.ts`, server actions do admin), sempre depois de conferir `papel = 'admin'`. Nunca com prefixo `NEXT_PUBLIC_`.
- Não ler nem editar `.env`/`.env.local`. Variáveis novas vão em `.env.example` com comentário e em `docs/DEPLOY.md`.
- `schema.sql` é idempotente: pode rodar de novo sem perder dados. Mantenha assim. Não aplicar SQL em produção sem pedido explícito.
- Regras de negócio (metas, faixas, textos do plano) ficam em `lib/analise/`; ao mudar, atualizar `tests/analise.test.ts`, `docs/REGRAS.md` e `regras-plano-de-acao.json`.
- Textos da interface em português do Brasil. Não usar marcas de terceiros (nome comercial da mentoria, Mercado Livre) no nome do produto.
- Next 16: `cookies()` e `params` são assíncronos; o antigo middleware é `proxy.ts`.

## Acordos de trabalho

- Ler o código e as instruções relevantes antes de editar. Declarar suposições que afetam comportamento.
- Menor mudança completa; reutilizar padrões, componentes e dependências existentes. Sem abstrações ou features não pedidas.
- Preservar validação, tratamento de erro, segurança, acessibilidade e mudanças locais.
- Definir critério de aceite e rodar os checks relevantes; testar regras e regressões, não espelhar a implementação.
- Não transformar suposição em fato nem integração pendente em resultado simulado.
- Publicar, fazer push, mandar mensagens, gerar custos ou ações destrutivas exigem pedido explícito. Ter uma skill instalada não autoriza a ação dela.
- Atualizar o documento responsável junto com a mudança (comandos, schema, fronteiras, configuração).
- Trabalho que atravessa sessões: handoff curto com objetivo, estado verificado, checks, pendências e próxima ação. Ao retomar, conferir arquivos, Git e processos reais.

## Ferramentas

- **Superpowers:** usar as skills de processo proporcionais ao tamanho da tarefa (brainstorm, plano, debug sistemático, verificação antes de concluir).
- **Ponytail `full`:** menor solução completa, preservando requisitos, segurança e acessibilidade. `stop ponytail` desliga.
- **Caveman:** conversa concisa em português, com clareza; explicação completa quando pedida. Código, docs e commits em linguagem normal. `stop caveman` desliga.
- **Context7** (MCP em `.mcp.json`): consultar documentação atual de Next.js, Supabase, React etc. Resolver a biblioteca e perguntar um conceito por vez. Nunca enviar segredos nem código privado.
- **Chrome DevTools MCP** (`.mcp.json`): console, rede e desempenho da interface rodando em `localhost:3002`. Não usar sessões pessoais nem produção.
- **RTK:** com o hook ativo, não prefixar de novo; sem hook, prefixar comandos suportados. `rtk proxy <cmd>` para saída original.
- **Graphify:** usar o grafo existente (`graphify-out/`) para perguntas estruturais; respeitar `.graphifyignore`.
- **Modelos:** preservar o cliente, o modelo principal e a autenticação. Subagentes usam o modelo da sessão, salvo política autorizada. Não ativar proxies nem cobrança por API.

Verifique instalação e descoberta antes de depender de uma ferramenta; ver `docs/setup.md` para o estado real de cada uma.

## Skills do projeto (`.claude/skills/`)

- `ui-ux-pro-max`: design de telas, paletas, tipografia, layout, acessibilidade e revisão visual. Respeita o CSS puro e os tokens de `app/globals.css` (stack: Next.js, sem Tailwind). No Windows roda com `python` em vez de `python3`.
- `brand`, `design-system`, `design`, `banner-design`, `slides` (pacote UI/UX Pro Max): identidade de marca, tokens, logo/ícones (exige chave Gemini), banners e apresentações. Usar quando pedido; não substituem os tokens de `app/globals.css` sem decisão de redesign.
- `web-design-guidelines`: revisão de interface, teclado, foco, formulários e estados.
- `vercel-react-best-practices`: ao escrever ou revisar React/Next.js, dados e desempenho.
- `vercel-composition-patterns`: decisões concretas de composição e API de componentes.
- `vercel-react-view-transitions`: só quando transições forem pedidas.
- `writing-guidelines`: revisão de documentação e textos.
- `next-dev-loop`: feedback de runtime/navegador após mudanças em Next.js (exige agent-browser instalado).
- `next-bundle-optimizer`: auditoria de bundle baseada em medição.
- `supabase-postgres-best-practices`: antes de mexer em schema, SQL, RLS ou desempenho do banco. Preservar Supabase.
- `differential-review`: revisão de diffs sensíveis a segurança.
- `vercel-optimize`, `deploy-to-vercel`, `vercel-cli-with-tokens`: operações Vercel, só quando pedidas.
- `find-skills`: descobrir uma skill quando faltar uma capacidade concreta.
- Revisão de segurança completa: `docs/prompts/security-review.md` (somente leitura, relatório privado).

Instalar skills não executa suas ações. Não forçar animações, cache, deploy ou mudança de arquitetura só porque a skill existe.

## Git, delegação e revisão

- Sem hooks de Git, bloqueios de push ou exigência de branch. Checks são comandos explícitos.
- Delegar só quando isolamento de contexto, especialização ou paralelismo real justificarem. Protocolo de ondas paralelas: `docs/rules/parallel-subagent-driven-development.md`. Um escritor por arquivo; o coordenador cuida de lockfile, configuração compartilhada e integração; revisores são somente leitura.
- Revisão proporcional ao risco do diff; revisão independente em mudanças não triviais (plugins `code-review` / `pr-review-toolkit`). Terminar quando os achados relevantes estiverem resolvidos e os checks passarem.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
