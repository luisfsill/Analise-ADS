# Preparação local

## Pré-requisitos

| Ferramenta | Para quê | Verificar |
|---|---|---|
| Node.js ≥ 20.9 e npm (recomendado 24 LTS, exigido pelo agent-browser) | rodar o projeto | `node -v` |
| Git | versão e histórico local | `git --version` |
| Conta no Supabase | banco e login | — |
| Python 3 | scripts da skill `ui-ux-pro-max` (no Windows o comando é `python`) | `python --version` |
| Claude Code | usar skills, plugins e MCPs do projeto | `claude --version` |

Ferramentas globais opcionais do toolkit (RTK, Graphify, agent-browser): ver `docs/setup.md`, seção "Pendências no seu computador".

## Primeira execução

```bash
npm install
npm run dev
```

Abra http://localhost:3002. A porta é fixa no script `dev`.

### Variáveis de ambiente

Preencha o arquivo `.env` (modelo comentado em `.env.example`). O `.env` não vai para o Git.

| Variável | Onde obter | Obrigatória |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase › Project Settings › Data API › Project URL | sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase › Project Settings › API Keys › chave publishable (`sb_publishable_…`) ou anon | sim |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3002` local; domínio da Vercel em produção | recomendada (sem ela, os links de e-mail usam o endereço aberto no navegador) |
| `NEXT_PUBLIC_LINK_ASSINATURA` | seu link de checkout/WhatsApp | não |
| `SUPABASE_SERVICE_ROLE_KEY` | API Keys › secret (`sb_secret_…`) ou service_role. Nunca com `NEXT_PUBLIC_` | não (libera criar/excluir clientes no admin) |

Depois de mudar o `.env`, reinicie o `npm run dev`.

## Banco de dados

1. Supabase › SQL Editor › cole `supabase/schema.sql` inteiro › Run. Pode rodar de novo a qualquer momento (idempotente).
2. Authentication › URL Configuration: Site URL `http://localhost:3002`; Redirect URLs `http://localhost:3002/auth/callback`.
3. Para testar sem e-mail: Authentication › Sign In / Providers › Email › desligar *Confirm email* (religar antes de produção).
4. Crie sua conta no app e vire admin no SQL Editor:

   ```sql
   update public.perfis set papel = 'admin', status = 'ativo', acesso_ate = null
   where email = 'seu-email@exemplo.com';
   ```

Não use o projeto Supabase de produção para testes destrutivos.

## Verificar

```bash
npm run check
```

Esperado: lint sem erros, tipos ok, self-check das regras com três linhas `ok`, 12 testes passando e build concluído. Nenhum desses passos precisa de credenciais reais do Supabase. O lint tipado (`npm run lint:typed`) roda à parte e hoje mostra 11 avisos conhecidos (ver `docs/quality.md`).

## Agentes

As instruções para agentes (`AGENTS.md`, `CLAUDE.md`), as skills (`.claude/skills/`), os plugins (`.claude/settings.json`) e os MCPs (`.mcp.json`) ficam só no computador de desenvolvimento, fora do Git. Para recriar em outra máquina, siga [setup.md](setup.md).

Ao abrir a pasta no Claude Code pela primeira vez: confie na pasta, aceite instalar os plugins do projeto e aprove os servidores MCP `context7` e `chrome-devtools`.

## Problemas conhecidos

- **Build fecha com `Next.js build worker exited with code: 3221226505` na etapa "Collecting page data"**: causa verificada em 21/10/2026, troca de versão do Node (22 → 24) com `node_modules` instalado na versão antiga. Solução: `Remove-Item -Recurse -Force node_modules`, `npm install` e `npm run build`. Sempre reinstale as dependências depois de trocar a versão do Node.

- **`npm install` muito lento ou travado ao copiar `node_modules` por outra máquina/VM**: causa verificada em 20/10/2026, cópia de ~17 mil arquivos pela ponte de pastas. Solução: rodar `npm install` direto no Windows.
- **Link do e-mail abre o modal de login com "O link expirou ou já foi usado"** (`/?entrar=1&erro=link`): o link expirou, já foi usado, ou foi aberto em outro navegador com o modelo de e-mail padrão (PKCE). Solução: usar os modelos com `token_hash` descritos em `docs/DEPLOY.md`.
