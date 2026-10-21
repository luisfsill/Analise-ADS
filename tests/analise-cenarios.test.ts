import { describe, expect, it } from "vitest";
import { analisar, chavePasso, ENTRADAS_VAZIAS, indicadores, planoDeAcao } from "../lib/analise/analise";
import { PTS, TIERS } from "../lib/analise/regras";
import type { Entradas } from "../lib/analise/tipos";

// Cenário saudável: 2.000 impressões/dia, 50 impressões por clique, 10 cliques por venda, ROAS 12×, TACOS 4%
const base = (p: Partial<Entradas> = {}): Entradas => ({ ...ENTRADAS_VAZIAS, dias: 30, inv: 50, imp: 60000, cli: 1200, ven: 120, roas: 12, tacos: 4, ...p });
const plano = (p: Partial<Entradas> = {}) => planoDeAcao(analisar(base(p)));
const acao = (p: Partial<Entradas>, titulo: string) => plano(p).find((a) => a.t.startsWith(titulo));
const passos = (p: Partial<Entradas>, titulo: string) => {
  const a = acao(p, titulo);
  return [...(a?.s ?? []), ...(a?.groups ?? []).flatMap((g) => g.s)].join(" ");
};

describe("métricas calculadas", () => {
  it("investido, receita, custo por clique e por venda, CTR e conversão", () => {
    const a = analisar(base());
    expect(a.invTotal).toBe(1500);
    expect(a.receita).toBe(18000);
    expect(a.cpc).toBe(1.25);
    expect(a.cpv).toBe(12.5);
    expect(a.ctr).toBe(2);
    expect(a.conv).toBe(10);
    expect(a.ipd).toBe(2000);
    expect(a.filled).toBe(6);
  });
  it("dias zero ou vazio não divide por zero", () => {
    for (const dias of [0, null]) {
      const a = analisar(base({ dias }));
      expect(a.dias).toBeNull();
      expect(a.invTotal).toBeNull();
      expect(a.ipd).toBeNull();
      expect(a.receita).toBeNull();
    }
  });
  it("sem cliques: impressões por clique infinitas e classificação Crítico", () => {
    const a = analisar(base({ cli: 0, ven: 0 }));
    expect(a.ipc).toBe(Infinity);
    expect(a.tier?.cls).toBe("Crítico");
    expect(a.conv).toBeNull();
    expect(acao({ cli: 0, ven: 0 }, "Cliques baixos")?.w).toContain("nenhum clique");
  });
  it("sem vendas: cliques por venda infinitos e vendas em estado crítico", () => {
    const a = analisar(base({ ven: 0 }));
    expect(a.cpvd).toBe(Infinity);
    expect(a.st.ven).toBe("bad");
    expect(a.st.conv).toBe("bad");
    const ind = indicadores(a).find((i) => i.chave === "cpvd");
    expect(ind?.valor).toBe("sem venda");
    expect(ind?.progresso).toBe(0);
  });
});

describe("faixas de impressões por clique (TIERS)", () => {
  it.each([
    [1200, "Excelente", "good"],
    [600, "Bom", "good"],
    [300, "Aceitável", "warn"],
    [299, "Fraco", "bad"],
    [150, "Fraco", "bad"],
    [149, "Crítico", "bad"],
  ])("%d cliques em 60.000 impressões = %s", (cli, cls, st) => {
    const a = analisar(base({ cli, ven: Math.round(cli / 10) }));
    expect(a.tier?.cls).toBe(cls);
    expect(a.st.ctr).toBe(st);
  });
  it("as faixas cobrem todos os valores, em ordem crescente", () => {
    expect(TIERS.map((t) => t.max)).toEqual([...TIERS.map((t) => t.max)].sort((x, y) => x - y));
    expect(TIERS.at(-1)?.max).toBe(Infinity);
  });
});

