import { CircleAlert } from "lucide-react";
import { ATUALIZADO_EM, dadosPendentes } from "@/lib/legal";

export interface SecaoLegal {
  id: string;
  titulo: string;
  conteudo: React.ReactNode;
}

/** Layout dos documentos legais: título, data, índice lateral fixo e seções numeradas. */
export default function DocumentoLegal({ titulo, resumo, secoes }: { titulo: string; resumo: React.ReactNode; secoes: SecaoLegal[] }) {
  return (
    <main className="legal">
      <header className="legal-topo">
        <p className="lp-olho">Documento legal</p>
        <h1>{titulo}</h1>
        <p className="legal-data">Última atualização: {ATUALIZADO_EM}</p>
        <div className="legal-resumo">{resumo}</div>
        {dadosPendentes() && (
          <p className="legal-aviso" role="note"><CircleAlert /><span>Os dados do responsável entre colchetes ainda precisam ser preenchidos (arquivo <code>lib/legal.ts</code>).</span></p>
        )}
      </header>
      <div className="legal-grade">
        <nav className="legal-indice" aria-label="Neste documento">
          <p>Neste documento</p>
          <ol>
            {secoes.map((s, i) => <li key={s.id}><a href={"#" + s.id}><span className="num">{i + 1}.</span>{s.titulo}</a></li>)}
          </ol>
        </nav>
        <article className="legal-texto">
          {secoes.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={s.id + "-t"}>
              <h2 id={s.id + "-t"}><span className="num">{i + 1}.</span> {s.titulo}</h2>
              {s.conteudo}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
