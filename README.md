# Análise de performance dos anúncios (SaaS)

App web para diagnosticar campanhas de **Mercado Livre Ads**, pronto para ser vendido para vários clientes. Cada cliente tem e-mail e senha próprios, vê só os próprios dados, e o dono da plataforma controla quem tem acesso pelo painel `/admin`.

O cliente digita os números do período e recebe na hora:

- uma nota de 0 a 100 e o **gargalo** do funil (impressões, cliques ou vendas);
- 6 indicadores em anéis de progresso (investimento, impressões por dia, impressões por clique, cliques por venda, ROAS e TACOS);
- um **plano de ação** em checklist, ordenado por prioridade;
- relatório em **PDF** e histórico de análises salvas.

Recursos de SaaS:

- cadastro com **teste grátis** (7 dias, configurável) ou criação de clientes pelo admin;
- bloqueio automático quando o teste/plano vence (tela de assinatura com link de pagamento);
- **painel admin**: lista de clientes, +30 dias, bloquear, vencimento, anotações, criar cliente com senha provisória ou convite, excluir conta;
- página **Minha conta** (nome, troca de senha, situação da assinatura);
- isolamento de dados por cliente garantido no banco (Row Level Security).

**Deploy:** veja [`docs/DEPLOY.md`](docs/DEPLOY.md). Só Vercel + Supabase, sem back-end separado.

Regras de negócio: [`docs/REGRAS.md`](docs/REGRAS.md). Decisões e próximos passos (cobrança automática etc.): [`docs/DECISOES.md`](docs/DECISOES.md).

Documentação do projeto:

| Documento | Conteúdo |
|---|---|
| [`PRODUCT.md`](PRODUCT.md) | produto, escopo, critérios de aceite, decisões pendentes |
| [`docs/architecture.md`](docs/architecture.md) | mapa do código, fronteiras, dados e decisões técnicas |
| [`docs/design.md`](docs/design.md) | sistema visual e acessibilidade |
| [`docs/onboarding.md`](docs/onboarding.md) | preparar e rodar localmente |
| [`docs/quality.md`](docs/quality.md) | checks, lint, testes e revisão de segurança |
| [`docs/setup.md`](docs/setup.md) | ferramentas de IA instaladas, evidências e pendências |

## Stack

| Parte | Tecnologia |
|---|---|
| Front e servidor | Next.js 16 (App Router) + React 19 + TypeScript |
| Login, banco e segurança | Supabase (Auth com e-mail e senha, Postgres com RLS) |
| PDF | jsPDF, gerado no navegador |
| Testes das regras | Vitest |
| Hospedagem sugerida | Vercel (front) + Supabase (banco), ambos com plano gratuito para começar |

## Rodar no computador

