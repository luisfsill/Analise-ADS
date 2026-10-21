"use client";
import { BarChart3, CircleAlert, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import BotaoFecharModal from "@/components/BotaoFecharModal";
import type { TelaAcesso } from "@/lib/rotas";
import { criarClienteNavegador } from "@/lib/supabase/client";

/** Tela "Entrar" do modal de acesso. */
export default function CardLogin({ erroInicial = "", aoFechar, aoTrocar }: { erroInicial?: string; aoFechar: () => void; aoTrocar: (t: TelaAcesso) => void }) {
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
      <BotaoFecharModal aoFechar={aoFechar} />
      <span className="marca-auth"><BarChart3 /></span>
      <h1>Entrar</h1>
      <p className="sub">Análise de performance dos anúncios</p>
      <form onSubmit={(e) => void entrar(e)}>
        <div className="f"><label htmlFor={id + "-email"}>E-mail</label><div className="box"><input id={id + "-email"} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
        <div className="f"><label htmlFor={id + "-senha"}>Senha</label><div className="box"><input id={id + "-senha"} type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} /></div></div>
        {erro && <p className="msg-erro" role="alert"><CircleAlert />{erro}</p>}
        <button className="btn primary" disabled={carregando} aria-busy={carregando}><LogIn />{carregando ? "Entrando…" : "Entrar"}</button>
      </form>
      <div className="links">
        <button type="button" className="link-btn" onClick={() => aoTrocar("cadastro")}>Criar conta</button>
        <button type="button" className="link-btn" onClick={() => aoTrocar("recuperar")}>Esqueci minha senha</button>
      </div>
    </div>
  );
}
