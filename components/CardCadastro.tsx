"use client";
import { CircleAlert, CircleCheck, UserPlus } from "lucide-react";
import { useId, useState } from "react";
import BotaoFecharModal from "@/components/BotaoFecharModal";
import { VERSAO_PRIVACIDADE, VERSAO_TERMOS } from "@/lib/legal";
import type { TelaAcesso } from "@/lib/rotas";
import { criarClienteNavegador } from "@/lib/supabase/client";

/** Tela "Criar conta" do modal de acesso, com aceite obrigatório dos Termos e da Política. */
export default function CardCadastro({ aoFechar, aoTrocar }: { aoFechar: () => void; aoTrocar: (t: TelaAcesso) => void }) {
  const id = useId();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [aceitaPrivacidade, setAceitaPrivacidade] = useState(false);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha.length < 8) { setErro("A senha precisa ter pelo menos 8 caracteres."); return; }
    if (!aceitaTermos || !aceitaPrivacidade) { setErro("Para criar a conta, aceite os Termos de Uso e a Política de Privacidade."); return; }
    setCarregando(true);
    const agora = new Date().toISOString();
    const { error } = await criarClienteNavegador().auth.signUp({
      email,
      password: senha,
      options: {
        // O aceite fica registrado na conta (data e versão de cada documento), como prova do consentimento.
        data: { nome: nome.trim().slice(0, 120), termos_versao: VERSAO_TERMOS, termos_aceitos_em: agora, privacidade_versao: VERSAO_PRIVACIDADE, privacidade_aceita_em: agora },
        emailRedirectTo: `${(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/+$/, "")}/auth/callback`,
      },
    });
    setCarregando(false);
    if (error) { setErro(error.message.includes("registered") ? "Este e-mail já tem conta. Faça login." : "Não foi possível criar a conta. Confira os dados e tente de novo."); return; }
    setOk(true);
  }

  return (
    <div className="card">
      <BotaoFecharModal aoFechar={aoFechar} />
      <span className="marca-auth"><UserPlus /></span>
      <h1>Criar conta</h1>
      {ok ? (
        <>
          <p className="msg-ok" role="status"><CircleCheck />Conta criada. Enviamos um link de confirmação para {email}.</p>
          <div className="links"><button type="button" className="link-btn" onClick={() => aoTrocar("login")}>Ir para o login</button></div>
        </>
      ) : (
        <>
          <p className="sub">Use seu e-mail e crie uma senha. Você começa com 7 dias grátis.</p>
          <form onSubmit={(e) => void cadastrar(e)}>
            <div className="f"><label htmlFor={id + "-nome"}>Nome</label><div className="box"><input id={id + "-nome"} autoComplete="name" required maxLength={120} value={nome} onChange={(e) => setNome(e.target.value)} /></div></div>
            <div className="f"><label htmlFor={id + "-email"}>E-mail</label><div className="box"><input id={id + "-email"} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
            <div className="f"><label htmlFor={id + "-senha"}>Senha (mínimo 8 caracteres)</label><div className="box"><input id={id + "-senha"} type="password" autoComplete="new-password" required minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} /></div></div>
            <div className="aceites">
              <label className="aceite">
                <input type="checkbox" required checked={aceitaTermos} onChange={(e) => setAceitaTermos(e.target.checked)} />
                <span>Li e aceito os <a href="/termos" target="_blank" rel="noopener">Termos de Uso</a></span>
              </label>
              <label className="aceite">
                <input type="checkbox" required checked={aceitaPrivacidade} onChange={(e) => setAceitaPrivacidade(e.target.checked)} />
                <span>Li e aceito a <a href="/privacidade" target="_blank" rel="noopener">Política de Privacidade</a>, inclusive o tratamento dos meus dados como descrito nela</span>
              </label>
            </div>
            {erro && <p className="msg-erro" role="alert"><CircleAlert />{erro}</p>}
            <button className="btn primary" disabled={carregando} aria-busy={carregando}><UserPlus />{carregando ? "Criando…" : "Criar conta"}</button>
          </form>
          <div className="links"><button type="button" className="link-btn" onClick={() => aoTrocar("login")}>Já tenho conta</button></div>
        </>
      )}
    </div>
  );
}