describe("impressões por dia", () => {
  it.each([
    [30000, "good"], // 1.000/dia
    [29970, "warn"], // 999/dia
    [9000, "warn"],  // 300/dia
    [8970, "bad"],   // 299/dia
  ])("%d impressões em 30 dias = %s", (imp, st) => {
    expect(analisar(base({ imp, cli: imp / 50, ven: imp / 500 })).st.imp).toBe(st);
  });
  it("impressões baixas (atenção) geram ação de prioridade média; críticas, alta", () => {
    expect(acao({ imp: 15000, cli: 300, ven: 30 }, "Impressões baixas")?.p).toBe(2);
    expect(acao({ imp: 6000, cli: 120, ven: 12 }, "Impressões baixas")?.p).toBe(1);
  });
  it("cita o investimento abaixo da referência e o Programa Decola para conta nova", () => {
    const t = passos({ imp: 6000, cli: 120, ven: 12, inv: 30, fase: "inicio" }, "Impressões baixas");
    expect(t).toMatch(/hoje o investimento é de R\$\s30,00 por dia/);
    expect(t).toContain("Programa Decola");
  });
});

describe("nota e veredito", () => {
  it("é a média dos pontos dos indicadores preenchidos", () => {
    const a = analisar(base({ tacos: 7 })); // 5 bons + 1 atenção
    expect(a.score).toBe(Math.round((5 * PTS.good + PTS.warn) / 6));
    expect(a.veredito).toContain("podem ser escalados");
  });
  it("nota alta com gargalo pede para resolver o gargalo antes de escalar", () => {
    const a = analisar(base({ cli: 300, ven: 120 }));
    expect(a.gargalo).toBe("Cliques");
    expect(a.score).toBeGreaterThanOrEqual(75);
    expect(a.veredito).toContain("resolva o gargalo");
  });
  it("nota entre 50 e 74: há pontos segurando o lucro", () => {
    const a = analisar({ ...ENTRADAS_VAZIAS, inv: 50, roas: 8, tacos: 7 });
    expect(a.score).toBe(55);
    expect(a.veredito).toContain("segurando o lucro");
  });
  it("nota abaixo de 50: ajustes urgentes", () => {
    const a = analisar({ ...ENTRADAS_VAZIAS, inv: 50, roas: 4, tacos: 12 });
    expect(a.score).toBe(15);
    expect(a.st.inv).toBe("bad"); // ROAS crítico derruba o investimento
    expect(a.veredito).toContain("ajustes urgentes");
  });
  it("sem dados: nada de nota, plano vazio", () => {
    const a = analisar(ENTRADAS_VAZIAS);
    expect(a.score).toBeNull();
    expect(a.veredito).toContain("Preencha pelo menos três números");
    expect(planoDeAcao(a)).toEqual([]);
  });
  it("gargalo segue a ordem do funil: impressões, depois cliques, depois vendas", () => {
    expect(analisar(base({ imp: 6000, cli: 30, ven: 1 })).gargalo).toBe("Impressões");
    expect(analisar(base({ cli: 150, ven: 5 })).gargalo).toBe("Cliques");
    expect(analisar(base({ ven: 50 })).gargalo).toBe("Vendas");
  });
});

