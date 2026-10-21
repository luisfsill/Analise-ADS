"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8) { setErro("A senha precisa ter pelo menos 8 caracteres."); return; }
    const { error } = await criarClienteNavegador().auth.updateUser({ password: senha });
    if (error) { setErro("Não foi possível trocar a senha. Abra o link do e-mail de novo."); return; }
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="auth">
      <div className="card">
        <h1>Nova senha</h1>
        <p className="sub">Escolha a nova senha da sua conta.</p>
        <form onSubmit={salvar}>
          <div className="f"><label htmlFor="senha">Nova senha</label><div className="box"><input id="senha" type="password" autoComplete="new-password" required value={senha} onChange={(e) => setSenha(e.target.value)} /></div></div>
          {erro && <p className="msg-erro" role="alert">{erro}</p>}
          <button className="btn primary">Salvar nova senha</button>
        </form>
      </div>
    </main>
  );
}