Requisitos: Node.js 20.9 ou mais novo e uma conta gratuita no [Supabase](https://supabase.com).

1. **Criar o projeto no Supabase.** Em *SQL Editor*, cole e rode o arquivo [`supabase/schema.sql`](supabase/schema.sql). Ele cria as tabelas `perfis` e `analises`, o gatilho que cria o perfil no cadastro e as regras de segurança.
2. **Configurar a autenticação.** Em *Authentication > URL Configuration*, coloque `http://localhost:3002` em *Site URL* e adicione `http://localhost:3002/auth/callback` em *Redirect URLs*. A confirmação de e-mail vem ligada por padrão; para testes locais dá para desligar em *Authentication > Providers > Email*.
3. **Variáveis de ambiente.** Preencha o arquivo `.env` (modelo comentado em `.env.example`) com a URL e as chaves de *Project Settings > API Keys*.
4. **Instalar e rodar:**

   ```bash
   npm install
   npm run dev
   ```

   Abra http://localhost:3002, crie uma conta e faça a primeira análise.

## Comandos

```bash
npm run dev         # desenvolvimento em http://localhost:3002
npm run check       # lint + tipos + regras de lint + testes + build
npm run lint        # ESLint (presets do Next + limite de 350 linhas)
npm run lint:typed  # lint com tipos (promises), separado por ser mais lento
npm run typecheck   # checagem de tipos
npm test            # testes das regras de negócio (tests/analise.test.ts)
npm run build       # build de produção
npm start           # servir o build
```

## Publicar

Passo a passo completo em [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Estrutura

```
app/
  apresentacao/                 landing pública; entrar, criar conta e recuperar senha num modal
  (legal)/termos, privacidade   Termos de Uso e Política de Privacidade (dados do responsável em lib/legal.ts)
  redefinir-senha               nova senha depois do link de recuperação
  auth/callback/route.ts       recebe os links enviados por e-mail
  assinatura                   tela de teste/plano vencido
  (app)/layout.tsx             área logada: exige login + acesso válido; faixa de teste grátis
  (app)/admin                  painel do dono: clientes, acesso, criar/excluir contas
  (app)/conta                  minha conta: nome, senha, situação
  (app)/page.tsx               histórico: "Minhas análises"
  (app)/analise/nova           nova análise
  (app)/analise/[id]           análise salva (editar, baixar PDF, excluir)
components/
  Analisador.tsx               o painel inteiro (números, nota, indicadores, funil, plano)
  BotaoSair.tsx
lib/
  analise/regras.ts            PARÂMETROS DE NEGÓCIO (metas, faixas, tabela de impressões por clique)
  analise/analise.ts           cálculo, status, nota, gargalo, plano de ação e indicadores (funções puras)
  analise/tipos.ts             tipos de dados
  analise/formato.ts           leitura de números no padrão brasileiro e formatação
  pdf.ts                       relatório em PDF
  supabase/                    clientes do Supabase (navegador, servidor e serviço/admin)
  acesso.ts, regras-acesso.ts  quem tem acesso (mesma regra do banco)
  env.ts                       variáveis de ambiente
proxy.ts                       protege as rotas: quem não está logado vai para /login
supabase/schema.sql            banco e regras de segurança
tests/analise.test.ts          testes das regras
```

## Onde mexer

- **Mudar uma meta ou faixa** (por exemplo, a referência de R$ 50/dia ou o ROAS 10×): `lib/analise/regras.ts`. Ajuste também o teste correspondente em `tests/analise.test.ts` e a tabela em `docs/REGRAS.md`.
- **Mudar um texto do plano de ação:** `planoDeAcao()` em `lib/analise/analise.ts`. Os passos marcados como feitos são guardados pelo texto do título + passo (`chavePasso`). Se mudar um texto, as marcações antigas daquele passo deixam de aparecer.
- **Visual:** `app/globals.css`. As cores ficam em variáveis no topo, com tema claro e escuro.

## Perfis e acesso

- `cliente`: vê e edita só as próprias análises, enquanto o teste/plano estiver válido.
- `admin`: acesso ao painel `/admin`. O primeiro admin é definido por SQL (veja `docs/DEPLOY.md`, passo 3); os próximos podem ser promovidos pelo painel.

## O que já foi verificado

- `npm run build` e `npm run typecheck` sem erros, `npm test` com os 12 testes das regras passando, `npm audit` sem vulnerabilidades.
- `supabase/schema.sql` executado duas vezes seguidas num Postgres 16 com simulação do Supabase (idempotente), e as regras de segurança testadas: cliente não vê dados de outro, não muda o próprio papel/status/vencimento, não grava com acesso vencido; visitante sem login não acessa nada; admin lista e atualiza clientes e não consegue remover o próprio admin.
- Telas da área logada, admin e assinatura renderizadas e conferidas com um Supabase simulado.
- **Falta testar com o Supabase real:** e-mails de confirmação, convite e recuperação de senha (dependem dos modelos de e-mail e do SMTP, veja `docs/DEPLOY.md`).
