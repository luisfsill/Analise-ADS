import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rotas que não exigem login
const ROTAS_PUBLICAS = ["/auth", "/apresentacao", "/termos", "/privacidade"];

/**
 * Roda antes de cada página (no Next 16 o antigo middleware.ts se chama proxy.ts).
 * Renova a sessão do Supabase e manda quem não está logado para a apresentação com o modal de login aberto (/?entrar=1).
 * Visitante em "/" vê a apresentação pública (mesma URL); logado vê o histórico.
 * A checagem de assinatura fica em app/(app)/layout.tsx e, de forma definitiva, no banco (RLS).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) return response; // sem configuração: as páginas mostram o erro explicativo

  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(lista) {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const caminho = request.nextUrl.pathname;
  const publica = ROTAS_PUBLICAS.some((r) => caminho === r || caminho.startsWith(r + "/"));

  const redirecionar = (para: string, reescrever = false) => {
    const destino = request.nextUrl.clone();
    destino.pathname = para;
    if (!reescrever) destino.search = "";
    const r = reescrever ? NextResponse.rewrite(destino) : NextResponse.redirect(destino);
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  if (!user && caminho === "/") return redirecionar("/apresentacao", true);
  if (!user && !publica) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/";
    destino.search = "?entrar=1";
    const r = NextResponse.redirect(destino);
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
