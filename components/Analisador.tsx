"use client";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { analisar, chavePasso, indicadores, planoDeAcao } from "@/lib/analise/analise";
import { brl, dec, int, num } from "@/lib/analise/formato";
import { LABEL, PRIO, TIERS } from "@/lib/analise/regras";
import type { Acao, Entradas, Envio, Fase, Resultado, Status } from "@/lib/analise/tipos";
import { criarClienteNavegador } from "@/lib/supabase/client";

/** Campos numéricos como o usuário digitou (texto), para manter "1.200" e "6,5" no input. */
export type CamposTexto = Record<"dias" | "inv" | "imp" | "cli" | "ven" | "roas" | "tacos" | "margem", string>;

export interface RegistroAnalise {
  id: string;
  campanha: string;
  entradas: { texto: CamposTexto; envio: Envio; fase: Fase };
  passos_feitos: Record<string, boolean>;
  atualizado_em: string;
}

const VAZIO: CamposTexto = { dias: "", inv: "", imp: "", cli: "", ven: "", roas: "", tacos: "", margem: "" };

const CAMPOS: { id: keyof CamposTexto; label: string; ph: string; antes?: string; depois?: string; modo: "numeric" | "decimal" }[] = [
  { id: "dias", label: "Dias analisados", ph: "30", depois: "dias", modo: "numeric" },
  { id: "inv", label: "Investimento por dia", ph: "50,00", antes: "R$", modo: "decimal" },
  { id: "imp", label: "Impressões", ph: "40.000", modo: "numeric" },
  { id: "cli", label: "Cliques", ph: "400", modo: "numeric" },
  { id: "ven", label: "Vendas", ph: "40", modo: "numeric" },
  { id: "roas", label: "ROAS", ph: "10", depois: "×", modo: "decimal" },
  { id: "tacos", label: "TACOS", ph: "5", depois: "%", modo: "decimal" },
];

const statusCor = (s: Status) => (s === "none" ? "muted" : s);

