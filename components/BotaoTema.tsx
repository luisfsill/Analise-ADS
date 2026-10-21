"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { aplicarTema, ROTULO_TEMA, temaAtual, type Tema } from "@/lib/tema";

const PROXIMO: Record<Tema, Tema> = { sistema: "claro", claro: "escuro", escuro: "sistema" };

/** Botão das telas de acesso: alterna automático → claro → escuro. Na área logada o tema fica no menu do usuário. */
export default function BotaoTema({ className = "btn icone" }: { className?: string }) {
  const [tema, setTema] = useState<Tema>("sistema");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lê o tema já aplicado no <html> só depois da hidratação
    setTema(temaAtual());
  }, []);

  function alternar() {
    const novo = PROXIMO[tema];
    aplicarTema(novo);
    setTema(novo);
  }

  const Icone = tema === "claro" ? Sun : tema === "escuro" ? Moon : Monitor;
  const rotulo = "Tema: " + ROTULO_TEMA[tema].toLowerCase();
  return (
    <button type="button" className={className} onClick={alternar} aria-label={rotulo + ". Clique para trocar"} title={rotulo}>
      <Icone />
    </button>
  );
}
