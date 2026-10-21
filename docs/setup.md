# Setup e evidências

## Origem e contexto

- Data: 21/10/2026.
- Toolkit: [vibe-coding-toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit), revisão `790a895` (18/10/2026), aplicado pelo prompt 12 (projeto existente).
- UI/UX: [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), CLI `ui-ux-pro-max-cli@2.15.0`.
- Cliente-alvo: Claude Code no Windows. Codex não é usado.
- Execução: instalação feita por um agente em ambiente Linux com acesso à pasta do projeto; comandos que precisam rodar no Windows ou dentro de uma sessão do Claude Code estão em "Pendências no seu computador".
- Política de subagentes: modelo da sessão; sem troca de provedor, proxy ou cobrança por API.
- Superpowers ainda não estava disponível no ambiente de instalação; o brainstorming foi feito pelo protocolo equivalente (perguntas sobre agente, backup e escopo, respondidas pelo usuário em 21/10/2026).
- Ponto de restauração: commit Git local `9bbb0b7` ("estado do projeto antes do vibe-coding-toolkit").

## Decisões

| Decisão | Motivo |
|---|---|
| Não aplicar os padrões de projeto novo (Drizzle, Tailwind, Zod, Pino) | O toolkit manda preservar a stack existente; Supabase + CSS puro já atendem |
| Skills em modo cópia (`--copy`) só para `claude-code` | Recomendação do toolkit para Windows (evita junctions com caminho absoluto) |
| Plugins declarados no projeto (`enabledPlugins` + `extraKnownMarketplaces`) | Não dá para rodar `/plugin install` de fora do Claude Code; o Claude Code oferece instalar ao abrir a pasta |
| Context7 e Chrome DevTools via `.mcp.json` (um método só) | Evita servidores duplicados com plugins |
| Proteção do `.env` por `permissions.deny` em vez de hook próprio | Mecanismo oficial e mais simples que um hook de script |
| Sem Biome | ESLint já cobre o lint; o toolkit recomenda formatter desligado em projeto existente, e Biome seria só duplicação |
| `ui-styling` removida do pacote UI/UX | Orientada a shadcn/Tailwind; induziria migração do CSS puro |

## Componentes

