"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Tema = "sistema" | "claro" | "escuro";
const PROXIMO: Record<Tema, Tema> = { sistema: "claro", claro: "escuro", escuro: "sistema" };
const ROTULO: Record<Tema, string> = { sistema: "Tema: automático", claro: "Tema: claro", escuro: "Tema: escuro" };
const ATRIBUTO: Record<Tema, string | null> = { sistema: null, claro: "light", escuro: "dark" };

/** Alterna automático → claro → escuro. O tema salvo é aplicado antes da pintura pelo script em app/layout.tsx. */
export default function BotaoTema({ className = "btn icone" }: { className?: string }) {
  const [tema, setTema] = useState<Tema>("sistema");

  useEffect(() => {
    const atual = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lê o tema já aplicado no <html> só depois da hidratação
    setTema(atual === "light" ? "claro" : atual === "dark" ? "escuro" : "sistema");
  }, []);

  function alternar() {
    const novo = PROXIMO[tema];
    const attr = ATRIBUTO[novo];
    if (attr) document.documentElement.dataset.theme = attr;
    else delete document.documentElement.dataset.theme;
    try { if (attr) localStorage.setItem("tema", attr); else localStorage.removeItem("tema"); } catch { /* armazenamento bloqueado: vale só nesta página */ }
    setTema(novo);
  }

  const Icone = tema === "claro" ? Sun : tema === "escuro" ? Moon : Monitor;
  return (
    <button type="button" className={className} onClick={alternar} aria-label={ROTULO[tema] + ". Clique para trocar"} title={ROTULO[tema]}>
      <Icone />
    </button>
  );
}
