# Decisões e próximos passos

## Como o SaaS funciona hoje

- Cada pessoa tem login próprio (e-mail + senha, Supabase Auth com JWT) e só enxerga as próprias análises. O isolamento é feito no banco (RLS), não só na tela.
- Papéis: `cliente` (padrão) e `admin` (dono da plataforma). O admin vê todos os clientes em `/admin` e pode ler as análises deles para suporte, mas não edita.
- Situação da conta: `teste`, `ativo` ou `inativo`, com data de vencimento opcional (`acesso_ate`).
  - Quem se cadastra sozinho ganha **7 dias de teste** (mude em `public.dias_de_teste()` no `schema.sql`; 0 = só entra depois que o admin liberar).
  - Teste ou plano vencido, ou conta inativa: o cliente vê a tela `/assinatura`, continua podendo entrar, trocar senha e sair, mas não cria nem edita análises (bloqueado no banco).
- O admin libera, renova (+30 dias), bloqueia, muda vencimento, papel e anotação. Com a chave secreta configurada, também cria clientes (senha provisória ou convite por e-mail) e exclui contas.

## Próximos passos sugeridos

### 1. Cobrança automática (o principal)
Hoje a liberação é manual pelo painel. Para automatizar, criar uma rota `app/api/webhooks/<provedor>/route.ts` que recebe o aviso de pagamento e atualiza `perfis.status`/`acesso_ate` usando o cliente de serviço (`lib/supabase/admin.ts`). Funciona na própria Vercel, sem back-end extra.

| Provedor | Observação |
|---|---|
| Hotmart / Kiwify / Eduzz | Comuns para infoprodutos; webhook com e-mail do comprador e status da assinatura. |
| Mercado Pago | Assinaturas (preapproval) + webhook; Pix e cartão. |
| Stripe | Melhor API e portal do cliente; Pix disponível no Brasil. |

Fluxo típico: compra aprovada → se o e-mail não existe, cria o usuário e manda convite → `status = 'ativo'`, `acesso_ate = fim do período pago`. Cancelamento/reembolso → `status = 'inativo'`.

### 2. Cadastro aberto ou só para quem comprou
- Aberto (padrão): qualquer pessoa testa por 7 dias. Bom para captar.
- Fechado: desligar *Allow new users to sign up* no Supabase e criar os clientes pelo painel ou pelo webhook.

### 3. Contas com equipe (multiempresa)
Se um cliente quiser colocar funcionários na mesma conta, criar a tabela `organizacoes` e `membros (organizacao_id, user_id, papel)`, adicionar `organizacao_id` em `analises` e trocar as políticas de `user_id = auth.uid()` para "é membro da organização". A estrutura atual não impede essa evolução.

### 4. Outras ideias
- Comparar análises da mesma campanha ao longo do tempo.
- Importar os números direto da API de Ads do Mercado Livre (OAuth do vendedor).
- Login com Google (só ativar o provedor no Supabase).
- Lembrete semanal por e-mail.
- Editar as metas de `lib/analise/regras.ts` pelo painel admin.

## Cuidados

- **LGPD**: Termos de Uso (`/termos`) e Política de Privacidade (`/privacidade`) publicados, com aceite obrigatório no cadastro (data e versão gravadas na conta). Dados do responsável em `lib/legal.ts` (nome e e-mail provisórios do Análise ADS; CNPJ e endereço pendentes); antes de vender, pedir revisão de um advogado. Ao mudar o texto, atualizar `VERSAO_TERMOS`/`VERSAO_PRIVACIDADE`.
- Os textos do plano de ação citam ferramentas de terceiros (AvantPro, JoomPulse) e recursos do Mercado Livre (Central de Promoções, Decola, Flex, Full). Os nomes e regras mudam com o tempo; revise periodicamente.
- Não usar marcas ou nomes de metodologias de terceiros no app sem autorização do dono.
- Plano gratuito do Supabase pausa o projeto após 7 dias sem nenhum acesso e não tem backup automático. Com clientes pagantes, vale o plano Pro.