| Componente | Ação e motivo | Escopo | Estado e evidência |
|---|---|---|---|
| Claude Code | Pré-requisito | Usuário (Windows) | **Validado**: v2.1.305 |
| Superpowers | Plugin declarado | Projeto (`.claude/settings.json`) | **Validado** (21/10/2026): instalado em escopo de projeto e ativo no `/plugin list` do Claude Code v2.1.305 |
| Ponytail (`full`) | Plugin declarado + preferência no AGENTS.md | Projeto | **Validado** (21/10/2026): instalado em escopo de projeto e ativo no `/plugin list` do Claude Code v2.1.305 |
| Caveman | Plugin declarado + preferência no AGENTS.md | Projeto | **Validado** (21/10/2026): instalado em escopo de projeto e ativo no `/plugin list` do Claude Code v2.1.305 |
| Plugins oficiais `code-review`, `pr-review-toolkit`, `commit-commands`, `security-guidance` | Revisão de código/PR, commits e alertas de padrões inseguros | Projeto | **Validado** (21/10/2026): instalado em escopo de projeto e ativo no `/plugin list` do Claude Code v2.1.305 |
| Outros plugins oficiais (`feature-dev`, `hookify`, `claude-md-management`, `claude-code-setup`) | Não instalados: duplicam Superpowers ou o harness já escrito | — | Inaplicável |
| aia-harness | Não instalado: gera a mesma estrutura (agentes, regras, memória) já feita aqui; duplicaria o harness | — | Inaplicável |
| Subagentes em ondas | Regra copiada para `docs/rules/parallel-subagent-driven-development.md` e referenciada no AGENTS.md | Projeto | **Configurado** |
| RTK | Só existe em escopo global para Claude Code | Usuário | **Pendente**: instalar no Windows |
| Context7 | `.mcp.json` (HTTP, sem chave; limite compartilhado) | Projeto | **Aprovado** no Claude Code (`enabledMcpjsonServers` em `.claude/settings.local.json`); consulta real ainda não feita |
| Graphify | `.graphifyignore` + `graphify-out/` no `.gitignore`; CLI global via pipx | Projeto + usuário | **Validado** (21/10/2026): graphifyy[sql] 0.9.93 (pipx); `extract --code-only` gerou 278 nós e 551 arestas de 47 arquivos, incluindo `supabase/schema.sql`. Regenerar após mudanças estruturais com `$env:GRAPHIFY_NO_AUTO_REFRESH=1; graphify extract . --code-only --no-cluster` (incremental) |
| Obsidian | Não adotado: sem necessidade concreta; memória nativa basta | — | Inaplicável |
| Memória | CLAUDE.md → AGENTS.md → docs versionados; memória automática do Claude Code como complemento | Projeto | **Configurado** |
| Hooks | Nenhum hook próprio; proteção do `.env` por `permissions.deny` (vale para Read/Edit e comandos de arquivo do Bash, não para scripts que abrem o arquivo sozinhos). Hooks do RTK e do security-guidance vêm das próprias ferramentas | Projeto | **Configurado**: `.claude/settings.json` ativo; regras deny carregadas com os plugins |
| agent-browser | Pré-requisito do `next-dev-loop` | Usuário | **Instalado com ressalva**: 0.39.1 + Chrome 156. Todas as versões ≥ 0.31.1 exigem Node ≥ 24; a máquina está no Node 22.18 (aviso EBADENGINE). Atualizar o Node para 24 LTS se o `next-dev-loop` falhar |
| Chrome DevTools MCP | `.mcp.json` com `--isolated` (perfil temporário, sem sessões pessoais) e `--no-usage-statistics` | Projeto | **Aprovado** no Claude Code; uso real ainda não feito |
| Anthropic skills (skill-creator, document-skills) | Não instaladas: sem necessidade no projeto; o Claude Code já cria skills | — | Inaplicável |
| Codex | Não usado | — | Inaplicável |
| Skills Vercel (8) + `find-skills` | `npx skills add … --agent claude-code --copy` | Projeto | **Instalado**: `skills list` encontra todas; `skills-lock.json` |
| `next-dev-loop` | Next 16.4.2 ≥ 16.3 com Turbopack: compatível | Projeto | **Instalado**; uso real depende do agent-browser |
| `next-bundle-optimizer` | Auditoria de bundle (`next analyze`) | Projeto | **Instalado** |
| `supabase-postgres-best-practices` | Supabase é Postgres | Projeto | **Instalado** |
| `gh-fix-ci` | Não instalado: fluxo do Codex e sem GitHub Actions | — | Inaplicável (rever ao criar CI) |
| `differential-review` | Revisão de diffs sensíveis | Projeto | **Instalado** |
| Revisão de segurança (prompt 13) | Copiada para `docs/prompts/security-review.md` | Projeto | **Configurado sem execução** |
| shadcn | Não instalado: projeto usa CSS puro | — | Inaplicável |
| Sentry MCP | Não instalado: sem Sentry | — | Inaplicável |
| Harness2 (método nativo) | Procedimento registrado em `docs/quality.md` | Projeto | **Configurado**; sem comparação rodada (nenhuma falha observada) |
| ESLint quality gates | `eslint.config.mjs` + `eslint-rules/` (cópia byte a byte) + `eslint.typed.config.mjs` | Projeto | **Validado**: lint 0 problemas; self-check 3× ok; tipado 0 erros / 11 avisos (linha de base) |
| UI/UX Pro Max | `npx ui-ux-pro-max-cli@2.15.0 init --ai claude` | Projeto | **Instalado**: `search.py --design-system` executado com sucesso (Python 3) |
| Pacote UI/UX extra: `brand`, `design-system`, `design`, `banner-design`, `slides` | Mantidas para marca, tokens e materiais | Projeto | **Instalado** (`design` precisa de chave Gemini para gerar imagens) |
| `ui-styling` | Removida (shadcn/Tailwind) | — | Inaplicável |

