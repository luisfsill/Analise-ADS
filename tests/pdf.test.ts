import { describe, expect, it } from "vitest";
import { analisar, chavePasso, ENTRADAS_VAZIAS, planoDeAcao } from "../lib/analise/analise";
import type { Entradas } from "../lib/analise/tipos";
import { gerarPdf, nomeArquivoPdf } from "../lib/pdf";

const entradas = (p: Partial<Entradas>): Entradas => ({ ...ENTRADAS_VAZIAS, dias: 30, inv: 50, imp: 60000, cli: 1200, ven: 120, roas: 12, tacos: 4, ...p });
const texto = (doc: ReturnType<typeof gerarPdf>) => doc.output();

describe("relatório em PDF", () => {
  it("gera um PDF válido com nota, campanha e rodapé", () => {
    const a = analisar(entradas({}));
    const doc = gerarPdf(a, planoDeAcao(a), {}, "Tenis de corrida");
    const t = texto(doc);
    expect(t.startsWith("%PDF-")).toBe(true);
    expect(t).toContain("(100)");
    expect(t).toContain("Tenis de corrida");
    expect(t).toContain("Funil sem gargalo");
    expect(t).toContain("1 / " + doc.getNumberOfPages());
  });

  it("cenário ruim: plano longo quebra em várias páginas, todas numeradas", () => {
    const a = analisar(entradas({ dias: 5, inv: 20, imp: 3000, cli: 10, ven: 0, roas: 2, tacos: 20, margem: 15, envio: "correios", fase: "inicio" }));
    const acoes = planoDeAcao(a);
    const doc = gerarPdf(a, acoes, {}, "");
    const n = doc.getNumberOfPages();
    expect(n).toBeGreaterThan(1);
    const t = texto(doc);
    for (let p = 1; p <= n; p++) expect(t).toContain(`${p} / ${n}`);
    expect(t).toContain("Gargalo: Impress");
  });

  it("passos marcados como feitos aparecem com o visto (mais linhas desenhadas)", () => {
    const a = analisar(entradas({ ven: 40 }));
    const acoes = planoDeAcao(a);
    const feitos = Object.fromEntries((acoes[0].s ?? acoes[0].groups![0].s).map((s) => [chavePasso(acoes[0], s), true]));
    const linhas = (d: ReturnType<typeof gerarPdf>) => (texto(d).match(/ l\n/g) ?? []).length;
    expect(linhas(gerarPdf(a, acoes, feitos, ""))).toBeGreaterThan(linhas(gerarPdf(a, acoes, {}, "")));
  });

  it("não quebra sem nota (campos vazios)", () => {
    const a = analisar(ENTRADAS_VAZIAS);
    expect(() => gerarPdf(a, [], {}, "")).not.toThrow();
  });
});

describe("nome do arquivo do PDF", () => {
  const hoje = new Date().toISOString().slice(0, 10);
  it("usa a campanha, sem caracteres proibidos no Windows", () => {
    expect(nomeArquivoPdf('  Tênis: "corrida" / out?  ')).toBe(`Analise ADS - Tênis corrida  out - ${hoje}.pdf`);
  });
  it("sem campanha fica só com a data; nome longo é cortado em 60 caracteres", () => {
    expect(nomeArquivoPdf("")).toBe(`Analise ADS - ${hoje}.pdf`);
    expect(nomeArquivoPdf("x".repeat(100))).toBe(`Analise ADS - ${"x".repeat(60)} - ${hoje}.pdf`);
  });
});
