"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import CardCadastro from "@/components/CardCadastro";
import CardLogin from "@/components/CardLogin";
import CardRecuperar from "@/components/CardRecuperar";
import { telaDoParametro, type TelaAcesso } from "@/lib/rotas";

const ERRO_LINK = "O link expirou ou já foi usado. Faça login ou peça um novo.";

/**
 * Modal de acesso da apresentação: entrar, criar conta e recuperar senha, trocando só o card.
 * Abre quando a URL tem ?entrar (=1 login, =cadastro, =recuperar) e fecha com Esc, com o X ou
 * clicando no fundo escurecido. Usa <dialog> nativo: foco preso dentro e ::backdrop escuro.
 */
export default function ModalLogin() {
  const params = useSearchParams();
  const router = useRouter();
  const caminho = usePathname();
  const dialogo = useRef<HTMLDialogElement>(null);
  const aberto = params.has("entrar");
  const tela = telaDoParametro(params.get("entrar"));
  const erro = params.get("erro") === "link" ? ERRO_LINK : "";

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
    // Ao abrir ou trocar de tela, o cursor vai para o primeiro campo (não para o X)
    if (aberto) d.querySelector<HTMLInputElement>("input:not([type=checkbox])")?.focus();
  }, [aberto, tela]);

  const base = caminho === "/apresentacao" ? "/" : caminho;
  const fechar = () => router.replace(base, { scroll: false });
  const trocar = (t: TelaAcesso) => router.replace(`${base}?entrar=${t === "login" ? "1" : t}`, { scroll: false });

  return (
    <dialog
      ref={dialogo}
      className="modal-login"
      aria-label={tela === "cadastro" ? "Criar conta" : tela === "recuperar" ? "Recuperar senha" : "Entrar"}
      onCancel={(e) => { e.preventDefault(); fechar(); }}
      onClick={(e) => { if (e.target === e.currentTarget) fechar(); }}
    >
      {aberto && tela === "login" && <CardLogin key={"login" + erro} erroInicial={erro} aoFechar={fechar} aoTrocar={trocar} />}
      {aberto && tela === "cadastro" && <CardCadastro key="cadastro" aoFechar={fechar} aoTrocar={trocar} />}
      {aberto && tela === "recuperar" && <CardRecuperar key="recuperar" aoFechar={fechar} aoTrocar={trocar} />}
    </dialog>
  );
}
