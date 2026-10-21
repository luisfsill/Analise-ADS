"use client";
import Link from "next/link";
import { useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha.length < 8) { setErro("A senha precisa ter pelo menos 8 caracteres."); return; }
    setCarregando(true);
    const { error } = await criarClienteNavegador().auth.signUp({
      email,
      password: senha,
      options: { data: { nome: nome.trim().slice(0, 120) }, emailRedirectTo: `${(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/+$/, "")}/auth/callback` },
    });
    setCarregando(false);
    if (error) { setErro(error.message.includes("registered") ? "Este e-mail já tem conta. Faça login." : "Não foi possível criar a conta. Confira os dados e tente de novo."); return; }
    setOk(true);
  }

  return (
    <main className="auth">
      <div className="card">
        <h1>Criar conta</h1>
        {ok ? (
          <>
            <p className="msg-ok">Conta criada. Enviamos um link de confirmação para {email}.</p>
            <div className="links"><Link href="/login">Ir para o login</Link></div>
          </>
        ) : (
          <>
            <p className="sub">Use seu e-mail e crie uma senha. Você começa com um período de teste grátis.</p>
            <form onSubmit={cadastrar}>
              <div className="f"><label htmlFor="nome">Nome</label><div className="box"><input id="nome" autoComplete="name" required maxLength={120} value={nome} onChange={(e) => setNome(e.target.value)} /></div></div>
              <div className="f"><label htmlFor="email">E-mail</label><div className="box"><input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
              <div className="f"><label htmlFor="senha">Senha (mínimo 8 caracteres)</label><div className="box"><input id="senha" type="password" autoComplete="new-password" required value={senha} onChange={(e) => setSenha(e.target.value)} /></div></div>
              {erro && <p className="msg-erro" role="alert">{erro}</p>}
              <button className="btn primary" disabled={carregando}>{carregando ? "Criando…" : "Criar conta"}</button>
            </form>
            <div className="links"><Link href="/login">Já tenho conta</Link></div>
          </>
        )}
      </div>
    </main>
  );
}
