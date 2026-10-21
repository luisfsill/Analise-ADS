export type Status = "good" | "warn" | "bad" | "none";
export type Envio = "" | "full" | "correios" | "flex";
export type Fase = "" | "inicio" | "cresc";

/** Números digitados pelo usuário. `null` = campo vazio. */
export interface Entradas {
  dias: number | null;   // dias analisados
  inv: number | null;    // investimento médio por dia (R$)
  imp: number | null;    // impressões no período
  cli: number | null;    // cliques no período
  ven: number | null;    // vendas pelos anúncios no período
  roas: number | null;   // ROAS (×)
  tacos: number | null;  // TACOS (%)
  margem: number | null; // margem de lucro (%) — opcional
  envio: Envio;          // opcional
  fase: Fase;            // opcional
}

export interface Tier {
  max: number;
  faixa: string;
  ctr: string;
  cls: string;
  acao: string;
  s: Status;
}

export interface StatusPorIndicador {
  inv: Status;
  imp: Status;
  ctr: Status;
  conv: Status;
  roas: Status;
  tacos: Status;
  ven: Status;
}

export type Gargalo = "Impressões" | "Cliques" | "Vendas";

export interface Resultado {
  d: Entradas;
  dias: number | null;
  invTotal: number | null;
  ctr: number | null;       // %
  conv: number | null;      // %
  ipc: number | null;       // impressões por clique (Infinity = sem clique)
  cpvd: number | null;      // cliques por venda (Infinity = sem venda)
  ipd: number | null;       // impressões por dia
  cpc: number | null;
  cpv: number | null;
  receita: number | null;
  roasMin: number | null;   // ROAS mínimo pela margem
  tier: Tier | null;
  st: StatusPorIndicador;
  score: number | null;     // 0 a 100
  filled: number;           // quantos dos 6 indicadores da nota têm dado
  gargalo: Gargalo | null;
  gargaloAcao: string | null;
  veredito: string;
}

export interface GrupoDePassos {
  h: string;
  s: string[];
}

export interface Acao {
  p: 1 | 2 | 3; // 1 alta, 2 média, 3 oportunidade
  t: string;    // título
  w: string;    // por quê
  s?: string[]; // passos
  groups?: GrupoDePassos[];
}

export interface Indicador {
  chave: string;
  label: string;
  valor: string;
  status: Status;
  progresso: number | null; // 0..1+ (1 = meta batida)
  meta: string;
}
