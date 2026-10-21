# Análise ADS

Nome provisório: o produto ainda não tem marca própria (ver "Decisões pendentes").

## Problema e objetivo

Vendedores do Mercado Livre investem em Mercado Livre Ads sem saber onde a campanha está travando. Hoje eles olham os números soltos no painel do Mercado Livre ou dependem de um consultor. O produto transforma os números do período em um diagnóstico imediato: nota de 0 a 100, gargalo do funil e plano de ação priorizado, com histórico salvo.

O negócio é vender acesso a esse diagnóstico como SaaS: cada cliente com login próprio, acesso controlado por teste grátis e assinatura.

## Público e papéis

- **Cliente** (vendedor do Mercado Livre, inclusive mentorados): faz e salva análises das próprias campanhas, vê só os próprios dados, gerencia nome e senha.
- **Admin** (dono da plataforma): tudo do cliente, mais o painel `/admin` para liberar, renovar, bloquear, criar e excluir clientes, e ler análises de clientes para suporte (sem editar).

## Fluxos da versão atual

1. **Cadastro** com nome, e-mail e senha → confirmação por e-mail (configurável) → 7 dias de teste grátis.
2. **Login** com e-mail e senha; recuperação de senha por link no e-mail.
3. **Nova análise**: digita dias, investimento por dia, impressões, cliques, vendas, ROAS, TACOS (e opcionais: margem, envio, momento da conta) → recebe nota, gargalo, 6 indicadores, funil e plano de ação em checklist, atualizados a cada tecla.
4. **Salvar, editar, excluir, baixar PDF e copiar** uma análise; histórico em "Minhas análises".
5. **Acesso vencido** (teste ou plano) ou conta inativa → tela `/assinatura` com link de pagamento; os dados continuam guardados.
6. **Admin**: lista de clientes com situação, +30 dias, bloquear, editar vencimento/papel/anotação, criar cliente (senha provisória ou convite) e excluir conta.

## MVP (implementado)

Tudo dos fluxos acima. Regras do diagnóstico: `docs/REGRAS.md`.

## Fora do escopo atual

- Cobrança automática (webhook de pagamento). Hoje a liberação é manual pelo admin.
- Contas com equipe (vários usuários na mesma empresa).
- Importar números pela API do Mercado Livre.
- Login social, lembretes por e-mail, comparação de análises no tempo, edição de metas pelo admin.

Detalhes e opções de cada item: `docs/DECISOES.md`.

## Requisitos

- Isolamento total dos dados entre clientes, garantido no banco (RLS), não só na interface.
- Sem acesso válido, o cliente não cria nem edita análises (bloqueio no banco), mas consegue entrar, ver a tela de assinatura, trocar senha e sair.
- Interface em português do Brasil, utilizável no celular e no desktop, com tema claro e escuro automático.
- Acessibilidade: navegação por teclado, foco visível, rótulos em todos os campos.
- Dados pessoais (nome e e-mail) ficam no Supabase; para venda, é preciso política de privacidade (LGPD).

## Restrições e decisões técnicas

Next.js 16 (App Router) + React 19 + TypeScript, Supabase (Auth com JWT + Postgres com RLS) em vez de Drizzle/ORM próprio: o Supabase entrega login e segurança por linha sem back-end separado. Hospedagem: Vercel (front + funções) e Supabase. Detalhes: `docs/architecture.md`.

## Decisões pendentes

- **Nome e marca do produto.** Não usar o nome comercial da mentoria sem autorização nem "Mercado Livre" no nome.
- **Provedor de pagamento** para a cobrança automática (Hotmart, Kiwify, Mercado Pago ou Stripe).
- **Cadastro aberto ou só por convite.**
- **SMTP próprio** para e-mails em produção.

## Critérios de aceite

- Cliente A nunca vê, edita ou exclui dados do cliente B (testado nas políticas RLS).
- Cliente com acesso vencido é levado a `/assinatura` e não consegue salvar análise.
- Admin consegue renovar e bloquear, e o efeito vale na próxima requisição do cliente.
- Nota, gargalo e plano de ação seguem `docs/REGRAS.md` (12 testes em `tests/analise.test.ts`).
- `npm run check` passa.

## Próxima entrega

Escolher o provedor de pagamento e implementar o webhook que ativa/renova/bloqueia o cliente automaticamente (rota em `app/api/webhooks/`, usando `lib/supabase/admin.ts`).

## Manutenção

Atualize este documento quando objetivo, escopo, restrições ou critérios mudarem. Decisões técnicas detalhadas ficam em `docs/architecture.md`; evidências do setup em `docs/setup.md`.
