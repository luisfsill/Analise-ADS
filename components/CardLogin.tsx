"use client";
import { BarChart3, CircleAlert, LogIn, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";

/** Card de login (o mesmo da antiga página /login), usado dentro do modal da apresentação. */
export default function CardLogin({ erroInicial = "", aoFechar }: { erroInicial?: string; aoFechar?: () => void }) {
  const router = useRouter();
  const id = useId();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(erroInicial);
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
    <div className="card">
      {aoFechar && (
        <button type="button" className="btn icone fechar-modal" onClick={aoFechar} aria-label="Fechar">
          <X />
        </button>
      )}
      <span className="marca-auth"><BarChart3 /></span>
      <h1 id={id + "-titulo"}>Entrar</h1>
      <p className="sub">Análise de performance dos anúncios</p>
      <form onSubmit={(e) => void entrar(e)}>
        <div className="f"><label htmlFor={id + "-email"}>E-mail</label><div className="box"><input id={id + "-email"} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
        <div className="f"><label htmlFor={id + "-senha"}>Senha</label><div className="box"><input id={id + "-senha"} type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} /></div></div>
        {erro && <p className="msg-erro" role="alert"><CircleAlert />{erro}</p>}
        <button className="btn primary" disabled={carregando} aria-busy={carregando}><LogIn />{carregando ? "Entrando…" : "Entrar"}</button>
      </form>
      <div className="links"><Link href="/cadastro">Criar conta</Link><Link href="/recuperar-senha">Esqueci minha senha</Link></div>
    </div>
  );
}
