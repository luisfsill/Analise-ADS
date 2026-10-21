"use client";
import { BarChart3, CircleAlert, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import BotaoFecharModal from "@/components/BotaoFecharModal";
import { ConteudoCarregando, TelaBoasVindas } from "@/components/Carregando";
import LinksNeon from "@/components/LinksNeon";
import type { TelaAcesso } from "@/lib/rotas";
import { criarClienteNavegador } from "@/lib/supabase/client";

/** Tempo da tela "Tudo certo!" antes de abrir o painel (a animação termina em ~1,6 s). */
const PAUSA_SUCESSO_MS = 2800;

/** Tela "Entrar" do modal de acesso. */
export default function CardLogin({ erroInicial = "", aoFechar, aoTrocar }: { erroInicial?: string; aoFechar: () => void; aoTrocar: (t: TelaAcesso) => void }) {
  const router = useRouter();
  const id = useId();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(erroInicial);
  const [estado, setEstado] = useState<"parado" | "entrando" | "sucesso">("parado");
  const [tremer, setTremer] = useState(0);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEstado("entrando");
    const { error } = await criarClienteNavegador().auth.signInWithPassword({ email, password: senha });
    if (error) {
      setEstado("parado");
      setTremer((n) => n + 1);
      setErro(error.message.includes("Email not confirmed") ? "Confirme seu e-mail pelo link que enviamos antes de entrar." : "E-mail ou senha incorretos.");
      return;
    }
    // A tela de boas-vindas fica sobre o card até o painel abrir; segura um pouco depois do "Tudo certo!" antes de entrar
    setEstado("sucesso");
    router.prefetch("/");
    await new Promise((r) => setTimeout(r, PAUSA_SUCESSO_MS));
    router.replace("/");
    router.refresh();
  }

  const entrando = estado === "entrando";

  return (
    <div key={tremer} className={"card" + (tremer ? " tremer" : "")}>
      {estado === "sucesso" && <TelaBoasVindas />}
      <BotaoFecharModal aoFechar={aoFechar} />
      <span className="marca-auth"><BarChart3 /></span>
      <h1>Entrar</h1>
      <p className="sub">Análise de performance dos anúncios</p>
      <form onSubmit={(e) => void entrar(e)}>
        <div className="f"><label htmlFor={id + "-email"}>E-mail</label><div className="box"><input id={id + "-email"} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
        <div className="f"><label htmlFor={id + "-senha"}>Senha</label><div className="box"><input id={id + "-senha"} type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} /></div></div>
        {erro && <p className="msg-erro" role="alert"><CircleAlert />{erro}</p>}
        <button className={"btn primary" + (entrando || estado === "sucesso" ? " carregando" : "")} disabled={estado !== "parado"} aria-busy={entrando}>
          {estado === "parado" ? <><LogIn />Entrar</> : <ConteudoCarregando mensagens={["Verificando seus dados…", "Conferindo sua conta…", "Quase lá…"]} />}
        </button>
      </form>
      <LinksNeon>
        <button type="button" className="link-btn" onClick={() => aoTrocar("cadastro")}>Criar conta</button>
        <button type="button" className="link-btn" onClick={() => aoTrocar("recuperar")}>Esqueci minha senha</button>
      </LinksNeon>
    </div>
  );
}
