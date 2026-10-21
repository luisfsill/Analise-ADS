"use client";
import { CircleAlert, CircleCheck, KeyRound, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function FormConta({ nomeInicial, userId }: { nomeInicial: string; userId: string }) {
  const router = useRouter();
  const [nome, setNome] = useState(nomeInicial);
  const [msgNome, setMsgNome] = useState<{ ok: boolean; t: string } | null>(null);
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [msgSenha, setMsgSenha] = useState<{ ok: boolean; t: string } | null>(null);

  async function salvarNome(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await criarClienteNavegador().from("perfis").update({ nome: nome.trim().slice(0, 120) }).eq("id", userId);
    setMsgNome(error ? { ok: false, t: "Não foi possível salvar." } : { ok: true, t: "Nome atualizado." });
    if (!error) router.refresh();
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8) { setMsgSenha({ ok: false, t: "A senha precisa ter pelo menos 8 caracteres." }); return; }
    if (senha !== senha2) { setMsgSenha({ ok: false, t: "As duas senhas não são iguais." }); return; }
    const { error } = await criarClienteNavegador().auth.updateUser({ password: senha });
    if (error) { setMsgSenha({ ok: false, t: "Não foi possível trocar a senha. Saia e entre de novo, depois tente outra vez." }); return; }
    setSenha(""); setSenha2("");
    setMsgSenha({ ok: true, t: "Senha alterada." });
  }

  return (
    <>
      <section className="card">
        <div className="card-h"><h2>Dados</h2></div>
        <form className="form-col" onSubmit={salvarNome}>
          <div className="f"><label htmlFor="nome">Nome</label><div className="box"><input id="nome" maxLength={120} value={nome} onChange={(e) => setNome(e.target.value)} /></div></div>
          {msgNome && <p className={msgNome.ok ? "msg-ok" : "msg-erro"} role="status">{msgNome.ok ? <CircleCheck /> : <CircleAlert />}{msgNome.t}</p>}
          <div><button className="btn primary"><Save />Salvar nome</button></div>
        </form>
      </section>
      <section className="card">
        <div className="card-h"><h2>Trocar senha</h2></div>
        <form className="form-col" onSubmit={trocarSenha}>
          <div className="f"><label htmlFor="s1">Nova senha</label><div className="box"><input id="s1" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} /></div></div>
          <div className="f"><label htmlFor="s2">Repita a nova senha</label><div className="box"><input id="s2" type="password" autoComplete="new-password" value={senha2} onChange={(e) => setSenha2(e.target.value)} /></div></div>
          {msgSenha && <p className={msgSenha.ok ? "msg-ok" : "msg-erro"} role="status">{msgSenha.ok ? <CircleCheck /> : <CircleAlert />}{msgSenha.t}</p>}
          <div><button className="btn primary"><KeyRound />Trocar senha</button></div>
        </form>
      </section>
    </>
  );
}
