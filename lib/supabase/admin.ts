import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/env";

/**
 * Cliente com a chave de serviço (service_role / secret). IGNORA as regras de segurança (RLS),
 * por isso só pode ser usado no servidor, depois de conferir que quem pediu é admin.
 * Usado apenas para criar/convidar usuários pelo painel /admin. Se a chave não estiver
 * configurada, devolve null e o painel mostra como liberar a função.
 */
export function criarClienteServico() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (typeof window !== "undefined") throw new Error("criarClienteServico só pode rodar no servidor.");
  if (!SUPABASE_URL || !chave) return null;
  return createClient(SUPABASE_URL, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}
