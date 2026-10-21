import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { exigirSupabase, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/** Cliente do Supabase para Server Components, Server Actions e Route Handlers (age como o usuário logado). */
export async function criarClienteServidor() {
  exigirSupabase();
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(lista) {
        try {
          lista.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado de um Server Component: o proxy.ts já renova a sessão.
        }
      },
    },
  });
}
