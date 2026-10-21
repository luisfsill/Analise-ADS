"use client";
import Link from "next/link";
import { useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const base = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/+$/, "");
    const { error } = await criarClienteNavegador().auth.resetPasswordForEmail(email, { redirectTo: `${base}/auth/callback?next=/redefinir-senha` });
    if (error) { setErro("Não foi possível enviar o e-mail agora. Tente de novo em alguns minutos."); return; }
    setEnviado(true);
  }

  return (
    <main className="auth">
      <div className="card">
        <h1>Recuperar senha</h1>
        {enviado ? (
          <p className="msg-ok">Se existir uma conta com {email}, você vai receber um link para criar uma nova senha.</p>
        ) : (
          <>
            <p className="sub">Digite seu e-mail para receber o link.</p>
            <form onSubmit={enviar}>
              <div className="f"><label htmlFor="email">E-mail</label><div className="box"><input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
              {erro && <p className="msg-erro" role="alert">{erro}</p>}
              <button className="btn primary">Enviar link</button>
            </form>
          </>
        )}
        <div className="links"><Link href="/login">Voltar ao login</Link></div>
      </div>
    </main>
  );
}