Skills instaladas: 19, em `.claude/skills/` (cópias, sem links).

- Atualizar as 13 registradas em `skills-lock.json` (Vercel, Next, Supabase, Trail of Bits): `npx --yes skills@latest update --project --yes`.
- Atualizar o pacote UI/UX (6 skills, fora do `skills-lock.json`): `npx ui-ux-pro-max-cli@latest init --ai claude`. Esse comando recria a `ui-styling`; apague a pasta `.claude/skills/ui-styling` depois de atualizar.

Licenças das skills incluídas (o repositório é privado; ao redistribuir, mantenha as atribuições):

| Origem | Skills | Licença |
|---|---|---|
| nextlevelbuilder/ui-ux-pro-max-skill | ui-ux-pro-max, brand, design-system, design, banner-design, slides | MIT |
| vercel-labs/agent-skills | 8 skills Vercel | MIT declarado no SKILL.md de 4 delas; repositório sem LICENSE na raiz (as demais sem licença explícita) |
| vercel-labs/skills | find-skills | MIT |
| vercel/next.js | next-dev-loop, next-bundle-optimizer | MIT |
| supabase/agent-skills | supabase-postgres-best-practices | MIT |
| trailofbits/skills | differential-review | CC BY-SA 4.0 (atribuição; versões modificadas e redistribuídas usam a mesma licença) |

Scripts das skills que acessam rede ou fazem upload (nada roda sozinho; o AGENTS.md proíbe executar sem pedido): `deploy-to-vercel/resources/deploy.sh` empacota o projeto (sem `.env*`, `.git`, `node_modules`) e envia para a Vercel; `design/scripts/*/generate.py` usam a API do Gemini (`GEMINI_API_KEY`); `design-system/scripts/fetch-background.py` baixa imagens.

## Documentação criada

`PRODUCT.md`, `AGENTS.md`, `CLAUDE.md`, `docs/architecture.md`, `docs/design.md`, `docs/onboarding.md`, `docs/quality.md`, `docs/setup.md`. Mantidos como canônicos: `README.md`, `docs/DEPLOY.md`, `docs/DECISOES.md` (ideias e opções, referenciado pelo PRODUCT.md), `docs/REGRAS.md` (regras de negócio).

## Checks

| Item | Estado | Evidência |
|---|---|---|
| `npm run lint` | Validado | 0 problemas (antes do setup: não existia lint) |
| `npm run lint:typed` | Validado | 0 erros, 11 avisos `no-misused-promises` |
| `npm run typecheck` | Validado | sem erros (mesmo resultado de antes) |
| `npm run lint:rules` | Validado | `max-lines`, `no-direct-console`, `no-direct-data-access`: ok |
| `npm test` | Validado | 12/12 (igual a antes) |
| `npm run build` | Validado | build concluído (igual a antes) |
| `npm audit --omit=dev` | Validado | 0 vulnerabilidades |
| `npm audit` (completo) | Validado com ressalva | 5 *high* em `braces`, só no lint, sem correção publicada (ver `docs/quality.md`) |
| `npm run check` no Windows | Validado | 21/10/2026, PowerShell: lint, tipos, regras (3× ok), 12/12 testes e build concluídos |
| Plugins no Claude Code | Validado | `/plugin list`: 7 plugins, escopo projeto, todos *enabled* |
| MCPs no Claude Code | Validado parcialmente | os dois aprovados; status de conexão e consulta real ainda não observados |
| Execução local (`next start -p 3002`) | Validado parcialmente | `/login` e `/cadastro` 200; rotas logadas exigem `.env` (sem credenciais, o app mostra o erro de configuração). Fluxo completo com Supabase real: pendente, depende das suas credenciais |
| Reexecução sem duplicação | Revisão estática | skills em cópia com lock; `.mcp.json` com um servidor de cada; nenhum hook duplicado. Reinstalação completa não foi repetida |
| Teste de harness em sessão limpa | Validado | Claude Code (Opus 5.5) respondeu "comandos canônicos e skill de interface" a partir do AGENTS.md, com porta 3002 |

