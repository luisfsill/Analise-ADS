"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function BotaoSair() {
  const router = useRouter();
  return (
    <button type="button" className="btn" aria-label="Sair" onClick={async () => { await criarClienteNavegador().auth.signOut(); router.replace("/login"); router.refresh(); }}>
      <LogOut /><span className="rot">Sair</span>
    </button>
  );
}
