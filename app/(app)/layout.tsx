import Link from "next/link";
import { redirect } from "next/navigation";
import BotaoSair from "@/components/BotaoSair";
import { diasRestantes, temAcesso, usuarioAtual } from "@/lib/acesso";

export const dynamic = "force-dynamic";

/** Área logada: só entra quem tem login E assinatura/teste válido. */
export default async function AreaLogada({ children }: { children: React.ReactNode }) {
  const { user, perfil } = await usuarioAtual();
  if (!user) redirect("/login");
  if (!temAcesso(perfil)) redirect("/assinatura");

  const admin = perfil?.papel === "admin";
  const dias = perfil?.status === "teste" ? diasRestantes(perfil.acesso_ate) : null;

  return (
    <>
      {dias != null && (
        <div className="faixa-teste" role="status">
          Teste grátis: {dias === 0 ? "termina hoje" : dias === 1 ? "falta 1 dia" : `faltam ${dias} dias`}.{" "}
          <Link href="/assinatura">Assinar agora</Link>
        </div>
      )}
      <nav className="nav">
        <div className="in">
          <Link href="/" className="marca">Análise de anúncios</Link>
          <div className="dir">
            {admin && <Link href="/admin" className="lnk">Admin</Link>}
            <Link href="/conta" className="lnk" title={user.email ?? ""}>{perfil?.nome || user.email}</Link>
            <Link href="/analise/nova" className="btn primary">Nova análise</Link>
            <BotaoSair />
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}
