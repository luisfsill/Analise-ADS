import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { usuarioAtual } from "@/lib/acesso";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Admin: análises de um cliente (somente leitura, para suporte). */
export default async function AnalisesDoCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, perfil } = await usuarioAtual();
  if (perfil?.papel !== "admin" || !UUID.test(id)) notFound();
  const [{ data: cliente }, { data: analises }] = await Promise.all([
    supabase.from("perfis").select("nome, email").eq("id", id).maybeSingle(),
    supabase.from("analises").select("id, campanha, nota, gargalo, atualizado_em").eq("user_id", id).order("atualizado_em", { ascending: false }).limit(500),
  ]);
  if (!cliente) notFound();
  return (
    <div className="wrap">
      <header className="top">
        <div>
          <h1>{cliente.nome || cliente.email}</h1>
          <p>{cliente.email} · {analises?.length ?? 0} análise(s). <Link href="/admin">Voltar para clientes</Link></p>
        </div>
      </header>
      <section className="card">
        <div className="lista">
          {analises?.map((a) => (
            <Link key={a.id} href={"/analise/" + a.id} className="item">
              <span className={"nota " + (a.nota == null ? "none" : a.nota >= 75 ? "good" : a.nota >= 50 ? "warn" : "bad")}>{a.nota ?? "–"}</span>
              <span><span className="t">{a.campanha || "Análise sem nome"}</span><span className="m" style={{ display: "block" }}>{a.gargalo ? "Gargalo: " + a.gargalo.toLowerCase() : "Funil sem gargalo"}</span></span>
              <span className="m">{new Date(a.atualizado_em).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span><ChevronRight className="chev" />
            </Link>
          ))}
          {!analises?.length && <p className="m">Este cliente ainda não salvou análises.</p>}
        </div>
      </section>
    </div>
  );
}
