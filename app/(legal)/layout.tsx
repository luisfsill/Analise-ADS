import { BarChart3 } from "lucide-react";
import Link from "next/link";
import BotaoTema from "@/components/BotaoTema";
import { ROTA_CADASTRO, ROTA_LOGIN } from "@/lib/rotas";
import "../apresentacao/landing.css";
import "./legal.css";

/** Páginas públicas de Termos de Uso e Política de Privacidade, no visual da apresentação. */
export default function LayoutLegal({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp">
      <nav className="nav lp-nav lp-nav-simples">
        <div className="in">
          <Link href="/" className="marca"><span className="logo"><BarChart3 /></span><span className="marca-txt">Análise ADS</span></Link>
          <div className="btns">
            <BotaoTema className="btn icone lp-ghost" />
            <Link href={ROTA_LOGIN} className="btn lp-ghost">Entrar</Link>
            <Link href={ROTA_CADASTRO} className="btn primary lp-nav-cta">Começar agora</Link>
          </div>
        </div>
      </nav>
      {children}
      <footer className="lp-rodape">
        <div className="lp-rodape-in">
          <span className="marca-rodape"><span className="logo"><BarChart3 /></span>Análise ADS</span>
          <nav className="lp-rodape-links" aria-label="Rodapé">
            <div className="lp-rodape-grupo">
              <Link href="/">Início</Link>
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
    </div>
  );
}
