# Qualidade

## Comandos

| Comando | O que prova |
|---|---|
| `npm run lint` | ESLint 9 com presets oficiais do Next (`core-web-vitals` + `typescript`) e a regra local `quality/max-lines` (350) |
| `npm run lint:typed` | Gate assíncrono type-aware: `no-floating-promises` (error) e `no-misused-promises` (warn, linha de base 11) |
| `npm run typecheck` | `tsc --noEmit` com TypeScript strict |
| `npm run lint:rules` | Self-check das regras locais (`eslint-rules/`) com RuleTester: três linhas `ok` |
| `npm test` | Vitest: 12 testes das regras de negócio |
| `npm run build` | Build de produção do Next |
| `npm run check` | Todos acima, menos o lint tipado, em sequência. Não publica nada |

Rode `npm test` ao mexer em `lib/analise/`; `npm run check` antes de considerar uma entrega pronta.

## Regras base

- TypeScript strict e presets oficiais do Next.
- Limite de 350 linhas por arquivo (`quality/max-lines`, regra do toolkit, copiada byte a byte em `eslint-rules/`). Maior arquivo hoje: `components/Analisador.tsx`, 319 linhas.
- Autorização no banco (RLS); interface nunca é a única barreira.
- Chave de serviço só no servidor, depois de checar admin.
- Validação de entrada: limites de tamanho no banco (`analises_tamanhos`), regex de UUID nas rotas `[id]`, e-mail e senha validados nas server actions.
- Erros para o usuário sem detalhes internos; sem segredos em logs.
- Regras não usadas do toolkit, removidas por não existirem no projeto: `no-direct-data-access` (não há módulo de banco/ORM próprio) e `no-direct-console` (não há logger de servidor). Continuam no plugin local e passam no self-check.

## Adoção do lint tipado

Medido em 21/10/2026, em Linux com Node 22: lint padrão 5,4 s; lint tipado 9,2 s.

| Regra | Severidade | Violações | Plano |
|---|---|---|---|
| `@typescript-eslint/no-floating-promises` | error | 0 | manter |
| `@typescript-eslint/no-misused-promises` | warn | 11 | handlers `async` passados direto em `onSubmit`/`onClick` (FormConta, cadastro, login, recuperar-senha, redefinir-senha, Analisador ×4, BotaoSair). Corrigir envolvendo em `() => void fn()` ou tratando o retorno; voltar para `error` quando zerar |

O lint tipado fica fora do `npm run check` até zerar os avisos, para não misturar adoção com o gate existente.

## Estratégia de testes

- **Regras de negócio** (`lib/analise/`): testes unitários em `tests/analise.test.ts`. As regras foram comparadas com o protótipo original em 2.000 cenários aleatórios quando o app foi criado.
- **Segurança do banco**: as políticas RLS de `supabase/schema.sql` foram testadas em 20/10/2026 num Postgres 16 com simulação do Supabase (papéis, `auth.uid()`): isolamento entre clientes, bloqueio de autopromoção, bloqueio com acesso vencido, anon sem acesso, admin sem conseguir remover o próprio admin. Esse teste não está automatizado no repositório; repita ao mudar o schema.
- **Interface**: conferida manualmente com Supabase simulado. Não há suíte E2E.
- **Ainda não testado com Supabase real**: e-mails de confirmação, convite e recuperação.

Após mudanças em instruções, skills ou memória do agente, rode um caso curto de verificação (por exemplo, pedir ao Claude Code para listar os comandos canônicos e uma skill relevante) e registre o resultado em `docs/setup.md`.

### Método de melhoria do harness (adaptação Harness2)

Quando o agente falhar de forma recorrente: registrar a falha observada, propor uma mudança candidata (instrução, skill ou comando), comparar uma vez a linha de base com a candidata no mesmo caso e com os mesmos checks, e adotar só se melhorar sem afrouxar segurança ou permissões. Fonte: `docs/prompts/15-harness-improvement.md` e `docs/07-harness-evaluation.md` do toolkit (revisão `790a895`). Nenhuma comparação foi rodada ainda: não há falha observada.

## Revisão depois de implementar

Escopo de revisão pelo risco do diff. Mudanças não triviais: revisão independente (plugins `code-review`/`pr-review-toolkit`, ou subagente revisor somente leitura). Para autenticação, RLS, chave de serviço ou dados de clientes, incluir revisão de segurança. Terminar quando os achados relevantes estiverem resolvidos ou justificados e os checks afetados passarem.

## Revisão de segurança

- Prompt reutilizável: `docs/prompts/security-review.md` (cópia do prompt 13 do toolkit). Modo repositório (linha de base) ou modo diff.
- Somente leitura; relatório redigido salvo **fora** do repositório, nunca comitado.
- Para diffs: skill `differential-review`, com rastreio manual como alternativa.
- Rastrear entradas (formulários, rotas `[id]`, `auth/callback`, server actions) até operações sensíveis (RLS, chave de serviço, `perfis`).

## Dependências e entrega

- ESLint fica na 9.39.5 (tag `maintenance` do npm; o `npm install` mostra aviso de versão sem suporte). Motivo: `eslint-config-next@16.4.2` depende de `eslint-plugin-react`, `eslint-plugin-jsx-a11y` e `eslint-plugin-import`, que só aceitam ESLint até a 9. Revisitar quando uma versão estável do `eslint-config-next` aceitar ESLint 10.
- O npm do Windows avisa que `core-js` (mensagem de agradecimento) e `unrs-resolver` (checagem do binário nativo) têm scripts de instalação não aprovados. Não são necessários se `npm run check` passar.

- Auditoria de produção (`npm audit --omit=dev`) em 21/10/2026: **0 vulnerabilidades**.
- Auditoria completa: 5 alertas *high* em `braces` (via `eslint-config-next` › `@next/eslint-plugin-next` › `fast-glob` › `micromatch`), só em ferramenta de desenvolvimento e sem versão corrigida publicada. Risco: negação de serviço local no lint com padrões maliciosos; não chega à aplicação. Revisitar quando sair correção (`npm audit`).
- Sem hooks de Git, bloqueios de push ou exigência de branch. Atualize este documento junto com scripts e regras.
