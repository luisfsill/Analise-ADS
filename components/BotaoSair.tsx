"use client";
import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function BotaoSair() {
  const router = useRouter();
  return (
    <button type="button" className="btn" onClick={async () => { await criarClienteNavegador().auth.signOut(); router.replace("/login"); router.refresh(); }}>
      Sair
    </button>
  );
}
