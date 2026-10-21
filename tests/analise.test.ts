import { describe, expect, it } from "vitest";
import { analisar, ENTRADAS_VAZIAS, indicadores, planoDeAcao } from "../lib/analise/analise";
import { num } from "../lib/analise/formato";
import type { Entradas } from "../lib/analise/tipos";

const base = (p: Partial<Entradas>): Entradas => ({ ...ENTRADAS_VAZIAS, dias: 30, inv: 50, imp: 60000, cli: 1200, ven: 120, roas: 12, tacos: 4, ...p });
const titulos = (e: Entradas) => planoDeAcao(analisar(e)).map((a) => a.t);

describe("num (formato brasileiro)", () => {
  it("lê milhar com ponto e decimal com vírgula", () => {
    expect(num("1.200")).toBe(1200);
    expect(num("6,5")).toBe(6.5);
    expect(num("R$ 1.234,56")).toBe(1234.56);
    expect(num("")).toBeNull();
  });
});

describe("cenário saudável", () => {
  it("nota 100, sem gargalo, sugere escalar", () => {
    const a = analisar(base({}));
    expect(a.score).toBe(100);
    expect(a.gargalo).toBeNull();
    expect(titulos(base({}))).toContain("Escale o que está funcionando");
  });
});

describe("impressões baixas", () => {
  it("menos de 300 por dia é crítico e é o gargalo", () => {
    const e = base({ imp: 6000, cli: 60, ven: 6 });
    const a = analisar(e);
    expect(a.st.imp).toBe("bad");
    expect(a.gargalo).toBe("Impressões");
    expect(titulos(e)[0]).toBe("Impressões baixas: revise o ADS e o SEO do anúncio");
  });
});

describe("cliques baixos", () => {
  it("400 impressões por clique = Fraco, ação: alterar foto de capa", () => {
    const e = base({ cli: 150, ven: 15 });
    const a = analisar(e);
    expect(a.ipc).toBe(400);
    expect(a.tier?.cls).toBe("Fraco");
    expect(a.gargalo).toBe("Cliques");
    expect(titulos(e)).toContain("Cliques baixos: altere a foto de capa");
  });
});

describe("muitas impressões e cliques, poucas vendas", () => {
  it("30 cliques por venda é crítico e gera oferta/frete", () => {
    const e = base({ ven: 40 });
    const a = analisar(e);
    expect(a.cpvd).toBe(30);
    expect(a.st.conv).toBe("bad");
    const p = planoDeAcao(a).find((x) => x.t.startsWith("Muitas impressões"));
    expect(p?.groups?.map((g) => g.h)).toEqual(["1. Oferta", "2. Frete"]);
  });
  it("ideal é 1 venda a cada 10 cliques", () => {
    expect(analisar(base({ ven: 120 })).st.conv).toBe("good"); // 10 cliques/venda
    expect(analisar(base({ ven: 80 })).st.conv).toBe("warn");  // 15
  });
  it("conta nova recomenda preço mais baixo no frete", () => {
    const p = planoDeAcao(analisar(base({ ven: 40, fase: "inicio" })));
    const frete = p.find((x) => x.groups)?.groups?.[1].s.join(" ");
    expect(frete).toContain("preço mais baixo");
  });
});

describe("TACOS acima de 10%", () => {
  it("manda subir o ROAS objetivo para 30× ou desligar a campanha", () => {
    const p = planoDeAcao(analisar(base({ tacos: 12 })));
    const acao = p.find((x) => x.t === "Diminua a dependência dos anúncios");
    expect(acao?.p).toBe(1);
    expect(acao?.s?.[0]).toContain("30×");
    expect(acao?.s?.[1]).toContain("desligue a campanha até o TACOS ficar abaixo de 5%");
  });
});

describe("ROAS e margem", () => {
  it("sem margem, meta é 10×", () => {
    expect(analisar(base({ roas: 10 })).st.roas).toBe("good");
    expect(analisar(base({ roas: 8 })).st.roas).toBe("warn");
    expect(analisar(base({ roas: 4 })).st.roas).toBe("bad");
  });
  it("com margem de 20%, mínimo é 5× e bom a partir de 7×", () => {
    expect(analisar(base({ margem: 20, roas: 4 })).st.roas).toBe("bad");
    expect(analisar(base({ margem: 20, roas: 6 })).st.roas).toBe("warn");
    expect(analisar(base({ margem: 20, roas: 7 })).st.roas).toBe("good");
  });
});

describe("indicadores", () => {
  it("anel: progresso para 'menor é melhor'", () => {
    const i = indicadores(analisar(base({ ven: 40 })));
    expect(i.find((x) => x.chave === "cpvd")?.progresso).toBeCloseTo(10 / 30);
    expect(i.find((x) => x.chave === "tacos")?.progresso).toBe(1.25);
  });
  it("menos de 3 números não gera nota", () => {
    expect(analisar({ ...ENTRADAS_VAZIAS, roas: 5, tacos: 3 }).score).toBeNull();
  });
});
