import type { Status, Tier } from "./tipos";

/**
 * Parâmetros de negócio. Mudou uma regra? Mude aqui e nos testes (tests/analise.test.ts).
 * Detalhes de cada regra em docs/REGRAS.md.
 */
export const META_ROAS = 10;          // ROAS objetivo de referência (10× = ACOS 10%)
export const REF_INV = 50;            // investimento de referência por dia (R$)
export const META_IMP_DIA = 1000;     // impressões por dia: bom a partir de
export const MIN_IMP_DIA = 300;       // abaixo disso é crítico
export const META_IPC = 100;          // impressões por clique: bom até
export const META_CPV = 10;           // cliques por venda: ideal (1 venda a cada 10 cliques)
export const META_TACOS = 5;          // TACOS bom até (%)
export const LIMITE_TACOS = 10;       // TACOS acima disso é crítico (%)
export const ROAS_ALTO_PARA_TACOS = 30; // ROAS objetivo para reduzir gasto quando TACOS > 10%
export const DIAS_APRENDIZADO = 7;

export const LABEL: Record<Status, string> = { good: "Bom", warn: "Atenção", bad: "Crítico", none: "Sem dado" };
export const PTS: Record<Exclude<Status, "none">, number> = { good: 100, warn: 55, bad: 15 };
export const PRIO: Record<1 | 2 | 3, [Status, string]> = {
  1: ["bad", "Prioridade alta"],
  2: ["warn", "Prioridade média"],
  3: ["good", "Oportunidade"],
};

/** Classificação por impressões por clique. */
export const TIERS: Tier[] = [
  { max: 50, faixa: "até 50", ctr: "2% ou mais", cls: "Excelente", acao: "Manter. Considerar aumentar o orçamento.", s: "good" },
  { max: 100, faixa: "51 a 100", ctr: "1% a 2%", cls: "Bom", acao: "Manter e monitorar.", s: "good" },
  { max: 200, faixa: "101 a 200", ctr: "0,5% a 1%", cls: "Aceitável", acao: "Alterar a foto de capa (ambientada, sem fundo branco).", s: "warn" },
  { max: 400, faixa: "201 a 400", ctr: "0,25% a 0,5%", cls: "Fraco", acao: "Alterar a foto de capa e comparar preço e frete com os concorrentes.", s: "bad" },
  { max: Infinity, faixa: "acima de 400", ctr: "menos de 0,25%", cls: "Crítico", acao: "Alterar a foto de capa; se não melhorar, reestruturar o anúncio.", s: "bad" },
];
