import Anel, { statusCor } from "@/components/Anel";
import { ENTRADAS_VAZIAS, analisar, indicadores } from "@/lib/analise/analise";
import { brl, dec, int } from "@/lib/analise/formato";
import type { Status } from "@/lib/analise/tipos";

// Números fictícios; nota, status e metas saem das mesmas regras do painel real.
const EXEMPLO = { ...ENTRADAS_VAZIAS, dias: 30, inv: 40, imp: 96000, cli: 1150, ven: 52, roas: 8.2, tacos: 4.1 };

/** Prévia estática do painel "Nova análise" para a apresentação pública. */
export default function PreviaAnalise() {
  const a = analisar(EXEMPLO);
  const inds = indicadores(a);
  const s: Status = a.score == null ? "none" : a.score >= 75 ? "good" : a.score >= 50 ? "warn" : "bad";
  const campos = [
    ["Dias", "", int(30)],
    ["Investimento por dia", "R$", "40"],
    ["Impressões", "", int(96000)],
    ["Cliques", "", int(1150)],
    ["Vendas", "", int(52)],
    ["ROAS", "×", dec(8.2)],
  ];

  return (
    <div className="lp-janela" role="img" aria-label={`Exemplo do painel: nota ${a.score} de 100, gargalo em ${a.gargalo?.toLowerCase()} e seis indicadores com meta`}>
      <div className="lp-janela-barra" aria-hidden="true"><span /><span /><span /><b>Nova análise · exemplo</b></div>
      <div className="lp-janela-corpo" aria-hidden="true">
        <div className="inputs">
          {campos.map(([rotulo, unidade, valor]) => (
            <div className="f" key={rotulo}>
              <span className="lp-rotulo">{rotulo}</span>
              <div className="box">{unidade === "R$" && <span>R$</span>}<b className="num">{valor}</b>{unidade === "×" && <span>×</span>}</div>
            </div>
          ))}
        </div>
        <div className="summary">
          <div className="card verdict">
            <svg className="score" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--soft)" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={`var(--${statusCor(s)})`} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${((a.score ?? 0) / 100) * 264} 264`} transform="rotate(-90 50 50)" />
              <text x="50" y="58" textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--ink)" style={{ fontFamily: "var(--display)" }}>{a.score}</text>
            </svg>
            <div>
              <div className="eyebrow">Nota de 0 a 100</div>
              <p className="msg">{a.veredito}</p>
              <span className={"pill " + a.st.conv}>Gargalo: {a.gargalo?.toLowerCase()}</span>
            </div>
          </div>
          <div className="card stat"><div className="eyebrow">Investido</div><div className="v num">{brl(a.invTotal!)}</div></div>
          <div className="card stat"><div className="eyebrow">Vendas pelos anúncios</div><div className="v num">{brl(a.receita!)}</div></div>
          <div className="card stat"><div className="eyebrow">Custo por venda</div><div className="v num">{brl(a.cpv!)}</div></div>
        </div>
        <div className="ind">
          {inds.map((i) => (
            <div className="gcard" key={i.chave}>
              <div className="k">{i.label}</div>
              <div className="ringbox">
                <Anel pct={i.progresso} status={i.status} />
                <div className="c"><div className="v num">{i.valor}</div></div>
              </div>
              <div className="s"><b>Meta: </b>{i.meta}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
