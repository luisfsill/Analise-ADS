"use client";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ROTA_CADASTRO } from "@/lib/rotas";

type Secao = readonly [href: string, rotulo: string];

/**
 * Menu de seções no celular e tablet: botão ☰ que abre um painel abaixo da barra.
 * Mesmo estilo do menu do desktop: fonte, cor e sublinhado azul neon (no hover, no foco
 * e na seção que está na tela).
 */
export default function MenuSecoesMobile({ secoes }: { secoes: readonly Secao[] }) {
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState<string | null>(null);
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

  // Mesma regra do desktop: marca a seção no meio da tela; no topo, nenhuma
  useEffect(() => {
    const topo = document.querySelector(".lp-hero");
    const alvos = secoes.map(([href]) => document.querySelector(href)).filter((el): el is Element => !!el);
    const obs = new IntersectionObserver((entradas) => {
      const visivel = entradas.find((e) => e.isIntersecting);
      if (visivel) setAtivo(visivel.target === topo ? null : "#" + visivel.target.id);
    }, { rootMargin: "-45% 0px -50% 0px" });
    [topo, ...alvos].forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [secoes]);

  return (
    <div className="lp-menu-mobile" ref={raiz}>
      <button ref={botao} type="button" className="btn icone lp-ghost" aria-expanded={aberto} aria-controls="lp-painel-secoes" aria-label={aberto ? "Fechar menu" : "Abrir menu"} onClick={() => setAberto((a) => !a)}>
        {aberto ? <X /> : <Menu />}
      </button>
      {aberto && (
        <div className="lp-painel-secoes" id="lp-painel-secoes">
          <nav aria-label="Seções">
            {secoes.map(([href, rotulo]) => (
              <a key={href} href={href} className={ativo === href ? "ativo" : undefined} aria-current={ativo === href ? "location" : undefined} onClick={() => { setAtivo(href); setAberto(false); }}>
                <span className="lp-painel-txt">{rotulo}</span>
                <ArrowRight />
              </a>
            ))}
          </nav>
          <Link href={ROTA_CADASTRO} scroll={false} className="btn primary" onClick={() => setAberto(false)}>Começar teste grátis<ArrowRight /></Link>
        </div>
      )}
    </div>
  );
}
