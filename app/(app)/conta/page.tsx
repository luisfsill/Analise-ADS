import { diasRestantes, usuarioAtual } from "@/lib/acesso";
import FormConta from "./FormConta";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = { teste: "Teste grátis", ativo: "Ativa", inativo: "Inativa" };

export default async function ContaPage() {
  const { user, perfil } = await usuarioAtual();
  const dias = diasRestantes(perfil?.acesso_ate ?? null);
  return (
    <div className="wrap estreito">
      <header className="top">
        <div>
          <h1>Minha conta</h1>
          <p>{user?.email}</p>
        </div>
      </header>
      <section className="card">
        <div className="card-h"><h2>Assinatura</h2></div>
        <p className="linha-info">
          <b>Situação:</b> {perfil?.papel === "admin" ? "Administrador" : STATUS[perfil?.status ?? "inativo"]}
          {perfil?.acesso_ate && <> · <b>Vence em:</b> {new Date(perfil.acesso_ate).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })} ({dias} dia{dias === 1 ? "" : "s"})</>}
          {!perfil?.acesso_ate && perfil?.status === "ativo" && <> · sem data de vencimento</>}
        </p>
      </section>
      <FormConta nomeInicial={perfil?.nome ?? ""} userId={user!.id} />
    </div>
  );
}
