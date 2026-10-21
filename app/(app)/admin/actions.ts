"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { usuarioAtual } from "@/lib/acesso";
import { urlDoSite } from "@/lib/env";
import { criarClienteServico } from "@/lib/supabase/admin";

type Resposta = { ok: true; msg: string } | { ok: false; msg: string };

async function exigirAdmin() {
  const { user, perfil } = await usuarioAtual();
  if (!user || perfil?.papel !== "admin") throw new Error("Acesso negado");
  return user;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Cria um cliente pelo painel. Com senha provisória: a conta já nasce confirmada e você
 * passa e-mail + senha para o cliente. Sem senha: o Supabase envia um convite por e-mail.
 */
export async function criarUsuario(dados: { email: string; nome: string; senha: string; dias: number; observacao: string }): Promise<Resposta> {
  await exigirAdmin();
  const servico = criarClienteServico();
  if (!servico) return { ok: false, msg: "Configure SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente para criar usuários pelo painel." };

  const email = dados.email.trim().toLowerCase();
  const nome = dados.nome.trim().slice(0, 120);
  const dias = Math.max(0, Math.min(3650, Math.floor(Number(dados.dias) || 0)));
  if (!EMAIL.test(email)) return { ok: false, msg: "E-mail inválido." };
  if (dados.senha && dados.senha.length < 8) return { ok: false, msg: "A senha provisória precisa ter pelo menos 8 caracteres." };

  let id: string | undefined;
  if (dados.senha) {
    const r = await servico.auth.admin.createUser({ email, password: dados.senha, email_confirm: true, user_metadata: { nome } });
    if (r.error) return { ok: false, msg: traduzir(r.error.message) };
    id = r.data.user?.id;
  } else {
    const h = await headers();
    const origem = urlDoSite(`${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`);
    const r = await servico.auth.admin.inviteUserByEmail(email, { data: { nome }, redirectTo: `${origem}/auth/callback?next=/redefinir-senha` });
    if (r.error) return { ok: false, msg: traduzir(r.error.message) };
    id = r.data.user?.id;
  }
  if (!id) return { ok: false, msg: "O usuário foi criado, mas não foi possível ativar. Ative pela lista." };

  const { error } = await servico
    .from("perfis")
    .update({ nome, status: "ativo", acesso_ate: dias > 0 ? new Date(Date.now() + dias * 86_400_000).toISOString() : null, observacao: dados.observacao.slice(0, 500) })
    .eq("id", id);
  revalidatePath("/admin");
  if (error) return { ok: false, msg: "Usuário criado, mas não foi possível ativar o acesso. Ajuste pela lista." };
  return { ok: true, msg: dados.senha ? `Conta criada. Envie ao cliente o e-mail ${email} e a senha provisória.` : `Convite enviado para ${email}.` };
}

/** Exclui a conta e TODAS as análises do cliente. Não tem volta. */
export async function excluirUsuario(id: string): Promise<Resposta> {
  const eu = await exigirAdmin();
  if (id === eu.id) return { ok: false, msg: "Você não pode excluir a sua própria conta por aqui." };
  const servico = criarClienteServico();
  if (!servico) return { ok: false, msg: "Configure SUPABASE_SERVICE_ROLE_KEY para excluir usuários pelo painel." };
  const { error } = await servico.auth.admin.deleteUser(id);
  revalidatePath("/admin");
  return error ? { ok: false, msg: "Não foi possível excluir: " + error.message } : { ok: true, msg: "Conta excluída." };
}

function traduzir(m: string) {
  if (/already (been )?registered|already exists/i.test(m)) return "Já existe uma conta com este e-mail.";
  if (/rate limit/i.test(m)) return "Limite de envio de e-mails atingido. Configure um SMTP próprio no Supabase ou use senha provisória.";
  if (/password/i.test(m)) return "Senha não aceita pelo Supabase (muito fraca ou curta).";
  return m;
}
