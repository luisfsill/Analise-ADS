import Link from "next/link";
import { redirect } from "next/navigation";
import BotaoSair from "@/components/BotaoSair";
import { diasRestantes, temAcesso, usuarioAtual } from "@/lib/acesso";
import { LINK_ASSINATURA } from "@/lib/env";

export const dynamic = "force-dynamic";

const fmt = (d: string) => new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

/** Tela de assinatura: aparece quando o teste ou o plano venceu, ou quando a conta ainda não foi liberada. */
export default async function AssinaturaPage() {
  const { user, perfil } = await usuarioAtual();
  if (!user) redirect("/login");
  const liberado = temAcesso(perfil);
  const dias = perfil?.acesso_ate ? diasRestantes(perfil.acesso_ate) : null;

  let titulo = "Sua conta está ativa";
  let texto = perfil?.acesso_ate ? `Seu acesso vale até ${fmt(perfil.acesso_ate)} (${dias} dia${dias === 1 ? "" : "s"}).` : "Seu acesso não tem data de vencimento.";
  if (liberado && perfil?.status === "teste") {
    titulo = "Você está no teste grátis";
    texto = `O teste termina em ${fmt(perfil.acesso_ate!)}. Assine para continuar usando sem interrupção.`;
  }
  if (!liberado) {
    if (!perfil || perfil.status === "inativo") {
      titulo = "Conta aguardando liberação";
      texto = "Sua conta foi criada, mas o acesso ainda não foi liberado. Assine ou fale com o suporte para ativar.";
    } else {
      titulo = perfil.status === "teste" ? "Seu teste grátis terminou" : "Sua assinatura venceu";
      texto = "Suas análises continuam guardadas. Renove o acesso para voltar a usar o sistema.";
    }
  }

  return (
    <main className="auth">
      <div className="card">
        <h1>{titulo}</h1>
        <p className="sub">{texto}</p>
        <div className="pilha">
          {LINK_ASSINATURA && (liberado ? perfil?.status === "teste" : true) && (
            <a className="btn primary" href={LINK_ASSINATURA} target="_blank" rel="noopener noreferrer">
              {liberado ? "Assinar agora" : "Assinar / renovar"}
            </a>
          )}
          {!LINK_ASSINATURA && !liberado && <p className="sub">Entre em contato com o suporte para liberar seu acesso.</p>}
          {liberado && <Link className="btn" href="/">Voltar para o sistema</Link>}
        </div>
        <div className="links">
          <span className="m">{user.email}</span>
          <BotaoSair />
        </div>
      </div>
    </main>
  );
}
