@AGENTS.md

## Claude Code

- Plugins, marketplaces e proteções do `.env` do projeto ficam em `.claude/settings.json` (criado manualmente; conteúdo em `docs/setup.md`, "Pendências no seu computador"); servidores MCP (Context7, Chrome DevTools) em `.mcp.json`. Ao abrir o projeto pela primeira vez, aceite confiar na pasta e aprovar os servidores MCP.
- Skills do projeto em `.claude/skills/`, instaladas em modo cópia (Windows). As de Vercel, Next, Supabase e Trail of Bits estão em `skills-lock.json` e atualizam com `npx --yes skills@latest update --project --yes`; o pacote UI/UX Pro Max é gerenciado pelo `ui-ux-pro-max-cli` (ver `docs/setup.md`).
- Memória: este arquivo + `AGENTS.md` + docs versionados. A memória automática do Claude Code é complementar; fatos duráveis do projeto vão para o documento responsável.
