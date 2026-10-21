import { jsPDF } from "jspdf";
import { indicadores } from "./analise/analise";
import { brl, dec, int } from "./analise/formato";
import { LABEL, PRIO } from "./analise/regras";
import type { Acao, Resultado, Status } from "./analise/tipos";

type Cor = [number, number, number];
const COR: Record<Status | "ink" | "muted" | "line" | "accent" | "soft", Cor> = {
  good: [30, 133, 86], warn: [178, 111, 18], bad: [194, 67, 58], none: [90, 101, 121],
  ink: [21, 32, 54], muted: [90, 101, 121], line: [220, 226, 235], accent: [36, 87, 197], soft: [234, 239, 246],
};
const limpar = (t: string) => String(t).replace(/→/g, ">").replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

/** Gera o relatório em PDF (A4) de uma análise. Roda no navegador. */
export function gerarPdf(a: Resultado, acoes: Acao[], feitos: Record<string, boolean>, campanha: string): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 16, CW = W - 2 * M;
  let y = 0;
  const cor = (c: keyof typeof COR) => doc.setTextColor(...COR[c]);
  const fonte = (sz: number, st: "normal" | "bold" = "normal") => { doc.setFontSize(sz); doc.setFont("helvetica", st); };
  const espaco = (h: number) => { if (y + h > 282) { doc.addPage(); y = 18; } };
  const paragrafo = (t: string, sz: number, st: "normal" | "bold", c: keyof typeof COR, x = M, w = CW, lh = sz * 0.45) => {
    fonte(sz, st); cor(c);
    (doc.splitTextToSize(limpar(t), w) as string[]).forEach((l) => { espaco(lh); doc.text(l, x, y); y += lh; });
  };
  const secao = (t: string) => {
    y += 4; espaco(14); fonte(11.5, "bold"); cor("accent"); doc.text(limpar(t).toUpperCase(), M, y);
    y += 2; doc.setDrawColor(...COR.line); doc.setLineWidth(0.3); doc.line(M, y, W - M, y); y += 6;
  };
  const d = a.d;

  // Cabeçalho
  doc.setFillColor(...COR.ink); doc.rect(0, 0, W, 30, "F");
  fonte(16, "bold"); doc.setTextColor(255, 255, 255); doc.text("Análise de performance dos anúncios", M, 13);
  fonte(10); doc.setTextColor(205, 214, 228);
  doc.text(limpar((campanha ? campanha + "  ·  " : "") + "Mercado Livre Ads  ·  " + (a.dias ? int(a.dias) + " dias analisados  ·  " : "") + "Gerado em " + new Date().toLocaleDateString("pt-BR")), M, 21);
  y = 42;

  // Nota
  const score = a.score ?? 0;
  const s: Status = score >= 75 ? "good" : score >= 50 ? "warn" : "bad";
  doc.setDrawColor(...COR[s]); doc.setLineWidth(2.2); doc.circle(M + 11, y + 3, 10, "S");
  fonte(15, "bold"); cor("ink"); doc.text(String(score), M + 11, y + 5.2, { align: "center" });
  fonte(7); cor("muted"); doc.text("de 100", M + 11, y + 18.5, { align: "center" });
  const vx = M + 28, vw = CW - 28, y0 = y; y -= 2;
  paragrafo(a.veredito, 11.5, "bold", "ink", vx, vw, 5.4);
  y += 1; fonte(9.5, "bold");
  if (a.gargalo) {
    const sg = a.gargalo === "Impressões" ? a.st.imp : a.gargalo === "Cliques" ? a.st.ctr : a.st.conv;
    cor(sg); doc.text(limpar("Gargalo: " + a.gargalo + ": " + a.gargaloAcao), vx, y);
  } else { cor("good"); doc.text("Funil sem gargalo", vx, y); }
  y = Math.max(y + 5, y0 + 22);

  // Resumo
  secao("Resumo do período");
  const caixas: [string, string][] = [
    ["Investido no período", a.invTotal != null ? brl(a.invTotal) : "–"],
    ["Vendas pelos anúncios", a.receita != null ? brl(a.receita) : "–"],
    ["Custo por venda", a.cpv != null ? brl(a.cpv) : "–"],
    ["Custo por clique", a.cpc != null ? brl(a.cpc) : "–"],
  ];
  const bw = (CW - 9) / 4; espaco(18);
  caixas.forEach(([k, v], i) => {
    const x = M + i * (bw + 3);
    doc.setFillColor(...COR.soft); doc.roundedRect(x, y - 4, bw, 16, 2, 2, "F");
    fonte(7.5, "bold"); cor("muted"); doc.text(k.toUpperCase(), x + 3, y + 1);
    fonte(11.5, "bold"); cor("ink"); doc.text(v, x + 3, y + 8);
  });
  y += 17;

  // Funil
  secao("Funil do anúncio");
  const etapas: [string, number | null, string, Status][] = [
    ["Impressões", d.imp, a.ipd != null ? int(a.ipd) + " por dia" : "", a.st.imp],
    ["Cliques", d.cli, a.ctr != null ? "CTR " + dec(a.ctr, 2) + "%" : "", a.st.ctr],
    ["Vendas", d.ven, a.conv != null ? "Conversão " + dec(a.conv, 1) + "%" : "", a.st.ven],
  ];
  const elos: [number | null, string, Status][] = [[a.ipc, "impressões por clique", a.st.ctr], [a.cpvd, "cliques por venda", a.st.conv]];
  const sw = 44, gap = (CW - 3 * sw) / 2; espaco(22);
  etapas.forEach(([nome, v, sub, st], i) => {
    const x = M + i * (sw + gap);
    doc.setDrawColor(...COR[st]); doc.setLineWidth(nome === a.gargalo ? 0.9 : 0.3); doc.roundedRect(x, y - 4, sw, 18, 2, 2, "S");
    doc.setFillColor(...COR[st]); doc.rect(x + 1, y - 4, sw - 2, 1.2, "F");
    fonte(7.5, "bold"); cor("muted"); doc.text(nome.toUpperCase(), x + 3, y + 1);
    fonte(13, "bold"); cor("ink"); doc.text(v == null ? "–" : int(v), x + 3, y + 7.5);
    fonte(7.5); cor("muted"); doc.text(limpar(sub), x + 3, y + 12);
    if (i < 2) {
      const [r, rl, rs] = elos[i]; const cx = x + sw + gap / 2;
      fonte(11, "bold"); cor(rs); doc.text(r != null && isFinite(r) ? dec(r, 1) : "–", cx, y + 3, { align: "center" });
      fonte(6.5, "bold"); cor("muted"); doc.text(rl, cx, y + 7.5, { align: "center", maxWidth: gap - 4 });
    }
  });
  y += 20;

  // Indicadores
  secao("Indicadores");
  const cx = [M, M + 70, M + 110, M + 150];
  fonte(8, "bold"); cor("muted");
  ["Indicador", "Seu número", "Meta", "Status"].forEach((h, i) => doc.text(h, cx[i], y));
  y += 2; doc.setDrawColor(...COR.line); doc.line(M, y, W - M, y); y += 5;
  indicadores(a).forEach((ind) => {
    espaco(8);
    fonte(9.5); cor("ink"); doc.text(limpar(ind.label), cx[0], y);
    fonte(9.5, "bold"); doc.text(limpar(ind.valor), cx[1], y);
    fonte(9.5); cor("muted"); doc.text(limpar(ind.meta), cx[2], y);
    doc.setFillColor(...COR[ind.status]); doc.circle(cx[3] + 1.4, y - 1.2, 1.4, "F");
    fonte(9.5, "bold"); cor(ind.status); doc.text(LABEL[ind.status], cx[3] + 4.5, y);
    y += 2.5; doc.setDrawColor(...COR.line); doc.line(M, y, W - M, y); y += 5;
  });

  // Plano de ação
  secao("Plano de ação");
  acoes.forEach((x, i) => {
    const [ps, pl] = PRIO[x.p]; espaco(20);
    fonte(8, "bold"); cor(ps); doc.text(pl.toUpperCase(), M, y); y += 4.5;
    paragrafo(i + 1 + ". " + x.t, 11, "bold", "ink", M, CW, 5);
    y += 0.5; paragrafo(x.w, 9, "normal", "muted", M, CW, 4.3); y += 1.5;
    const passos = (lista: string[]) => lista.forEach((t) => {
      const feito = !!feitos[x.t + "|" + t];
      const linhas = doc.splitTextToSize(limpar(t), CW - 8) as string[];
      espaco(linhas.length * 4.4 + 1);
      doc.setDrawColor(...COR.muted); doc.setLineWidth(0.3); doc.rect(M + 1, y - 2.9, 3, 3, "S");
      if (feito) { doc.setDrawColor(...COR.good); doc.setLineWidth(0.6); doc.line(M + 1.6, y - 1.4, M + 2.4, y - 0.5); doc.line(M + 2.4, y - 0.5, M + 3.6, y - 2.4); }
      fonte(9.2); cor(feito ? "muted" : "ink");
      linhas.forEach((l) => { doc.text(l, M + 7, y); y += 4.4; });
      y += 0.6;
    });
    if (x.s) passos(x.s);
    (x.groups ?? []).forEach((g) => { espaco(8); y += 1; fonte(9.5, "bold"); cor("ink"); doc.text(limpar(g.h), M + 1, y); y += 4.8; passos(g.s); });
    y += 4;
  });

  // Rodapé
  const n = doc.getNumberOfPages();
  for (let p = 1; p <= n; p++) {
    doc.setPage(p); fonte(7.5); cor("muted");
    doc.text(limpar("Referência de ADS: R$ 50,00 por dia com ROAS 10×. Faixas gerais para o Mercado Livre, podem variar por categoria."), M, 290);
    doc.text(p + " / " + n, W - M, 290, { align: "right" });
  }
  return doc;
}

export function nomeArquivoPdf(campanha: string) {
  const c = campanha.trim().replace(/[\\/:*?"<>|]+/g, "").slice(0, 60);
  return "Analise ADS" + (c ? " - " + c : "") + " - " + new Date().toISOString().slice(0, 10) + ".pdf";
}
