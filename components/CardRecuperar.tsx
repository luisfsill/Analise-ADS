"use client";
import { CircleAlert, CircleCheck, KeyRound, Send } from "lucide-react";
import { useId, useState } from "react";
import BotaoFecharModal from "@/components/BotaoFecharModal";
import LinksNeon from "@/components/LinksNeon";
import type { TelaAcesso } from "@/lib/rotas";
import { criarClienteNavegador } from "@/lib/supabase/client";

/** Tela "Recuperar senha" do modal de acesso. O link do e-mail leva a /redefinir-senha. */
export default function CardRecuperar({ aoFechar, aoTrocar }: { aoFechar: () => void; aoTrocar: (t: TelaAcesso) => void }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const base = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/+$/, "");
    const { error } = await criarClienteNavegador().auth.resetPasswordForEmail(email, { redirectTo: `${base}/auth/callback?next=/redefinir-senha` });
    setCarregando(false);
    if (error) { setErro("Não foi possível enviar o e-mail agora. Tente de novo em alguns minutos."); return; }
    setEnviado(true);
  }

  return (
    <div className="card">
      <BotaoFecharModal aoFechar={aoFechar} />
      <span className="marca-auth"><KeyRound /></span>
      <h1>Recuperar senha</h1>
      {enviado ? (
        <p className="msg-ok" role="status"><CircleCheck />Se existir uma conta com {email}, você vai receber um link para criar uma nova senha.</p>
      ) : (
        <>
          <p className="sub">Digite seu e-mail para receber o link.</p>
          <form onSubmit={(e) => void enviar(e)}>
            <div className="f"><label htmlFor={id + "-email"}>E-mail</label><div className="box"><input id={id + "-email"} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
            {erro && <p className="msg-erro" role="alert"><CircleAlert />{erro}</p>}
            <button className="btn primary" disabled={carregando} aria-busy={carregando}><Send />{carregando ? "Enviando…" : "Enviar link"}</button>
          </form>
        </>
      )}
      <LinksNeon><button type="button" className="link-btn" onClick={() => aoTrocar("login")}>Voltar ao login</button></LinksNeon>
    </div>
  );
}
