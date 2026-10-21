/** Tema claro/escuro. O tema salvo é aplicado antes da pintura pelo script em app/layout.tsx. */
export type Tema = "sistema" | "claro" | "escuro";

const ATRIBUTO: Record<Tema, string | null> = { sistema: null, claro: "light", escuro: "dark" };

export const ROTULO_TEMA: Record<Tema, string> = { sistema: "Automático", claro: "Claro", escuro: "Escuro" };

/** Lê o tema já aplicado no <html>. Só chamar no navegador. */
export function temaAtual(): Tema {
  const atual = document.documentElement.dataset.theme;
  return atual === "light" ? "claro" : atual === "dark" ? "escuro" : "sistema";
}

/** Aplica o tema no <html> e lembra a escolha (quando o navegador permite). */
export function aplicarTema(tema: Tema) {
  const attr = ATRIBUTO[tema];
  if (attr) document.documentElement.dataset.theme = attr;
  else delete document.documentElement.dataset.theme;
  try {
    if (attr) localStorage.setItem("tema", attr);
    else localStorage.removeItem("tema");
  } catch {
    /* armazenamento bloqueado: vale só nesta página */
  }
}
