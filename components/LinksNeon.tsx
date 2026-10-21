"use client";
import { useRef, useState } from "react";

/**
 * Linha de links/botões com o mesmo sublinhado azul neon do menu da apresentação:
 * a barra desliza até o item sob o mouse (ou com foco) e some ao sair.
 */
export default function LinksNeon({ children }: { children: React.ReactNode }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [m, setM] = useState({ x: 0, w: 0, visivel: false });

  function marcar(alvo: EventTarget | null) {
    const el = alvo instanceof Element ? alvo.closest<HTMLElement>(".link-btn") : null;
    if (!el || !caixa.current?.contains(el)) return;
    setM({ x: el.offsetLeft, w: el.offsetWidth, visivel: true });
  }
  const esconder = () => setM((v) => ({ ...v, visivel: false }));

  return (
    <div
      ref={caixa}
      className="links links-neon"
      onPointerOver={(e) => marcar(e.target)}
      onPointerLeave={esconder}
      onFocus={(e) => marcar(e.target)}
      onBlur={esconder}
    >
      {children}
      <span className="lp-sublinhado" aria-hidden="true" style={{ transform: `translateX(${m.x}px)`, width: m.w, opacity: m.visivel ? 1 : 0 }} />
    </div>
  );
}
