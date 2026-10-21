import { criarClienteServidor } from "@/lib/supabase/server";
import type { Perfil } from "@/lib/regras-acesso";

export * from "@/lib/regras-acesso";

/** Usuário logado + perfil. Para Server Components. */
export async function usuarioAtual() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, perfil: null as Perfil | null };
  const { data } = await supabase
    .from("perfis")
    .select("id, email, nome, papel, status, acesso_ate")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, user, perfil: (data as Perfil | null) ?? null };
}
