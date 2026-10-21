// Rotas do servidor: proxy (quem pode abrir cada página) e o retorno dos links de e-mail.
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sessao = vi.hoisted(() => ({ user: null as null | { id: string } }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser: async () => ({ data: { user: sessao.user } }) } }),
}));

const auth = vi.hoisted(() => ({ verifyOtp: vi.fn(), exchangeCodeForSession: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ criarClienteServidor: async () => ({ auth }) }));

import { GET as callback } from "../app/auth/callback/route";
import { config, proxy } from "../proxy";

const req = (caminho: string) => new NextRequest(new URL(caminho, "https://app.exemplo.com"));
const destino = (r: Response) => {
  const reescrita = r.headers.get("x-middleware-rewrite");
  if (reescrita) return { tipo: "rewrite", url: new URL(reescrita).pathname + new URL(reescrita).search };
  const local = r.headers.get("location");
  if (local) return { tipo: "redirect", url: new URL(local).pathname + new URL(local).search };
  return { tipo: "segue", url: "" };
};

describe("proxy: proteção das páginas", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "chave");
    sessao.user = null;
  });
  afterEach(() => vi.unstubAllEnvs());

  it("visitante em / vê a apresentação na mesma URL, mantendo ?entrar", async () => {
    expect(destino(await proxy(req("/")))).toEqual({ tipo: "rewrite", url: "/apresentacao" });
    expect(destino(await proxy(req("/?entrar=cadastro")))).toEqual({ tipo: "rewrite", url: "/apresentacao?entrar=cadastro" });
  });

  it.each(["/termos", "/privacidade", "/apresentacao", "/auth/callback"])("visitante abre %s sem login", async (c) => {
    expect(destino(await proxy(req(c))).tipo).toBe("segue");
  });

  it.each(["/analise/nova", "/conta", "/admin", "/assinatura", "/redefinir-senha", "/termos-falsos", "/autenticar"])(
    "visitante em %s vai para o login",
    async (c) => {
      expect(destino(await proxy(req(c + "?x=1")))).toEqual({ tipo: "redirect", url: "/?entrar=1" });
    }
  );

  it.each(["/", "/analise/nova", "/conta", "/admin", "/assinatura"])("logado abre %s (assinatura e admin são checados na página e no banco)", async (c) => {
    sessao.user = { id: "u1" };
    expect(destino(await proxy(req(c))).tipo).toBe("segue");
  });

  it("sem variáveis do Supabase deixa passar para a página mostrar o erro explicativo", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(destino(await proxy(req("/conta"))).tipo).toBe("segue");
  });

  it("não roda em arquivos estáticos (ícones, imagens, _next)", () => {
    const re = new RegExp("^" + config.matcher[0] + "$");
    for (const c of ["/_next/static/x.js", "/icon.svg", "/apple-icon.png", "/favicon.ico"]) expect(re.test(c)).toBe(false);
    for (const c of ["/", "/conta", "/analise/123"]) expect(re.test(c)).toBe(true);
  });
});

describe("auth/callback: links de confirmação, convite e recuperação", () => {
  beforeEach(() => {
    auth.verifyOtp.mockReset().mockResolvedValue({ error: null });
    auth.exchangeCodeForSession.mockReset().mockResolvedValue({ error: null });
  });
  const ir = async (q: string) => destino(await callback(new Request("https://app.exemplo.com/auth/callback?" + q)));

  it("confirmação de cadastro entra no sistema", async () => {
    expect(await ir("token_hash=abc&type=email")).toEqual({ tipo: "redirect", url: "/" });
    expect(auth.verifyOtp).toHaveBeenCalledWith({ type: "email", token_hash: "abc" });
  });
  it("convite e recuperação sempre vão para criar senha", async () => {
    expect((await ir("token_hash=a&type=recovery&next=/conta")).url).toBe("/redefinir-senha");
    expect((await ir("token_hash=a&type=invite")).url).toBe("/redefinir-senha");
  });
  it("respeita next interno e bloqueia redirecionamento para outro site", async () => {
    expect((await ir("token_hash=a&type=email&next=/conta")).url).toBe("/conta");
    for (const next of ["//evil.com", "https://evil.com", "/\\evil.com", "evil"]) {
      expect((await ir("token_hash=a&type=email&next=" + encodeURIComponent(next))).url).toBe("/");
    }
  });
  it("formato PKCE (?code=) também funciona", async () => {
    expect(await ir("code=xyz&next=/redefinir-senha")).toEqual({ tipo: "redirect", url: "/redefinir-senha" });
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("xyz");
  });
  it("link vencido, tipo desconhecido ou sem token volta para o login com aviso", async () => {
    auth.verifyOtp.mockResolvedValue({ error: { message: "expired" } });
    expect(await ir("token_hash=a&type=email")).toEqual({ tipo: "redirect", url: "/?entrar=1&erro=link" });
    expect(await ir("token_hash=a&type=hackear")).toEqual({ tipo: "redirect", url: "/?entrar=1&erro=link" });
    expect(await ir("")).toEqual({ tipo: "redirect", url: "/?entrar=1&erro=link" });
    auth.exchangeCodeForSession.mockResolvedValue({ error: { message: "bad" } });
    expect(await ir("code=x")).toEqual({ tipo: "redirect", url: "/?entrar=1&erro=link" });
  });
});
