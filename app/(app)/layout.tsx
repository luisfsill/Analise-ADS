import { ArrowRight, BarChart3, Plus, Shield, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import BotaoSair from "@/components/BotaoSair";
import BotaoTema from "@/components/BotaoTema";
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
          <Link href="/assinatura">Assinar agora <ArrowRight /></Link>
        </div>
      )}
      <nav className="nav">
        <div className="in">
          <Link href="/" className="marca"><span className="logo"><BarChart3 /></span>Análise de anúncios</Link>
          <div className="dir">
            {admin && <Link href="/admin" className="lnk"><Shield /><span>Admin</span></Link>}
            <Link href="/conta" className="lnk" title={user.email ?? ""}><UserRound /><span>{perfil?.nome || user.email}</span></Link>
            <BotaoTema />
            <Link href="/analise/nova" className="btn primary"><Plus /><span className="rot">Nova análise</span></Link>
            <BotaoSair />
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}
