// Regras de acesso puras (sem servidor): podem ser usadas no navegador e no servidor.
export type Papel = "cliente" | "admin";
export type StatusConta = "teste" | "ativo" | "inativo";

export interface Perfil {
  id: string;
  email: string;
  nome: string;
  papel: Papel;
  status: StatusConta;
  acesso_ate: string | null;
}

/** Mesma regra da função tem_acesso() do banco (supabase/schema.sql). */
export function temAcesso(p: Pick<Perfil, "papel" | "status" | "acesso_ate"> | null, agora = new Date()) {
  if (!p) return false;
  if (p.papel === "admin") return true;
  if (p.status !== "teste" && p.status !== "ativo") return false;
  return p.acesso_ate == null || new Date(p.acesso_ate) > agora;
}

/** Dias que faltam para o acesso vencer (null = sem vencimento). */
export function diasRestantes(acessoAte: string | null, agora = new Date()) {
  if (!acessoAte) return null;
  return Math.max(0, Math.ceil((new Date(acessoAte).getTime() - agora.getTime()) / 86_400_000));
}
