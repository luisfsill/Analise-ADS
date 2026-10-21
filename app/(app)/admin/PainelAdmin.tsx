"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { temAcesso, type Papel, type StatusConta } from "@/lib/regras-acesso";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { criarUsuario, excluirUsuario } from "./actions";

export interface UsuarioAdmin {
  id: string;
  email: string;
  nome: string;
  papel: Papel;
  status: StatusConta;
  acesso_ate: string | null;
  observacao: string;
  criado_em: string;
  total_analises: number;
  ultimo_acesso: string | null;
}

const TZ = { timeZone: "America/Sao_Paulo" } as const;
const data = (d: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR", TZ) : "–");
const paraInput = (d: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

function situacao(u: UsuarioAdmin): { t: string; c: "good" | "warn" | "bad" | "none" } {
  if (u.papel === "admin") return { t: "Admin", c: "none" };
  if (!temAcesso(u)) return u.status === "inativo" ? { t: "Bloqueado", c: "bad" } : { t: "Vencido", c: "bad" };
  return u.status === "teste" ? { t: "Teste", c: "warn" } : { t: "Ativo", c: "good" };
}

export default function PainelAdmin({ usuarios, meuId, podeCriar }: { usuarios: UsuarioAdmin[]; meuId: string; podeCriar: boolean }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "Ativo" | "Teste" | "Vencido" | "Bloqueado">("todos");
  const [editando, setEditando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; t: string } | null>(null);
  const [pendente, iniciar] = useTransition();

  const contagem = useMemo(() => {
    const c = { total: 0, Ativo: 0, Teste: 0, Vencido: 0, Bloqueado: 0 } as Record<string, number>;
    usuarios.forEach((u) => { if (u.papel === "admin") return; c.total++; c[situacao(u).t]++; });
    return c;
  }, [usuarios]);

  const lista = usuarios.filter((u) => {
    const q = busca.trim().toLowerCase();
    if (q && !u.email.toLowerCase().includes(q) && !u.nome.toLowerCase().includes(q) && !u.observacao.toLowerCase().includes(q)) return false;
    return filtro === "todos" || situacao(u).t === filtro;
  });

  async function atualizar(u: UsuarioAdmin, mudancas: Partial<Pick<UsuarioAdmin, "papel" | "status" | "acesso_ate" | "observacao">>) {
    const n = { ...u, ...mudancas };
    const { error } = await criarClienteNavegador().rpc("admin_atualizar_usuario", {
      p_id: u.id, p_papel: n.papel, p_status: n.status, p_acesso_ate: n.acesso_ate, p_observacao: n.observacao,
    });
    setAviso(error ? { ok: false, t: error.message.includes("próprio") ? error.message : "Não foi possível salvar." } : { ok: true, t: "Salvo: " + u.email });
    if (!error) { setEditando(null); router.refresh(); }
  }

  function somarDias(u: UsuarioAdmin, dias: number) {
    const base = u.acesso_ate && new Date(u.acesso_ate) > new Date() ? new Date(u.acesso_ate) : new Date();
    base.setDate(base.getDate() + dias);
    return atualizar(u, { status: "ativo", acesso_ate: base.toISOString() });
  }

  return (
    <>
      <section className="kpis">
        {([["Clientes", contagem.total, "none"], ["Ativos", contagem.Ativo, "good"], ["Em teste", contagem.Teste, "warn"], ["Vencidos", contagem.Vencido, "bad"], ["Bloqueados", contagem.Bloqueado, "bad"]] as const).map(([t, v, c]) => (
          <div key={t} className={"card stat " + c}><div className="eyebrow">{t}</div><div className="v num">{v}</div></div>
        ))}
      </section>

      <NovoUsuario podeCriar={podeCriar} aoCriar={(r) => { setAviso({ ok: r.ok, t: r.msg }); if (r.ok) router.refresh(); }} />

      <section className="card">
        <div className="card-h">
          <h2>Usuários</h2>
          <div className="filtros">
            <div className="box"><input aria-label="Buscar" placeholder="Buscar por nome, e-mail ou anotação" value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
            <div className="box">
              <select aria-label="Filtrar" value={filtro} onChange={(e) => setFiltro(e.target.value as typeof filtro)}>
                <option value="todos">Todos</option><option>Ativo</option><option>Teste</option><option>Vencido</option><option>Bloqueado</option>
              </select>
            </div>
          </div>
        </div>
        {aviso && <p className={aviso.ok ? "msg-ok" : "msg-erro"} role="status" style={{ marginBottom: 10 }}>{aviso.t}</p>}
        <div className="tablewrap">
          <table className="tabela-admin">
            <thead><tr><th>Cliente</th><th>Situação</th><th>Vence em</th><th>Análises</th><th>Último acesso</th><th></th></tr></thead>
            <tbody>
              {lista.map((u) => {
                const s = situacao(u);
                return (
                  <FragmentoLinha key={u.id} u={u} s={s} meuId={meuId} aberto={editando === u.id} pendente={pendente}
                    abrir={() => setEditando(editando === u.id ? null : u.id)}
                    mais30={() => iniciar(() => somarDias(u, 30))}
                    bloquear={() => iniciar(() => atualizar(u, { status: "inativo" }))}
                    salvar={(m) => iniciar(() => atualizar(u, m))}
                    excluir={() => iniciar(async () => { const r = await excluirUsuario(u.id); setAviso({ ok: r.ok, t: r.msg }); if (r.ok) router.refresh(); })}
                    podeExcluir={podeCriar}
                  />
                );
              })}
              {!lista.length && <tr><td colSpan={6} className="m">Nenhum usuário encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function FragmentoLinha(props: {
  u: UsuarioAdmin; s: { t: string; c: string }; meuId: string; aberto: boolean; pendente: boolean; podeExcluir: boolean;
  abrir: () => void; mais30: () => void; bloquear: () => void; excluir: () => void;
  salvar: (m: Partial<Pick<UsuarioAdmin, "papel" | "status" | "acesso_ate" | "observacao">>) => void;
}) {
  const { u, s, aberto } = props;
  const [papel, setPapel] = useState<Papel>(u.papel);
  const [status, setStatus] = useState<StatusConta>(u.status);
  const [vence, setVence] = useState(paraInput(u.acesso_ate));
  const [obs, setObs] = useState(u.observacao);
  const [confirmar, setConfirmar] = useState(false);
  const eu = u.id === props.meuId;

  return (
    <>
      <tr>
        <td>
          <b>{u.nome || "Sem nome"}</b>{eu && <span className="m"> (você)</span>}
          <div className="m">{u.email}</div>
          {u.observacao && <div className="m obs">{u.observacao}</div>}
        </td>
        <td><span className={"chip " + s.c}>{s.t}</span></td>
        <td className="num">{u.papel === "admin" ? "–" : u.acesso_ate ? data(u.acesso_ate) : "sem vencimento"}</td>
        <td className="num">{u.total_analises > 0 ? <Link href={"/admin/usuario/" + u.id}>{u.total_analises}</Link> : 0}</td>
        <td className="num">{data(u.ultimo_acesso)}</td>
        <td>
          <div className="acoes">
            {u.papel !== "admin" && <button type="button" className="btn mini" disabled={props.pendente} onClick={props.mais30}>+30 dias</button>}
            {u.papel !== "admin" && u.status !== "inativo" && <button type="button" className="btn mini" disabled={props.pendente} onClick={props.bloquear}>Bloquear</button>}
            <button type="button" className="btn mini" onClick={props.abrir}>{aberto ? "Fechar" : "Editar"}</button>
          </div>
        </td>
      </tr>
      {aberto && (
        <tr className="editor">
          <td colSpan={6}>
            <div className="grade-editor">
              <div className="f"><label>Situação</label><div className="box"><select value={status} onChange={(e) => setStatus(e.target.value as StatusConta)}><option value="ativo">Ativo</option><option value="teste">Teste</option><option value="inativo">Bloqueado / inativo</option></select></div></div>
              <div className="f"><label>Vence em (vazio = sem vencimento)</label><div className="box"><input type="date" value={vence} onChange={(e) => setVence(e.target.value)} /></div></div>
              <div className="f"><label>Papel</label><div className="box"><select value={papel} disabled={eu} onChange={(e) => setPapel(e.target.value as Papel)}><option value="cliente">Cliente</option><option value="admin">Administrador</option></select></div></div>
              <div className="f largo"><label>Anotação interna (plano, forma de pagamento…)</label><div className="box"><input maxLength={500} value={obs} onChange={(e) => setObs(e.target.value)} /></div></div>
            </div>
            <div className="acoes" style={{ marginTop: 10 }}>
              <button type="button" className="btn primary mini" disabled={props.pendente}
                onClick={() => props.salvar({ papel, status, observacao: obs, acesso_ate: vence ? new Date(vence + "T23:59:59-03:00").toISOString() : null })}>Salvar</button>
              {!eu && props.podeExcluir && (
                <button type="button" className={"btn mini" + (confirmar ? " danger" : "")} disabled={props.pendente}
                  onClick={() => (confirmar ? props.excluir() : setConfirmar(true))}>{confirmar ? "Confirmar: excluir conta e análises" : "Excluir conta"}</button>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function NovoUsuario({ podeCriar, aoCriar }: { podeCriar: boolean; aoCriar: (r: { ok: boolean; msg: string }) => void }) {
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [dias, setDias] = useState("30");
  const [obs, setObs] = useState("");
  const [pendente, iniciar] = useTransition();

  if (!podeCriar) {
    return (
      <details className="card refs">
        <summary><span>Adicionar cliente</span><span className="caret" aria-hidden="true">▾</span></summary>
        <p className="m" style={{ marginTop: 10 }}>
          Para criar clientes por aqui, cadastre a variável <code>SUPABASE_SERVICE_ROLE_KEY</code> (Supabase › Project Settings › API Keys › chave secreta / service_role)
          nas Environment Variables da Vercel e faça um novo deploy. Enquanto isso, o cliente pode se cadastrar pela tela de cadastro e você libera o acesso na lista abaixo.
        </p>
      </details>
    );
  }

  return (
    <details className="card refs">
      <summary><span>Adicionar cliente</span><span className="caret" aria-hidden="true">▾</span></summary>
      <form className="grade-editor" style={{ marginTop: 12 }} onSubmit={(e) => {
        e.preventDefault();
        iniciar(async () => {
          const r = await criarUsuario({ email, nome, senha, dias: Number(dias), observacao: obs });
          aoCriar(r);
          if (r.ok) { setEmail(""); setNome(""); setSenha(""); setObs(""); }
        });
      }}>
        <div className="f"><label htmlFor="nu-email">E-mail</label><div className="box"><input id="nu-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
        <div className="f"><label htmlFor="nu-nome">Nome</label><div className="box"><input id="nu-nome" value={nome} onChange={(e) => setNome(e.target.value)} /></div></div>
        <div className="f"><label htmlFor="nu-senha">Senha provisória (vazio = enviar convite por e-mail)</label><div className="box"><input id="nu-senha" type="text" autoComplete="off" value={senha} onChange={(e) => setSenha(e.target.value)} /></div></div>
        <div className="f"><label htmlFor="nu-dias">Dias de acesso (0 = sem vencimento)</label><div className="box"><input id="nu-dias" inputMode="numeric" value={dias} onChange={(e) => setDias(e.target.value.replace(/\D/g, ""))} /></div></div>
        <div className="f largo"><label htmlFor="nu-obs">Anotação interna</label><div className="box"><input id="nu-obs" maxLength={500} placeholder="Ex.: Plano mensal, pago via Pix em 20/10" value={obs} onChange={(e) => setObs(e.target.value)} /></div></div>
        <div><button className="btn primary" disabled={pendente}>{pendente ? "Criando…" : "Criar cliente"}</button></div>
      </form>
    </details>
  );
}