function Anel({ pct, status }: { pct: number | null; status: Status }) {
  const C = 2 * Math.PI * 40;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--soft)" strokeWidth="10" />
      {pct != null && (
        <circle cx="50" cy="50" r="40" fill="none" stroke={`var(--${statusCor(status)})`} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${Math.max(0.02, Math.min(1, pct)) * C} ${C}`} transform="rotate(-90 50 50)" />
      )}
    </svg>
  );
}

function textoParaCopiar(a: Resultado, acoes: Acao[], campanha: string) {
  const d = a.d;
  const L: string[] = ["Análise de performance – Mercado Livre Ads" + (campanha ? " – " + campanha : ""), "Nota: " + a.score + "/100"];
  if (a.gargalo) L.push("Gargalo: " + a.gargalo + ": " + a.gargaloAcao);
  L.push("", ...indicadores(a).map((i) => i.label + ": " + i.valor + " (meta " + i.meta + ")"),
    "Investimento por dia: " + (d.inv != null ? brl(d.inv) : "–"), "", "Plano de ação:");
  acoes.forEach((x, i) => {
    L.push("", i + 1 + ". " + x.t + " – " + x.w);
    (x.s ?? []).forEach((s) => L.push("   • " + s));
    (x.groups ?? []).forEach((g) => { L.push("   " + g.h); g.s.forEach((s) => L.push("     • " + s)); });
  });
  return L.join("\n");
}

export default function Analisador({ registro, somenteLeitura = false }: { registro?: RegistroAnalise; somenteLeitura?: boolean }) {
  const router = useRouter();
  const [id, setId] = useState<string | undefined>(registro?.id);
  const [campos, setCampos] = useState<CamposTexto>({ ...VAZIO, ...(registro?.entradas.texto ?? {}) });
  const [envio, setEnvio] = useState<Envio>(registro?.entradas.envio ?? "");
  const [fase, setFase] = useState<Fase>(registro?.entradas.fase ?? "");
  const [campanha, setCampanha] = useState(registro?.campanha ?? "");
  const [feitos, setFeitos] = useState<Record<string, boolean>>(registro?.passos_feitos ?? {});
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const [alterado, setAlterado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(registro ? "Salva em " + new Date(registro.atualizado_em).toLocaleString("pt-BR") : "");
  const [confirmar, setConfirmar] = useState<"nova" | "excluir" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const entradas: Entradas = useMemo(() => ({
    dias: num(campos.dias), inv: num(campos.inv), imp: num(campos.imp), cli: num(campos.cli), ven: num(campos.ven),
    roas: num(campos.roas), tacos: num(campos.tacos), margem: num(campos.margem), envio, fase,
  }), [campos, envio, fase]);
  const a = useMemo(() => analisar(entradas), [entradas]);
  const acoes = useMemo(() => planoDeAcao(a), [a]);
  const inds = useMemo(() => indicadores(a), [a]);

  const mudou = () => setAlterado(true);
  const toast = (t: string) => { setAviso(t); clearTimeout(timer.current); };
  const pedirConfirmacao = (q: "nova" | "excluir") => {
    setConfirmar(q); clearTimeout(timer.current); timer.current = setTimeout(() => setConfirmar(null), 4000);
  };

  async function salvar() {
    if (somenteLeitura) return;
    if (a.score == null) { toast("Preencha pelo menos três números antes de salvar."); return; }
    setSalvando(true);
    const supabase = criarClienteNavegador();
    const linha = { campanha: campanha.trim(), entradas: { texto: campos, envio, fase }, passos_feitos: feitos, nota: a.score, gargalo: a.gargalo };
    const r = id
      ? await supabase.from("analises").update(linha).eq("id", id).select("id").single()
      : await supabase.from("analises").insert(linha).select("id").single();
    setSalvando(false);
    if (r.error) {
      const msg = r.error.message ?? "";
      if (r.error.code === "42501" || msg.includes("row-level security")) { router.push("/assinatura"); return; }
      toast(msg.includes("Limite") ? "Limite de análises atingido para esta conta." : "Não foi possível salvar. Confira sua conexão e tente de novo.");
      return;
    }
    setAlterado(false);
    toast("Salva às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    if (!id) { setId(r.data.id); router.replace("/analise/" + r.data.id); }
    router.refresh();
  }

  async function baixarPdf() {
    if (a.score == null) { toast("Preencha os números primeiro."); return; }
    const { gerarPdf, nomeArquivoPdf } = await import("@/lib/pdf");
    gerarPdf(a, acoes, feitos, campanha.trim()).save(nomeArquivoPdf(campanha));
  }

  async function copiar() {
    if (a.score == null) { toast("Preencha os números primeiro."); return; }
    try { await navigator.clipboard.writeText(textoParaCopiar(a, acoes, campanha.trim())); toast("Análise copiada"); }
    catch { toast("Não foi possível copiar. Tente de novo."); }
  }

  function novaAnalise() {
    if (alterado && confirmar !== "nova") { pedirConfirmacao("nova"); return; }
    setConfirmar(null);
    if (id) router.push("/analise/nova");
    else { setCampos(VAZIO); setEnvio(""); setFase(""); setCampanha(""); setFeitos({}); setAlterado(false); setAviso(""); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }

  async function excluir() {
    if (!id) return;
    if (confirmar !== "excluir") { pedirConfirmacao("excluir"); return; }
    const { error } = await criarClienteNavegador().from("analises").delete().eq("id", id);
    if (error) { toast("Não foi possível excluir."); return; }
    router.push("/"); router.refresh();
  }

  const s: Status = a.score == null ? "none" : a.score >= 75 ? "good" : a.score >= 50 ? "warn" : "bad";
  const sGargalo: Status = a.gargalo === "Impressões" ? a.st.imp : a.gargalo === "Cliques" ? a.st.ctr : a.gargalo === "Vendas" ? a.st.conv : "good";
  const d = a.d;
  const fmtElo = (v: number | null) => (v == null ? "–" : isFinite(v) ? dec(v, 1) : "sem");

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <h1>{id ? campanha || "Análise sem nome" : "Nova análise"}</h1>
          <p>Preencha os números do período no Mercado Livre Ads. O diagnóstico e o plano de ação se atualizam na hora.</p>
        </div>
        <div className="btns">
          {aviso && <span className="salvo" role="status">{alterado ? "Alterações não salvas" : aviso}</span>}
          {somenteLeitura && <span className="salvo">Análise de um cliente (somente leitura)</span>}
          {!somenteLeitura && <button type="button" className="btn primary" onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : id ? "Salvar alterações" : "Salvar análise"}</button>}
          <button type="button" className="btn" onClick={baixarPdf}>Baixar PDF</button>
          <button type="button" className="btn" onClick={copiar}>Copiar</button>
          <button type="button" className={"btn" + (confirmar === "nova" ? " danger" : "")} onClick={novaAnalise}>{confirmar === "nova" ? "Descartar e começar nova" : "Nova análise"}</button>
          {id && !somenteLeitura && <button type="button" className={"btn" + (confirmar === "excluir" ? " danger" : "")} onClick={excluir}>{confirmar === "excluir" ? "Confirmar exclusão" : "Excluir"}</button>}
        </div>
      </header>

      <section className="card" aria-labelledby="hNums">
        <div className="card-h"><h2 id="hNums">Seus números</h2><span className="aside">Totais do período, exceto o investimento, que é a média por dia</span></div>
        <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
          <div className="f camp"><label htmlFor="camp">Campanha ou produto analisado</label><div className="box"><input id="camp" maxLength={80} placeholder="Ex.: Tênis de corrida, campanha de outubro" value={campanha} onChange={(e) => { setCampanha(e.target.value); mudou(); }} /></div></div>
          <div className="inputs">
            {CAMPOS.map((c) => (
              <div className="f" key={c.id}>
                <label htmlFor={c.id}>{c.label}</label>
                <div className="box">
                  {c.antes && <span>{c.antes}</span>}
                  <input id={c.id} inputMode={c.modo} placeholder={c.ph} value={campos[c.id]} onChange={(e) => { setCampos({ ...campos, [c.id]: e.target.value }); mudou(); }} />
                  {c.depois && <span>{c.depois}</span>}
                </div>
              </div>
            ))}
          </div>
          <details className="more">
            <summary>Mais detalhes (opcional): margem, envio e momento da conta</summary>
            <div className="inputs">
              <div className="f"><label htmlFor="margem">Margem de lucro</label><div className="box"><input id="margem" inputMode="decimal" placeholder="20" value={campos.margem} onChange={(e) => { setCampos({ ...campos, margem: e.target.value }); mudou(); }} /><span>%</span></div></div>
              <div className="f"><label htmlFor="envio">Modalidade de envio</label><div className="box"><select id="envio" value={envio} onChange={(e) => { setEnvio(e.target.value as Envio); mudou(); }}><option value="">Não informado</option><option value="full">Full</option><option value="correios">Correios / agência</option><option value="flex">Flex</option></select></div></div>
              <div className="f"><label htmlFor="fase">Momento da conta</label><div className="box"><select id="fase" value={fase} onChange={(e) => { setFase(e.target.value as Fase); mudou(); }}><option value="">Não informado</option><option value="inicio">Início (conta nova)</option><option value="cresc">Em crescimento</option></select></div></div>
            </div>
          </details>
        </form>
      </section>

      <section className="summary" aria-live="polite">
        <div className="card verdict">
          <svg className="score" viewBox="0 0 100 100" role="img" aria-label={"Nota " + (a.score ?? "sem dado")}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--soft)" strokeWidth="10" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={`var(--${statusCor(s)})`} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${((a.score ?? 0) / 100) * 264} 264`} transform="rotate(-90 50 50)" />
            <text x="50" y="58" textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--ink)" fontFamily="Bricolage Grotesque, Manrope, system-ui, sans-serif">{a.score ?? "–"}</text>
          </svg>
          <div>
            <div className="eyebrow">Nota de 0 a 100</div>
            <p className="msg">{a.veredito}</p>
            {a.score != null && <span className={"pill " + (a.gargalo ? sGargalo : "good")}>{a.gargalo ? "Gargalo: " + a.gargalo.toLowerCase() : "Funil sem gargalo"}</span>}
          </div>
        </div>
        <div className="card stat"><div className="eyebrow">Investido no período</div><div className="v num">{a.invTotal != null ? brl(a.invTotal) : "–"}</div><div className="s">{a.invTotal != null && d.inv != null && a.dias ? brl(d.inv) + " por dia × " + int(a.dias) + " dias" : "Investimento por dia × dias"}</div></div>
        <div className="card stat"><div className="eyebrow">Vendas pelos anúncios</div><div className="v num">{a.receita != null ? brl(a.receita) : "–"}</div><div className="s">{d.roas != null ? "ROAS de " + dec(d.roas) + "×" : "Investido × ROAS"}</div></div>
        <div className="card stat"><div className="eyebrow">Custo por venda</div><div className="v num">{a.cpv != null ? brl(a.cpv) : "–"}</div><div className="s">{a.cpc != null ? "Custo por clique: " + brl(a.cpc) : "Investido ÷ vendas"}</div></div>
      </section>

      <section className="card" aria-labelledby="hInd">
        <div className="card-h"><h2 id="hInd">Indicadores</h2><span className="aside">O anel enche conforme você chega na meta. Cheio = meta batida</span></div>
        <div className="ind">
          {inds.map((i) => (
            <div className="gcard" key={i.chave}>
              <div className="k">{i.label}</div>
              <div className="ringbox">
                <Anel pct={i.progresso} status={i.status} />
                <div className="c"><div className="v num">{i.valor}</div><div className="p">{i.progresso == null ? "" : i.progresso >= 1 ? "meta batida" : Math.round(i.progresso * 100) + "% da meta"}</div></div>
              </div>
              <span className={"chip " + i.status}>{LABEL[i.status]}</span>
              <div className="s"><b>Meta: </b>{i.meta}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="hFun">
        <div className="card-h"><h2 id="hFun">Funil do anúncio</h2><span className="aside">Onde o comprador está ficando pelo caminho</span></div>
        <div className="funnel">
          {([
            ["Impressões", d.imp, a.ipd != null ? int(a.ipd) + " por dia" : "Total do período", a.st.imp],
            null,
            ["Cliques", d.cli, a.ctr != null ? "CTR de " + dec(a.ctr, 2) + "%" : "Total do período", a.st.ctr],
            null,
            ["Vendas", d.ven, a.conv != null ? "Conversão de " + dec(a.conv, 1) + "%" : "Total do período", a.st.ven],
          ] as ([string, number | null, string, Status] | null)[]).map((e, idx) =>
            e ? (
              <div key={idx} className={"stage " + e[3] + (a.gargalo === e[0] ? " neck" : "")}>
                <div className="eyebrow">{e[0]}</div>
                <div className="v num">{e[1] == null ? "–" : int(e[1])}</div>
                <div className="s">{e[2]}</div>
                {a.gargalo === e[0] && <span className={"chip " + e[3] + " neck-tag"}>Gargalo</span>}
              </div>
            ) : (
              <div key={idx} className={"link " + (idx === 1 ? a.st.ctr : a.st.conv)}>
                <div className="arrow">→</div>
                <div className="r num">{fmtElo(idx === 1 ? a.ipc : a.cpvd)}</div>
                <div className="rl">{idx === 1 ? "impressões por clique" : "cliques por venda"}</div>
              </div>
            )
          )}
        </div>
        <p className="verdict-line">
          {a.gargalo ? <><b>O que fazer: </b>{a.gargaloAcao!.replace(/^./, (c) => c.toUpperCase())}. Veja o plano de ação.</> : d.imp && d.cli != null && d.ven != null ? "Impressões, cliques e conversão estão saudáveis." : "Preencha impressões, cliques e vendas para ver o funil completo."}
        </p>
      </section>

      <section className="card" aria-labelledby="hPlan">
        <div className="card-h"><h2 id="hPlan">Plano de ação</h2><span className="aside">{acoes.length ? acoes.length + " ações, da mais urgente para a menos urgente" : "Marque os passos conforme for fazendo"}</span></div>
        <div className="actions">
          {!acoes.length && <p className="empty">Preencha pelo menos três números para ver as ações recomendadas.</p>}
          {acoes.map((x, i) => {
            const [ps, pl] = PRIO[x.p];
            const todos = [...(x.s ?? []), ...(x.groups ?? []).flatMap((g) => g.s)];
            const n = todos.filter((t) => feitos[chavePasso(x, t)]).length;
            const lista = (passos: string[]) => (
              <ul className="steps">
                {passos.map((t) => {
                  const k = chavePasso(x, t);
                  return (
                    <li className="step" key={k}>
                      <label>
                        <input type="checkbox" checked={!!feitos[k]} onChange={(e) => { const f = { ...feitos }; if (e.target.checked) f[k] = true; else delete f[k]; setFeitos(f); mudou(); }} />
                        <span>{t}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            );
            return (
              <details key={x.t} className={"action " + ps} open={abertos[x.t] ?? i === 0} onToggle={(e) => { const o = (e.currentTarget as HTMLDetailsElement).open; setAbertos((p) => (p[x.t] === o ? p : { ...p, [x.t]: o })); }}>
                <summary>
                  <span className="stripe" />
                  <div><span className={"chip " + ps}>{pl}</span><h3>{x.t}</h3></div>
                  <div className="meta"><span className="progress">{n}/{todos.length} feitos</span><span className="caret">▾</span></div>
                </summary>
                <div className="body">
                  <p className="why">{x.w}</p>
                  {x.s && lista(x.s)}
                  {(x.groups ?? []).map((g) => <div key={g.h}><h4>{g.h}</h4>{lista(g.s)}</div>)}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <details className="card refs">
        <summary><span>Tabelas de referência</span><span className="caret" aria-hidden="true">▾</span></summary>
        <div className="refgrid">
          <div className="tablewrap">
            <table><thead><tr><th>Impressões por clique</th><th>CTR</th><th>Classificação</th><th>Ação</th></tr></thead>
              <tbody>{TIERS.map((t) => <tr key={t.faixa} className={a.tier === t ? "hit" : ""}><td>{t.faixa}</td><td>{t.ctr}</td><td>{t.cls}</td><td>{t.acao}</td></tr>)}</tbody></table>
          </div>
          <div className="tablewrap">
            <table><thead><tr><th>Indicador</th><th>Bom</th><th>Atenção</th><th>Crítico</th></tr></thead>
              <tbody>
                <tr><td>Cliques por venda</td><td>até 10</td><td>10 a 20</td><td>acima de 20</td></tr>
                <tr><td>ROAS</td><td>10× ou mais</td><td>5× a 10×</td><td>abaixo de 5×</td></tr>
                <tr><td>TACOS</td><td>até 5%</td><td>5% a 10%</td><td>acima de 10%</td></tr>
                <tr><td>Impressões por dia</td><td>1.000 ou mais</td><td>300 a 1.000</td><td>abaixo de 300</td></tr>
              </tbody></table>
          </div>
        </div>
      </details>

      <p className="note">Referência de ADS: R$ 50,00 por dia com ROAS 10×. Com a margem preenchida, a régua do ROAS passa a usar o mínimo da sua margem. As faixas são referências gerais para o Mercado Livre e podem variar por categoria.</p>
    </div>
  );
}
