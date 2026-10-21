# Regras de negócio

Tudo que está aqui está implementado em `lib/analise/regras.ts` (parâmetros) e `lib/analise/analise.ts` (cálculos e plano de ação), e coberto por `tests/analise.test.ts`, `tests/analise-cenarios.test.ts` e `tests/formato.test.ts`.

## Entradas

| Campo | Significado | Obrigatório |
|---|---|---|
| Dias analisados | tamanho do período (7, 15, 30…) | sim |
| Investimento por dia | média gasta por dia em Ads (R$) | sim |
| Impressões | total do período | sim |
| Cliques | total do período | sim |
| Vendas | vendas pelos anúncios no período | sim |
| ROAS | vendas ÷ investimento (×) | sim |
| TACOS | investimento ÷ faturamento total da conta (%) | sim |
| Margem de lucro | % — muda a régua do ROAS | não |
| Modalidade de envio | Full, Correios/agência, Flex | não |
| Momento da conta | Início (conta nova) ou Em crescimento | não |

Os números aceitam o formato brasileiro: `1.200`, `6,5`, `R$ 50,00`. Texto inválido ou valor negativo conta como campo vazio (nenhum campo admite número negativo).

## Cálculos

| Indicador | Fórmula |
|---|---|
| Investido no período | investimento por dia × dias |
| Vendas pelos anúncios | investido × ROAS |
| Custo por clique | investido ÷ cliques |
| Custo por venda | investido ÷ vendas |
| Impressões por dia | impressões ÷ dias |
| CTR | cliques ÷ impressões × 100 |
| Impressões por clique | impressões ÷ cliques |
| Conversão | vendas ÷ cliques × 100 |
| Cliques por venda | cliques ÷ vendas |
| ROAS mínimo pela margem | 100 ÷ margem (ex.: margem 20% → 5×) |

## Faixas de status

| Indicador | Bom | Atenção | Crítico |
|---|---|---|---|
| Impressões por dia | 1.000 ou mais | 300 a 1.000 | abaixo de 300 |
| Impressões por clique | até 100 | 101 a 200 | acima de 200 |
| Cliques por venda | até 10 (ideal: 1 venda a cada 10 cliques) | 10 a 20 | acima de 20 |
| ROAS sem margem | 10× ou mais | 5× a 10× | abaixo de 5× |
| ROAS com margem | ≥ mínimo × 1,4 | entre o mínimo e mínimo × 1,4 | abaixo do mínimo |
| TACOS | até 5% | 5% a 10% | acima de 10% |
| Investimento por dia (cartão) | R$ 50 ou mais | abaixo de R$ 50 | — |

Na **nota**, o investimento segue outra regra: é crítico se o ROAS for crítico; atenção se estiver abaixo de R$ 50 por dia; bom se o ROAS for bom e o TACOS não for crítico; atenção nos demais casos.

### Classificação por impressões por clique

| Impressões por clique | CTR | Classificação | Ação |
|---|---|---|---|
| até 50 | 2% ou mais | Excelente | Manter. Considerar aumentar o orçamento. |
| 51 a 100 | 1% a 2% | Bom | Manter e monitorar. |
| 101 a 200 | 0,5% a 1% | Aceitável | Alterar a foto de capa (ambientada, sem fundo branco). |
| 201 a 400 | 0,25% a 0,5% | Fraco | Alterar a foto de capa e comparar preço e frete com os concorrentes. |
| acima de 400 | menos de 0,25% | Crítico | Alterar a foto de capa; se não melhorar, reestruturar o anúncio. |

## Nota de 0 a 100

Média dos pontos dos indicadores que têm dado: Bom = 100, Atenção = 55, Crítico = 15. Entram investimento, impressões, cliques (CTR), conversão, ROAS e TACOS. Precisa de pelo menos 3 indicadores para gerar nota.

- 75 ou mais: "boa performance" (ou "resolva o gargalo antes de escalar", se houver gargalo)
- 50 a 74: "dão resultado, mas há pontos segurando o lucro"
- abaixo de 50: "precisam de ajustes urgentes"

## Gargalo (ordem do funil)

O primeiro problema na ordem abaixo é o gargalo:

1. **Impressões** em atenção ou crítico → revisar ADS e SEO do anúncio
2. **Cliques** (impressões por clique) em atenção ou crítico → alterar a foto de capa
3. **Vendas** (cliques por venda) em atenção ou crítico → oferta ou frete

## Plano de ação: o que fazer quando

| Situação | Ação |
|---|---|
| Menos de 7 dias de dados | Aguardar o período de aprendizado (mínimo 7, ideal 14 dias). |
| Impressões baixas | Revisar o ADS (referência R$ 50/dia com ROAS 10×); palavras-chave no AvantPro/JoomPulse; título com 60 caracteres; descrição de até 500 caracteres validada no AvantPro; anúncio ativo, com estoque e na campanha; Central de Promoções (e Programa Decola, se a conta for nova). |
| Cliques baixos | Alterar a foto de capa: ambientada, sem fundo branco, sem objeções nem texto, 1200 x 1540. Trocar uma coisa por vez e reavaliar em 7 dias. |
| Muitas impressões e cliques, poucas vendas | **Oferta:** mínimo 7 fotos e 2 clips, objeções em todas as fotos exceto a capa, promoção ativa, descrição e ficha perfeitas. **Frete:** se a oferta está perfeita, o produto não está no Full ou o frete dos Correios está caro e lento. Mais comum no início da conta, quando a estratégia é preço mais baixo, porque é um momento de investir. Ativar Flex; buscar o Full. |
| ROAS crítico | Refazer a precificação; ACOS objetivo abaixo da margem; pausar anúncios sem venda em 15 dias; concentrar verba nos melhores produtos. |
| ROAS em atenção | Tirar verba dos anúncios com ROAS abaixo da média; revisar preço; ajustar ACOS aos poucos. |
| TACOS acima de 10% | **Subir o ROAS objetivo da campanha para 30×** para gastar menos, ou **desligar a campanha até o TACOS ficar abaixo de 5%**. Revisar os anúncios pelo checklist; Central de Promoções; Full. |
| TACOS entre 5% e 10% | Acompanhar o faturamento total antes de aumentar o orçamento. |
| ROAS bom e sem críticos | Escalar: até +20% por semana nos melhores anúncios; garantir estoque; reforçar em datas fortes. |
| Sempre (com nota) | Rotina semanal: revisar 1 vez por semana; separar campanhas por objetivo; olhar ROAS, TACOS e estoque juntos. |

Prioridade: alta (vermelho), média (amarelo), oportunidade (verde). O plano é ordenado da mais alta para a mais baixa.

## Anéis de progresso

O anel mostra quanto da meta foi atingido (100% = meta batida):

- maior é melhor (investimento, impressões por dia, ROAS): valor ÷ meta
- menor é melhor (impressões por clique, cliques por venda, TACOS): meta ÷ valor

Metas: R$ 50/dia; 1.000 impressões/dia; até 100 impressões por clique; até 10 cliques por venda; ROAS 10× (ou mínimo da margem × 1,4); TACOS até 5%.
