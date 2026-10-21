"use client";
import { useRef } from "react";

const MAX_GRAUS = 7;

/**
 * Inclina o conteúdo acompanhando o mouse: o lado onde o ponteiro está "deita" para trás.
 * Em repouso fica reto. Desligado em telas de toque e com "reduzir movimento".
 */
export default function InclinaPrevia({ children }: { children: React.ReactNode }) {
  const caixa = useRef<HTMLDivElement>(null);
  const quadro = useRef(0);

  function mover(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = caixa.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; // -0,5 (esquerda) a 0,5 (direita)
    const y = (e.clientY - r.top) / r.height - 0.5; // -0,5 (topo) a 0,5 (base)
    cancelAnimationFrame(quadro.current);
    quadro.current = requestAnimationFrame(() => {
      el.style.setProperty("--ry", `${(x * MAX_GRAUS * 2).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * MAX_GRAUS * 2).toFixed(2)}deg`);
      el.dataset.inclinado = "";
    });
  }

  function sair() {
    cancelAnimationFrame(quadro.current);
    const el = caixa.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.inclinado;
  }

  return (
    <div ref={caixa} className="lp-previa" onPointerMove={mover} onPointerLeave={sair}>
      {children}
    </div>
  );
}
