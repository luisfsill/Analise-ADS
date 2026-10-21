"use client";
import { BarChart3, CircleAlert, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import BotaoTema from "@/components/BotaoTema";
import { criarClienteNavegador } from "@/lib/supabase/client";

function Formulario() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(params.get("erro") === "link" ? "O link expirou ou já foi usado. Faça login ou peça um novo." : "");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const { error } = await criarClienteNavegador().auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) {
      setErro(error.message.includes("Email not confirmed") ? "Confirme seu e-mail pelo link que enviamos antes de entrar." : "E-mail ou senha incorretos.");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="auth">
      <BotaoTema className="btn icone tema-auth" />
      <div className="card">
        <span className="marca-auth"><BarChart3 /></span>
        <h1>Entrar</h1>
        <p className="sub">Análise de performance dos anúncios</p>
        <form onSubmit={entrar}>
          <div className="f"><label htmlFor="email">E-mail</label><div className="box"><input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
          <div className="f"><label htmlFor="senha">Senha</label><div className="box"><input id="senha" type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} /></div></div>
          {erro && <p className="msg-erro" role="alert"><CircleAlert />{erro}</p>}
          <button className="btn primary" disabled={carregando} aria-busy={carregando}><LogIn />{carregando ? "Entrando…" : "Entrar"}</button>
        </form>
        <div className="links"><Link href="/cadastro">Criar conta</Link><Link href="/recuperar-senha">Esqueci minha senha</Link></div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense><Formulario /></Suspense>;
}
