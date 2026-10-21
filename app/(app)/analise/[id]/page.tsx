import { notFound } from "next/navigation";
import Analisador, { type RegistroAnalise } from "@/components/Analisador";
import { usuarioAtual } from "@/lib/acesso";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AnaliseSalva({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase, user } = await usuarioAtual();
  const { data } = await supabase
    .from("analises")
    .select("id, user_id, campanha, entradas, passos_feitos, atualizado_em")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const somenteLeitura = data.user_id !== user?.id; // admin olhando a análise de um cliente
  return <Analisador key={data.id} registro={data as RegistroAnalise} somenteLeitura={somenteLeitura} />;
}
