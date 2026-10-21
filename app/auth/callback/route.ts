import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";

const TIPOS: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

/** Só aceita caminhos internos ("/algo"), para o link não poder mandar o usuário para outro site. */
function destinoSeguro(v: string | null) {
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return "/";
  return v;
}

/**
 * Recebe os links enviados por e-mail: confirmação de cadastro, convite, recuperação de senha.
 * Aceita os dois formatos do Supabase:
 *  - ?token_hash=...&type=...  (recomendado; funciona mesmo abrindo o e-mail em outro aparelho)
 *  - ?code=...                 (padrão PKCE; só funciona no mesmo navegador que pediu)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const tokenHash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  let proximo = destinoSeguro(searchParams.get("next"));
  // Convite e recuperação sempre terminam na tela de criar senha
  if (tipo === "invite" || tipo === "recovery") proximo = "/redefinir-senha";

  const supabase = await criarClienteServidor();

  if (tokenHash && tipo && TIPOS.includes(tipo)) {
    const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${proximo}`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${proximo}`);
  }
  return NextResponse.redirect(`${origin}/?entrar=1&erro=link`);
}
