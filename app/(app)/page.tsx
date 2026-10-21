import { ChevronRight, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { usuarioAtual } from "@/lib/acesso";

export const dynamic = "force-dynamic";

const cor = (n: number | null) => (n == null ? "none" : n >= 75 ? "good" : n >= 50 ? "warn" : "bad");

/** Histórico: só as análises do próprio usuário (mesmo para o admin, que vê os clientes em /admin). */
export default async function Historico() {
  const { supabase, user } = await usuarioAtual();
  const { data: analises, error } = await supabase
    .from("analises")
    .select("id, campanha, nota, gargalo, atualizado_em")
    .eq("user_id", user!.id)
    .order("atualizado_em", { ascending: false })
    .limit(200);

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <h1>Minhas análises</h1>
          <p>Cada análise fica salva com os números, o plano de ação e os passos que você marcou.</p>
        </div>
        <Link href="/analise/nova" className="btn primary"><Plus />Nova análise</Link>
      </header>
      <section className={analises?.length ? "card" : undefined}>
        {error && <p className="msg-erro">Não foi possível carregar as análises. Recarregue a página.</p>}
        {!error && !analises?.length && (
          <div className="vazio">
            <span className="vazio-ico"><ClipboardList /></span>
            <p>Você ainda não salvou nenhuma análise.</p>
            <Link href="/analise/nova" className="btn primary"><Plus />Fazer a primeira análise</Link>
          </div>
        )}
        <div className="lista">
          {analises?.map((a) => (
            <Link key={a.id} href={"/analise/" + a.id} className="item">
              <span className={"nota " + cor(a.nota)}>{a.nota ?? "–"}</span>
              <span>
                <span className="t">{a.campanha || "Análise sem nome"}</span>
                <span className="m" style={{ display: "block" }}>
                  {a.gargalo ? "Gargalo: " + a.gargalo.toLowerCase() : "Funil sem gargalo"}
                </span>
              </span>
              <span className="m">{new Date(a.atualizado_em).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span>
              <ChevronRight className="chev" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
