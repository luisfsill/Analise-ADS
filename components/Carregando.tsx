"use client";
import { useEffect, useState } from "react";

/**
 * Conteúdo do botão enquanto espera: as três barras do logo sobem e descem e as mensagens
 * se revezam. O brilho que atravessa o botão vem do CSS (.btn.carregando).
 */
export function ConteudoCarregando({ mensagens }: { mensagens: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (mensagens.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % mensagens.length), 1400);
    return () => clearInterval(t);
  }, [mensagens.length]);
  return (
    <>
      <span className="barras-load" aria-hidden="true"><i /><i /><i /></span>
      <span key={i} className="msg-load" role="status">{mensagens[i]}</span>
    </>
  );
}

/** Tela de boas-vindas sobre o card depois do login: o logo monta o gráfico e aparece o selo. */
export function TelaBoasVindas() {
  return (
    <div className="login-sucesso" role="status" aria-live="polite">
      <div className="ls-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path className="ls-eixo" d="M3 3v16a2 2 0 0 0 2 2h16" />
          <path className="ls-barra ls-b1" d="M8 17v-3" />
          <path className="ls-barra ls-b2" d="M13 17V5" />
          <path className="ls-barra ls-b3" d="M18 17V9" />
        </svg>
        <span className="ls-selo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path className="ls-check" d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <span className="ls-onda" />
      </div>
      <p className="ls-titulo">Tudo certo!</p>
      <p className="ls-sub">Preparando seu painel<span className="ls-pontos"><i>.</i><i>.</i><i>.</i></span></p>
    </div>
  );
}