## Pendências no seu computador (Windows)

### 1. Arquivo `.claude/settings.json`

**Feito em 21/10/2026**: o usuário criou o arquivo e autorizou o preenchimento. Conteúdo de referência (para recriar ou comparar):

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.local)",
      "Read(./.env.*.local)",
      "Edit(./.env)",
      "Edit(./.env.local)",
      "Edit(./.env.*.local)"
    ]
  },
  "extraKnownMarketplaces": {
    "claude-plugins-official": {
      "source": { "source": "github", "repo": "anthropics/claude-plugins-official" }
    },
    "ponytail": {
      "source": { "source": "github", "repo": "DietrichGebert/ponytail" }
    },
    "caveman": {
      "source": { "source": "github", "repo": "JuliusBrussee/caveman" }
    }
  },
  "enabledPlugins": {
    "superpowers@claude-plugins-official": true,
    "ponytail@ponytail": true,
    "caveman@caveman": true,
    "code-review@claude-plugins-official": true,
    "pr-review-toolkit@claude-plugins-official": true,
    "commit-commands@claude-plugins-official": true,
    "security-guidance@claude-plugins-official": true
  }
}
```

Se preferir instalar os plugins à mão, dentro de uma sessão do Claude Code:

```
/plugin marketplace add anthropics/claude-plugins-official
/plugin install superpowers@claude-plugins-official
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
/plugin marketplace add JuliusBrussee/caveman
/plugin install caveman@caveman
/plugin install code-review@claude-plugins-official
/plugin install pr-review-toolkit@claude-plugins-official
/plugin install commit-commands@claude-plugins-official
/plugin install security-guidance@claude-plugins-official
```

### 2. Ferramentas globais (PowerShell)

```powershell
# Claude Code (instalador oficial)
irm https://claude.ai/install.ps1 | iex
claude --version

# Python 3 (necessário para a skill ui-ux-pro-max): instale por python.org e confira
python --version

# agent-browser (necessário para next-dev-loop)
npm i -g agent-browser
agent-browser install

# Graphify (pacote "graphifyy" com dois y; precisa de uv ou pipx)
uv tool install graphifyy
```

RTK: o toolkit só documenta instalação por Homebrew (macOS/Linux). No Windows, use o binário de release indicado no repositório oficial do RTK e depois rode `rtk init --global`. Cuidado: há pacotes chamados `rtk` em outros ecossistemas que são outra ferramenta.

### 3. Primeira sessão no projeto

1. Abra a pasta no VS Code e inicie o Claude Code (`claude`) na raiz.
2. Confie na pasta; aceite instalar os plugins do projeto; aprove os MCPs `context7` e `chrome-devtools`.
3. Verifique: `/plugin list` (7 plugins), `/mcp` (2 servidores conectados), `/skills` (19 skills do projeto).
4. Teste rápido do harness: peça "quais são os comandos canônicos do projeto e qual skill usar para revisar a interface?" A resposta deve vir do AGENTS.md (porta 3002, `npm run check`, `web-design-guidelines`/`ui-ux-pro-max`). Registre o resultado nesta tabela de checks.
5. Gerar o grafo (opcional), no Git Bash: `GRAPHIFY_NO_AUTO_REFRESH=1 graphify extract . --code-only --no-cluster`. No PowerShell: `$env:GRAPHIFY_NO_AUTO_REFRESH=1; graphify extract . --code-only --no-cluster`.

## Próxima entrega e manutenção

- Zerar os 11 avisos do lint tipado e subir a regra para `error`.
- Implementar a cobrança automática (ver `PRODUCT.md`).
- Para repetir ou atualizar este setup: rode de novo o prompt 12 do toolkit no Claude Code. Ele preserva personalizações e atualiza o que mudou.