describe("plano de ação", () => {
  it("vem ordenado da prioridade alta para a oportunidade", () => {
    const prios = plano({ imp: 6000, cli: 30, ven: 1, roas: 4, tacos: 12, dias: 5 }).map((a) => a.p);
    expect(prios.length).toBeGreaterThan(3);
    expect(prios).toEqual([...prios].sort());
  });
  it("menos de 7 dias: aguardar o aprendizado da campanha", () => {
    expect(acao({ dias: 5 }, "Aguarde o período de aprendizado")?.w).toContain("5 dia(s)");
    expect(acao({ dias: 7 }, "Aguarde o período de aprendizado")).toBeUndefined();
  });
  it("frete no Full: confere estoque e não manda liberar o Full", () => {
    const t = passos({ ven: 40, envio: "full" }, "Muitas impressões");
    expect(t).toContain("já está no Full");
    expect(t).not.toContain("liberar o Full");
  });
  it("frete no Flex: não manda ativar o Flex; Correios: manda ativar o Flex e liberar o Full", () => {
    expect(passos({ ven: 40, envio: "flex" }, "Muitas impressões")).not.toContain("Ative o Flex");
    const correios = passos({ ven: 40, envio: "correios" }, "Muitas impressões");
    expect(correios).toContain("Ative o Flex");
    expect(correios).toContain("liberar o Full");
  });
  it("poucas vendas sem impressões e cliques bons usa o outro título", () => {
    expect(acao({ cli: 300, ven: 10 }, "Poucas vendas para os cliques")).toBeDefined();
  });
  it("ROAS crítico pela margem explica o mínimo e o ACOS", () => {
    const a = acao({ margem: 20, roas: 4 }, "Ajuste a rentabilidade");
    expect(a?.p).toBe(1);
    expect(a?.w).toContain("mínimo de 5×");
    expect(a?.s?.join(" ")).toContain("abaixo de 20%");
  });
  it("ROAS em atenção gera ajuste fino; TACOS em atenção gera acompanhamento", () => {
    expect(acao({ roas: 8 }, "Ajuste fino da rentabilidade")?.p).toBe(2);
    expect(acao({ tacos: 7 }, "Acompanhe o TACOS")?.p).toBe(2);
  });
  it("não sugere escalar quando há indicador crítico", () => {
    expect(acao({ tacos: 12 }, "Escale")).toBeUndefined();
    expect(acao({ ven: 20 }, "Escale")).toBeUndefined();
  });
  it("rotina semanal aparece com 3 ou mais indicadores", () => {
    expect(acao({}, "Rotina semanal")).toBeDefined();
    expect(planoDeAcao(analisar({ ...ENTRADAS_VAZIAS, roas: 12, tacos: 4 })).map((a) => a.t)).not.toContain("Rotina semanal de ADS");
  });
  it("chave do passo é estável (título + passo)", () => {
    const a = plano()[0];
    expect(chavePasso(a, "x")).toBe(a.t + "|x");
  });
});

describe("indicadores (anéis e PDF)", () => {
  it("são sempre seis, na ordem da tela", () => {
    expect(indicadores(analisar(ENTRADAS_VAZIAS)).map((i) => i.chave)).toEqual(["inv", "ipd", "ipc", "cpvd", "roas", "tacos"]);
  });
  it("vazios mostram traço e não têm progresso", () => {
    for (const i of indicadores(analisar(ENTRADAS_VAZIAS))) {
      expect(i.valor).toBe("–");
      expect(i.progresso).toBeNull();
      expect(i.status).toBe("none");
    }
  });
  it("valores formatados e metas", () => {
    const i = Object.fromEntries(indicadores(analisar(base())).map((x) => [x.chave, x]));
    expect(i.inv.valor).toMatch(/^R\$\s50$/);
    expect(i.ipd.valor).toBe("2.000");
    expect(i.ipc.valor).toBe("50");
    expect(i.cpvd.valor).toBe("10");
    expect(i.roas.valor).toBe("12×");
    expect(i.tacos.valor).toBe("4%");
    expect(i.ipc.progresso).toBe(2); // metade da meta de 100 = dobro do necessário
  });
  it("com margem, a meta do ROAS passa a ser 1,4 × o mínimo da margem", () => {
    const roas = indicadores(analisar(base({ margem: 20 }))).find((x) => x.chave === "roas");
    expect(roas?.meta).toBe("7× (pela margem)");
  });
  it("sem cliques mostra 'sem clique' com progresso zero", () => {
    const ipc = indicadores(analisar(base({ cli: 0, ven: 0 }))).find((x) => x.chave === "ipc");
    expect(ipc?.valor).toBe("sem clique");
    expect(ipc?.progresso).toBe(0);
  });
});
