// Server actions do painel admin: criar e excluir clientes com a chave de serviço.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const estado = vi.hoisted(() => ({
  user: { id: "admin-1" } as { id: string } | null,
  papel: "admin" as string,
  servico: null as null | ReturnType<typeof criarServico>,
  host: "app.exemplo.com",
}));

type Erro = { message: string } | null;
type RespUsuario = { data: { user: { id: string } | null }; error: Erro };

function criarServico() {
  const eq = vi.fn<(coluna: string, valor: string) => Promise<{ error: Erro }>>(async () => ({ error: null }));
  const update = vi.fn<(linha: Record<string, unknown>) => { eq: typeof eq }>(() => ({ eq }));
  return {
    eq,
    update,
    auth: {
      admin: {
        createUser: vi.fn<(dados: object) => Promise<RespUsuario>>(async () => ({ data: { user: { id: "novo-1" } }, error: null })),
        inviteUserByEmail: vi.fn<(email: string, opcoes: object) => Promise<RespUsuario>>(async () => ({ data: { user: { id: "novo-2" } }, error: null })),
        deleteUser: vi.fn<(id: string) => Promise<{ error: Erro }>>(async () => ({ error: null })),
      },
    },
    from: vi.fn(() => ({ update })),
  };
}

vi.mock("@/lib/acesso", () => ({
  usuarioAtual: async () => ({ user: estado.user, perfil: estado.user ? { papel: estado.papel } : null }),
}));
vi.mock("@/lib/supabase/admin", () => ({ criarClienteServico: () => estado.servico }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ host: estado.host, "x-forwarded-proto": "https" }) }));

import { criarUsuario, excluirUsuario } from "../app/(app)/admin/actions";

const dados = (p: Partial<Parameters<typeof criarUsuario>[0]> = {}) => ({ email: "Cliente@Loja.com ", nome: "Cliente", senha: "senha-provisoria", dias: 30, observacao: "Pix", ...p });

beforeEach(() => {
  estado.user = { id: "admin-1" };
  estado.papel = "admin";
  estado.servico = criarServico();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
});
afterEach(() => vi.unstubAllEnvs());

describe("só administrador usa o painel", () => {
  it("cliente comum ou visitante é barrado nas duas ações", async () => {
    estado.papel = "cliente";
    await expect(criarUsuario(dados())).rejects.toThrow("Acesso negado");
    await expect(excluirUsuario("x")).rejects.toThrow("Acesso negado");
    estado.user = null;
    await expect(criarUsuario(dados())).rejects.toThrow("Acesso negado");
    expect(estado.servico!.auth.admin.createUser).not.toHaveBeenCalled();
  });
  it("sem a chave de serviço explica como liberar", async () => {
    estado.servico = null;
    expect((await criarUsuario(dados())).msg).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect((await excluirUsuario("x")).msg).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});

describe("criar cliente", () => {
  it("valida e-mail e senha provisória", async () => {
    expect(await criarUsuario(dados({ email: "sem-arroba" }))).toEqual({ ok: false, msg: "E-mail inválido." });
    expect((await criarUsuario(dados({ senha: "1234567" }))).msg).toContain("8 caracteres");
  });

  it("com senha: conta já confirmada, e-mail normalizado e acesso ativo por N dias", async () => {
    const r = await criarUsuario(dados({ nome: "n".repeat(200), observacao: "o".repeat(900) }));
    const s = estado.servico!;
    expect(r.ok).toBe(true);
    expect(r.msg).toContain("cliente@loja.com");
    expect(s.auth.admin.createUser).toHaveBeenCalledWith(expect.objectContaining({ email: "cliente@loja.com", email_confirm: true }));
    const linha = s.update.mock.calls[0][0];
    expect(linha.status).toBe("ativo");
    expect(linha.nome).toHaveLength(120);
    expect(linha.observacao).toHaveLength(500);
    const dias = (new Date(linha.acesso_ate as string).getTime() - Date.now()) / 86_400_000;
    expect(dias).toBeGreaterThan(29.9);
    expect(dias).toBeLessThan(30.1);
    expect(s.eq).toHaveBeenCalledWith("id", "novo-1");
  });

  it("0 dias = sem vencimento; dias absurdos são limitados a 10 anos", async () => {
    await criarUsuario(dados({ dias: 0 }));
    expect(estado.servico!.update.mock.calls[0][0].acesso_ate).toBeNull();
    estado.servico = criarServico();
    await criarUsuario(dados({ dias: 999999 }));
    const anos = (new Date(estado.servico!.update.mock.calls[0][0].acesso_ate as string).getTime() - Date.now()) / 86_400_000 / 365;
    expect(Math.round(anos)).toBe(10);
  });

  it("sem senha: envia convite com link de volta para o site", async () => {
    const r = await criarUsuario(dados({ senha: "" }));
    expect(r).toEqual({ ok: true, msg: "Convite enviado para cliente@loja.com." });
    expect(estado.servico!.auth.admin.inviteUserByEmail).toHaveBeenCalledWith("cliente@loja.com", expect.objectContaining({ redirectTo: "https://app.exemplo.com/auth/callback?next=/redefinir-senha" }));
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://analiseads.com.br/");
    await criarUsuario(dados({ senha: "" }));
    expect(estado.servico!.auth.admin.inviteUserByEmail.mock.calls[1][1]).toMatchObject({ redirectTo: "https://analiseads.com.br/auth/callback?next=/redefinir-senha" });
  });

  it.each([
    ["User already registered", "Já existe uma conta com este e-mail."],
    ["email rate limit exceeded", "Limite de envio de e-mails atingido"],
    ["Password should be at least 6 characters", "Senha não aceita"],
  ])("traduz o erro do Supabase '%s'", async (erro, esperado) => {
    estado.servico!.auth.admin.createUser.mockResolvedValueOnce({ data: { user: null }, error: { message: erro } });
    const r = await criarUsuario(dados());
    expect(r.ok).toBe(false);
    expect(r.msg).toContain(esperado);
  });

  it("usuário criado mas sem id, ou perfil sem atualizar, avisa para ajustar pela lista", async () => {
    estado.servico!.auth.admin.createUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    expect((await criarUsuario(dados())).msg).toContain("Ative pela lista");
    estado.servico!.eq.mockResolvedValueOnce({ error: { message: "x" } });
    expect((await criarUsuario(dados())).msg).toContain("Ajuste pela lista");
  });
});

describe("excluir cliente", () => {
  it("o admin não exclui a própria conta", async () => {
    expect((await excluirUsuario("admin-1")).ok).toBe(false);
    expect(estado.servico!.auth.admin.deleteUser).not.toHaveBeenCalled();
  });
  it("exclui outro usuário e mostra o erro quando falha", async () => {
    expect(await excluirUsuario("cliente-9")).toEqual({ ok: true, msg: "Conta excluída." });
    expect(estado.servico!.auth.admin.deleteUser).toHaveBeenCalledWith("cliente-9");
    estado.servico!.auth.admin.deleteUser.mockResolvedValueOnce({ error: { message: "not found" } });
    expect((await excluirUsuario("cliente-9")).msg).toContain("not found");
  });
});
