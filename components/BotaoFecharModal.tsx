"use client";
import { X } from "lucide-react";

export default function BotaoFecharModal({ aoFechar }: { aoFechar: () => void }) {
  return (
    <button type="button" className="btn icone fechar-modal" onClick={aoFechar} aria-label="Fechar">
      <X />
    </button>
  );
}
