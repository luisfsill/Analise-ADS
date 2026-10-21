import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dataParaInput, inputParaFimDoDia } from "../lib/datas";
import { diasRestantes, temAcesso } from "../lib/regras-acesso";
import { ROTA_CADASTRO, ROTA_LOGIN, ROTA_RECUPERAR, telaDoParametro } from "../lib/rotas";

const AGORA = new Date("2026-10-21T12:00:00Z");
const daqui = (h: number) => new Date(AGORA.getTime() + h * 3_600_000).toISOString();

describe("temAcesso (espelho de tem_acesso() do banco)", () => {
  it.each([
    ["sem perfil", null, false],
    ["admin inativo e vencido continua entrando", { papel: "admin", status: "inativo", acesso_ate: daqui(-48) }, true],
    ["teste dentro do prazo", { papel: "cliente", status: "teste", acesso_ate: daqui(24) }, true],
    ["teste vencido", { papel: "cliente", status: "teste", acesso_ate: daqui(-1) }, false],
    ["ativo sem vencimento", { papel: "cliente", status: "ativo", acesso_ate: null }, true],
    ["ativo vencido", { papel: "cliente", status: "ativo", acesso_ate: daqui(-24) }, false],
    ["inativo sem vencimento", { papel: "cliente", status: "inativo", acesso_ate: null }, false],
    ["inativo com prazo futuro", { papel: "cliente", status: "inativo", acesso_ate: daqui(240) }, false],
    ["vence exatamente agora já não entra", { papel: "cliente", status: "ativo", acesso_ate: AGORA.toISOString() }, false],
  ] as const)("%s", (_nome, perfil, esperado) => {
    expect(temAcesso(perfil, AGORA)).toBe(esperado);
  });
});

describe("diasRestantes", () => {
  it("sem vencimento = null; vencido = 0; arredonda para cima", () => {
    expect(diasRestantes(null, AGORA)).toBeNull();
    expect(diasRestantes(daqui(-30), AGORA)).toBe(0);
    expect(diasRestantes(daqui(24), AGORA)).toBe(1);
    expect(diasRestantes(daqui(25), AGORA)).toBe(2);
    expect(diasRestantes(daqui(1), AGORA)).toBe(1);
    expect(diasRestantes(daqui(24 * 7), AGORA)).toBe(7);
  });
});

describe("rotas do modal de acesso", () => {
  it("cada tela tem a sua URL, e qualquer outro valor abre o login", () => {
    expect([ROTA_LOGIN, ROTA_CADASTRO, ROTA_RECUPERAR]).toEqual(["/?entrar=1", "/?entrar=cadastro", "/?entrar=recuperar"]);
    expect(telaDoParametro("cadastro")).toBe("cadastro");
    expect(telaDoParametro("recuperar")).toBe("recuperar");
    for (const v of ["1", "", null, "admin", "CADASTRO"]) expect(telaDoParametro(v)).toBe("login");
  });
});

describe("datas do painel admin (fim do dia em Brasília)", () => {
  it("o dia escolhido vira 23:59:59 de Brasília", () => {
    expect(inputParaFimDoDia("2026-11-20")).toBe("2026-11-21T02:59:59.000Z");
  });
  it("o campo mostra o dia de Brasília, não o dia UTC", () => {
    expect(dataParaInput("2026-11-21T02:59:59.000Z")).toBe("2026-11-20");
  });
  it("abrir e salvar sem mudar não empurra o vencimento um dia para frente", () => {
    let iso = inputParaFimDoDia("2026-12-31")!;
    for (let i = 0; i < 5; i++) iso = inputParaFimDoDia(dataParaInput(iso))!;
    expect(dataParaInput(iso)).toBe("2026-12-31");
  });
  it("vazio ou inválido = sem vencimento", () => {
    expect(inputParaFimDoDia("")).toBeNull();
    expect(inputParaFimDoDia("20/11/2026")).toBeNull();
    expect(dataParaInput(null)).toBe("");
  });
});

describe("variáveis de ambiente", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllEnvs());

  it("urlDoSite tira as barras do fim e usa o fallback quando não há variável", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.exemplo.com//");
    const { urlDoSite } = await import("../lib/env");
    expect(urlDoSite("http://outro")).toBe("https://app.exemplo.com");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(urlDoSite("http://localhost:3002/")).toBe("http://localhost:3002");
    expect(urlDoSite()).toBe("");
  });
  it("exigirSupabase explica o que falta quando as chaves não estão configuradas", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const { exigirSupabase } = await import("../lib/env");
    expect(() => exigirSupabase()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
  it("exigirSupabase passa com as chaves", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "chave");
    const { exigirSupabase } = await import("../lib/env");
    expect(() => exigirSupabase()).not.toThrow();
  });
  it("cliente de serviço não existe sem a chave secreta", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const { criarClienteServico } = await import("../lib/supabase/admin");
    expect(criarClienteServico()).toBeNull();
  });
});

describe("tema claro/escuro", () => {
  const html = { dataset: {} as Record<string, string> };
  const salvo = new Map<string, string>();
  beforeEach(() => {
    html.dataset = {};
    salvo.clear();
    vi.stubGlobal("document", { documentElement: html });
    vi.stubGlobal("localStorage", { setItem: (k: string, v: string) => salvo.set(k, v), removeItem: (k: string) => salvo.delete(k) });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("aplica, lembra e lê de volta cada tema", async () => {
    const { aplicarTema, temaAtual } = await import("../lib/tema");
    aplicarTema("escuro");
    expect(html.dataset.theme).toBe("dark");
    expect(salvo.get("tema")).toBe("dark");
    expect(temaAtual()).toBe("escuro");
    aplicarTema("claro");
    expect(temaAtual()).toBe("claro");
    aplicarTema("sistema");
    expect(html.dataset.theme).toBeUndefined();
    expect(salvo.has("tema")).toBe(false);
    expect(temaAtual()).toBe("sistema");
  });
  it("com armazenamento bloqueado o tema ainda vale na página", async () => {
    vi.stubGlobal("localStorage", { setItem: () => { throw new Error("bloqueado"); }, removeItem: () => { throw new Error("bloqueado"); } });
    const { aplicarTema, temaAtual } = await import("../lib/tema");
    expect(() => aplicarTema("escuro")).not.toThrow();
    expect(temaAtual()).toBe("escuro");
  });
});
