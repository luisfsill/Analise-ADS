"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Secao = readonly [href: string, rotulo: string];
type Marcador = { x: number; w: number; visivel: boolean };

/**
 * Menu de seções da apresentação: um sublinhado azul desliza até o link sob o mouse e
 * volta para o item marcado. O item marcado é o clicado ou a seção visível na rolagem.
 */
export default function NavSecoes({ secoes }: { secoes: readonly Secao[] }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState<string | null>(null);
  const [marcador, setMarcador] = useState<Marcador>({ x: 0, w: 0, visivel: false });

  const posicionar = useCallback((href: string | null) => {
    const link = href ? caixa.current?.querySelector<HTMLAnchorElement>(`a[href="${href}"]`) : null;
    if (!link) {
      setMarcador((m) => ({ ...m, visivel: false }));
      return;
    }
    setMarcador({ x: link.offsetLeft, w: link.offsetWidth, visivel: true });
  }, []);

  // Marca a seção que está no meio da tela durante a rolagem
  useEffect(() => {
    const topo = document.querySelector(".lp-hero");
    const alvos = secoes.map(([href]) => document.querySelector(href)).filter((el): el is Element => !!el);
    const obs = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.find((e) => e.isIntersecting);
        if (!visivel) return;
        setAtivo(visivel.target === topo ? null : "#" + visivel.target.id); // no topo, nenhum marcado
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    [topo, ...alvos].forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [secoes]);

  // O sublinhado acompanha o item marcado (e se reajusta se a fonte carregar depois)
  useEffect(() => {
    posicionar(ativo);
    const ajustar = () => posicionar(ativo);
    window.addEventListener("resize", ajustar);
    void document.fonts?.ready.then(ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, [ativo, posicionar]);

  return (
    <div ref={caixa} className="lp-secoes" onMouseLeave={() => posicionar(ativo)}>
      {secoes.map(([href, rotulo]) => (
        <a
          key={href}
          href={href}
          className={"lp-secao-link" + (ativo === href ? " ativo" : "")}
          aria-current={ativo === href ? "location" : undefined}
          onMouseEnter={() => posicionar(href)}
          onFocus={() => posicionar(href)}
          onBlur={() => posicionar(ativo)}
          onClick={() => setAtivo(href)}
        >
          {rotulo}
        </a>
      ))}
      <span
        className="lp-sublinhado"
        aria-hidden="true"
        style={{ transform: `translateX(${marcador.x}px)`, width: marcador.w, opacity: marcador.visivel ? 1 : 0 }}
      />
    </div>
  );
}
