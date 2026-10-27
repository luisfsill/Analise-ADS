import { Activity, ArrowRight, BarChart3, Check, FileDown, Gauge, Gift, History, Keyboard, ListChecks, TrendingUp, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import BotaoTema from "@/components/BotaoTema";
import InclinaPrevia from "@/components/InclinaPrevia";
import ModalLogin from "@/components/ModalLogin";
import MenuSecoesMobile from "@/components/MenuSecoesMobile";
import NavSecoes from "@/components/NavSecoes";
import PreviaAnalise from "@/components/PreviaAnalise";
import { ROTA_CADASTRO, ROTA_LOGIN } from "@/lib/rotas";
import { ENTRADAS_VAZIAS, analisar, indicadores } from "@/lib/analise/analise";
import "./landing.css";

export const metadata: Metadata = {
  title: "Análise ADS: diagnóstico de campanhas de anúncios",
  description: "Digite os números do Mercado Livre Ads e receba na hora nota de 0 a 100, gargalo do funil e plano de ação.",
};

const SECOES = [
  ["#recursos", "Recursos"],
  ["#como-funciona", "Como funciona"],
  ["#indicadores", "Indicadores"],
  ["#planos", "Planos"],
] as const;

const PASSOS = [
  { Icone: Keyboard, titulo: "Insira os números", texto: "Dias, investimento, impressões, cliques, vendas, ROAS e TACOS do período, direto do painel de anúncios." },
  { Icone: Gauge, titulo: "Diagnóstico na hora", texto: "A nota, o gargalo do funil e os indicadores se atualizam a cada número digitado." },
  { Icone: ListChecks, titulo: "Siga o plano de ação", texto: "Ações em ordem de prioridade, com passos para marcar conforme você executa." },
];

const PLANOS = [
  { nome: "Grátis", preco: "R$ 0", periodo: "por 7 dias", texto: "Teste tudo, sem cartão de crédito.", cta: "Começar teste grátis" },
];

/** Posições fixas dos flocos do banner (sem aleatório: renderização igual no servidor e no navegador). */
const FLOCOS = [6, 14, 22, 31, 39, 47, 55, 63, 71, 79, 87, 94];

const INCLUSO = ["Diagnóstico com nota de 0 a 100", "Plano de ação em checklist", "Relatório em PDF", "Histórico de análises salvo"];

/** Apresentação pública. Visitante em "/" cai aqui pelo proxy.ts; logado vê o histórico. */
export default function Apresentacao() {
  const metas = indicadores(analisar(ENTRADAS_VAZIAS));
  return (
    <div className="lp">
      <nav className="nav lp-nav">
        <div className="in">
          <Link href="/" className="marca"><span className="logo"><BarChart3 /></span><span className="marca-txt">Análise ADS</span></Link>
          <NavSecoes secoes={SECOES} />
          <div className="btns">
            <BotaoTema className="btn icone lp-ghost lp-nav-tema" />
            <Link href={ROTA_LOGIN} scroll={false} className="btn lp-ghost lp-nav-entrar">Entrar</Link>
            <Link href={ROTA_CADASTRO} scroll={false} className="btn primary lp-nav-cta">Começar agora</Link>
            <MenuSecoesMobile secoes={SECOES} />
          </div>
        </div>
      </nav>

      <main>
        <section className="lp-hero">
          <span className="lp-badge"><Zap />Novo: diagnóstico em tempo real</span>
          <h1 className="lp-titulo">Descubra onde sua campanha está travando.</h1>
          <p className="lp-sub">Digite os números do período do Mercado Livre Ads e receba na hora uma nota de 0 a 100, o gargalo do funil e um plano de ação priorizado.</p>
          <div className="btns lp-ctas">
            <Link href={ROTA_CADASTRO} scroll={false} className="btn primary lp-cta">Começar teste grátis<ArrowRight /></Link>
            <a href="#como-funciona" className="btn lp-ghost lp-cta">Ver como funciona</a>
          </div>
          <p className="lp-nota">7 dias grátis · sem cartão de crédito</p>
          <InclinaPrevia><PreviaAnalise /></InclinaPrevia>
        </section>

        <section id="recursos" className="lp-secao" aria-labelledby="hRec">
          <p className="lp-olho">Recursos</p>
          <h2 id="hRec" className="lp-h2">Tudo o que você precisa para decidir o próximo passo.</h2>
          <div className="lp-bento">
            <article className="lp-tile lp-tile-grande">
              <span className="lp-ico"><Activity /></span>
              <h3>Diagnóstico automático</h3>
              <p>Nota de 0 a 100, o ponto exato onde o funil trava (impressões, cliques ou vendas) e o que fazer primeiro.</p>
              <div className="lp-funil" aria-hidden="true">
                <span className="chip good">Impressões</span><ArrowRight /><span className="chip good">Cliques</span><ArrowRight /><span className="chip bad">Vendas</span>
              </div>
            </article>
            <article className="lp-tile">
              <span className="lp-ico"><TrendingUp /></span>
              <h3>ROAS e TACOS</h3>
              <p>Retorno, custo por venda e peso dos anúncios no faturamento, comparados com metas claras.</p>
            </article>
            <article className="lp-tile">
              <span className="lp-ico"><FileDown /></span>
              <h3>Exportação em PDF</h3>
              <p>Relatório pronto para enviar ao cliente ou ao sócio, com números e plano de ação.</p>
            </article>
            <article className="lp-tile lp-tile-largo">
              <span className="lp-ico"><History /></span>
              <div>
                <h3>Histórico de análises</h3>
                <p>Cada análise fica salva com os números e os passos marcados. Refaça com 7, 15 e 30 dias e acompanhe a evolução.</p>
              </div>
            </article>
          </div>
        </section>

        <section id="como-funciona" className="lp-secao" aria-labelledby="hComo">
          <p className="lp-olho">Como funciona</p>
          <h2 id="hComo" className="lp-h2">Três passos, menos de um minuto.</h2>
          <ol className="lp-passos">
            {PASSOS.map(({ Icone, titulo, texto }, n) => (
              <li key={titulo} className="lp-passo">
                <span className="lp-ico"><Icone /></span>
                <span className="lp-num">Passo {n + 1}</span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="indicadores" className="lp-secao" aria-labelledby="hInd">
          <p className="lp-olho">Indicadores</p>
          <h2 id="hInd" className="lp-h2">Seis números, cada um com a sua meta.</h2>
          <dl className="lp-metas">
            {metas.map((i) => (
              <div key={i.chave} className="lp-meta"><dt>{i.label}</dt><dd className="num">{i.meta}</dd></div>
            ))}
          </dl>
        </section>

        <section id="planos" className="lp-secao" aria-labelledby="hPlanos">
          <p className="lp-olho">Planos</p>
          <h2 id="hPlanos" className="lp-h2">Comece grátis. Assine quando fizer sentido.</h2>
          <div className="lp-planos">
            {PLANOS.map((p) => (
              <article key={p.nome} className="lp-tile lp-plano">
                <h3>{p.nome}</h3>
                <p className="lp-preco"><span className="num">{p.preco}</span> {p.periodo}</p>
                <p>{p.texto}</p>
                <ul>{INCLUSO.map((item) => <li key={item}><Check />{item}</li>)}</ul>
                <Link href={ROTA_CADASTRO} scroll={false} className="btn lp-cta">{p.cta}</Link>
              </article>
            ))}
            <aside className="lp-tile lp-plano lp-promo" aria-labelledby="hPromo">
              <div className="lp-flocos" aria-hidden="true">
                {FLOCOS.map((x, i) => <span key={x} style={{ left: x + "%", animationDelay: -i * 0.7 + "s", animationDuration: 7 + (i % 4) * 1.5 + "s" }} />)}
              </div>
              <span className="lp-promo-selo"><Gift />Tempo limitado</span>
              <h3 id="hPromo" className="lp-promo-titulo">Pro</h3>
              <p className="lp-promo-sub">Promoção de final de ano</p>
              <p className="lp-promo-preco">
                <span>de <s>R$ 98</s> por</span>
                <b className="num">R$ 44</b><small>por mês</small>
              </p>
              <p className="lp-promo-txt">Para quem analisa campanhas toda semana. Cobrança mensal.</p>
              <ul>{INCLUSO.map((item) => <li key={item}><Check />{item}</li>)}</ul>
              <Link href={ROTA_CADASTRO} scroll={false} className="btn lp-promo-cta">Garantir meu desconto<ArrowRight /></Link>
            </aside>
          <article className="lp-tile lp-plano lp-promo lp-anual">
            <div className="lp-flocos" aria-hidden="true">
              {FLOCOS.map((x, i) => <span key={x} style={{ left: x + "%", animationDelay: -i * 0.7 + "s", animationDuration: 7 + (i % 4) * 1.5 + "s" }} />)}
            </div>
            <span className="lp-promo-selo"><Gift />Tempo limitado</span>
            <h3 className="lp-promo-titulo">Pro anual</h3>
            <p className="lp-promo-sub">Promoção de final de ano</p>
            <p className="lp-promo-preco">
              <span>de <s>R$ 1.176</s> por</span>
              <b className="num">R$ 528</b><small>por ano</small>
            </p>
            <p className="lp-promo-txt">Para quem analisa campanhas toda semana. Equivale a R$ 44 por mês.</p>
            <ul>{INCLUSO.map((item) => <li key={item}><Check />{item}</li>)}</ul>
            <Link href={ROTA_CADASTRO} scroll={false} className="btn lp-promo-cta">Assinar o plano anual<ArrowRight /></Link>
          </article>
          </div>
          <p className="lp-nota">No fim do teste, assine para continuar. Suas análises continuam guardadas.</p>
        </section>

        <section className="lp-secao lp-final" aria-labelledby="hFinal">
          <h2 id="hFinal" className="lp-h2">Sua próxima campanha começa com um diagnóstico.</h2>
          <p className="lp-sub">Crie sua conta e faça a primeira análise em menos de um minuto.</p>
          <Link href={ROTA_CADASTRO} scroll={false} className="btn primary lp-cta">Começar teste grátis<ArrowRight /></Link>
        </section>
      </main>

      <footer className="lp-rodape">
        <div className="lp-rodape-in">
          <span className="marca-rodape"><span className="logo"><BarChart3 /></span>Análise ADS</span>
          <nav className="lp-rodape-links" aria-label="Rodapé">
            <div className="lp-rodape-grupo">
              {SECOES.map(([href, rotulo]) => <a key={href} href={href}>{rotulo}</a>)}
            </div>
            <span className="lp-rodape-divisoria" aria-hidden="true" />
            <div className="lp-rodape-grupo">
              <Link href="/termos">Termos de Uso</Link>
              <Link href="/privacidade">Política de Privacidade</Link>
            </div>
          </nav>
          <span className="lp-rodape-fim">© {new Date().getFullYear()} Análise ADS</span>
        </div>
      </footer>

      <Suspense><ModalLogin /></Suspense>
    </div>
  );
}
