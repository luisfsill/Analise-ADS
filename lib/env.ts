/**
 * Variáveis de ambiente. As NEXT_PUBLIC_* vão para o navegador (são públicas por natureza);
 * SUPABASE_SERVICE_ROLE_KEY fica só no servidor e nunca deve ter o prefixo NEXT_PUBLIC_.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function exigirSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Faltam as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Preencha o arquivo .env (local) ou as Environment Variables do projeto na Vercel."
    );
  }
}

/** URL pública do app, usada nos links enviados por e-mail. */
export function urlDoSite(fallback?: string) {
  const v = process.env.NEXT_PUBLIC_SITE_URL || fallback || "";
  return v.replace(/\/+$/, "");
}

/** Link para o cliente assinar/renovar (checkout, WhatsApp, página de vendas…). Opcional. */
export const LINK_ASSINATURA = process.env.NEXT_PUBLIC_LINK_ASSINATURA ?? "";
