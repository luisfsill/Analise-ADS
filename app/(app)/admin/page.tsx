import { notFound } from "next/navigation";
import { usuarioAtual } from "@/lib/acesso";
import PainelAdmin, { type UsuarioAdmin } from "./PainelAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { supabase, user, perfil } = await usuarioAtual();
  if (perfil?.papel !== "admin") notFound();
  const { data, error } = await supabase.rpc("admin_listar_usuarios");
  return (
    <div className="wrap">
      <header className="top">
        <div>
          <h1>Clientes</h1>
          <p>Libere, renove ou bloqueie o acesso de cada cliente. O bloqueio vale na hora: sem acesso, o cliente não cria nem edita análises.</p>
        </div>
      </header>
      {error ? (
        <section className="card"><p className="msg-erro">Não foi possível carregar os usuários. Confira se o arquivo supabase/schema.sql foi rodado por inteiro.</p></section>
      ) : (
        <PainelAdmin usuarios={(data ?? []) as UsuarioAdmin[]} meuId={user!.id} podeCriar={!!process.env.SUPABASE_SERVICE_ROLE_KEY} />
      )}
    </div>
  );
}
