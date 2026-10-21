"use client";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ROTA_CADASTRO } from "@/lib/rotas";

type Secao = readonly [href: string, rotulo: string];

/** Menu de seções no celular e tablet: botão ☰ que abre um painel abaixo da barra. */
export default function MenuSecoesMobile({ secoes }: { secoes: readonly Secao[] }) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => { if (raiz.current && !raiz.current.contains(e.target as Node)) setAberto(false); };
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") { setAberto(false); botao.current?.focus(); } };
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", tecla);
    return () => { document.removeEventListener("pointerdown", fora); document.removeEventListener("keydown", tecla); };
  }, [aberto]);

  return (
    <div className="lp-menu-mobile" ref={raiz}>
      <button ref={botao} type="button" className="btn icone lp-ghost" aria-expanded={aberto} aria-controls="lp-painel-secoes" aria-label={aberto ? "Fechar menu" : "Abrir menu"} onClick={() => setAberto((a) => !a)}>
        {aberto ? <X /> : <Menu />}
      </button>
      {aberto && (
        <div className="lp-painel-secoes" id="lp-painel-secoes">
          <nav aria-label="Seções">
            {secoes.map(([href, rotulo]) => (
              <a key={href} href={href} onClick={() => setAberto(false)}>{rotulo}<ArrowRight /></a>
            ))}
          </nav>
          <Link href={ROTA_CADASTRO} scroll={false} className="btn primary" onClick={() => setAberto(false)}>Começar teste grátis<ArrowRight /></Link>
        </div>
      )}
    </div>
  );
}
