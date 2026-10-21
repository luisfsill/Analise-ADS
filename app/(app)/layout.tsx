import { ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import MenuUsuario from "@/components/MenuUsuario";
import NavLinks from "@/components/NavLinks";
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
          <Link href="/" className="marca"><span className="logo"><BarChart3 /></span><span className="marca-txt">Análise ADS</span></Link>
          <NavLinks />
          <MenuUsuario nome={perfil?.nome || user.email || "Usuário"} email={user.email ?? ""} admin={admin} />
        </div>
      </nav>
      {children}
    </>
  );
}
