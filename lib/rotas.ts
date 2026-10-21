/** O acesso é todo no modal da apresentação: entrar, criar conta e recuperar senha. */
export type TelaAcesso = "login" | "cadastro" | "recuperar";

export const ROTA_LOGIN = "/?entrar=1";
export const ROTA_CADASTRO = "/?entrar=cadastro";
export const ROTA_RECUPERAR = "/?entrar=recuperar";

/** Lê a tela pedida em ?entrar= (qualquer outro valor abre o login). */
export function telaDoParametro(valor: string | null): TelaAcesso {
  return valor === "cadastro" || valor === "recuperar" ? valor : "login";
}
