"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import CardLogin from "@/components/CardLogin";

const ERRO_LINK = "O link expirou ou já foi usado. Faça login ou peça um novo.";

/**
 * Modal de login da apresentação. Abre quando a URL tem ?entrar (botões "Entrar", proteção de
 * rotas, links de e-mail expirados) e fecha com Esc, com o X ou clicando no fundo escurecido.
 * Usa <dialog> nativo: foco preso dentro, fundo inerte e ::backdrop para escurecer.
 */
export default function ModalLogin() {
  const params = useSearchParams();
  const router = useRouter();
  const caminho = usePathname();
  const dialogo = useRef<HTMLDialogElement>(null);
  const aberto = params.has("entrar");
  const erro = params.get("erro") === "link" ? ERRO_LINK : "";

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (aberto && !d.open) {
      d.showModal();
      d.querySelector<HTMLInputElement>("input[type=email]")?.focus(); // começa pelo e-mail, não pelo X
    }
    if (!aberto && d.open) d.close();
  }, [aberto]);

  function fechar() {
    // Tira ?entrar da URL sem recarregar nem rolar a página
    router.replace(caminho === "/apresentacao" ? "/" : caminho, { scroll: false });
  }

  return (
    <dialog
      ref={dialogo}
      className="modal-login"
      aria-label="Entrar"
      onCancel={(e) => { e.preventDefault(); fechar(); }}
      onClick={(e) => { if (e.target === e.currentTarget) fechar(); }}
    >
      {aberto && <CardLogin key={erro} erroInicial={erro} aoFechar={fechar} />}
    </dialog>
  );
}
