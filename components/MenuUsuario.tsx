"use client";
import { ChevronDown, LogOut, Monitor, Moon, Shield, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { aplicarTema, ROTULO_TEMA, temaAtual, type Tema } from "@/lib/tema";

const TEMAS: { valor: Tema; Icone: typeof Sun }[] = [
  { valor: "sistema", Icone: Monitor },
  { valor: "claro", Icone: Sun },
  { valor: "escuro", Icone: Moon },
];

function iniciais(nome: string) {
  const partes = nome.trim().split(/[\s@._-]+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase() || "?";
}

/** Nome do usuário na barra superior; ao clicar abre conta, admin (só para admin), tema e sair. */
export default function MenuUsuario({ nome, email, admin }: { nome: string; email: string; admin: boolean }) {
  const router = useRouter();
  const caminho = usePathname();
  const idPainel = useId();
  const [aberto, setAberto] = useState(false);
  const [tema, setTema] = useState<Tema>("sistema");
  const [saindo, setSaindo] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lê o tema já aplicado no <html> só depois da hidratação
    setTema(temaAtual());
  }, []);

  // Fecha ao trocar de página
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza o menu com a navegação
    setAberto(false);
  }, [caminho]);

  // Fecha com clique fora ou Esc (devolvendo o foco ao botão)
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        botao.current?.focus();
      }
    };
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  function escolherTema(novo: Tema) {
    aplicarTema(novo);
    setTema(novo);
  }

  async function sair() {
    setSaindo(true);
    await criarClienteNavegador().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="menu-usuario" ref={raiz}>
      <button
        ref={botao}
        type="button"
        className={"usuario-btn" + (aberto ? " aberto" : "")}
        aria-expanded={aberto}
        aria-controls={idPainel}
        aria-label={`Menu de ${nome}`}
        onClick={() => setAberto((a) => !a)}
      >
        <span className="avatar" aria-hidden="true">{iniciais(nome)}</span>
        <span className="usuario-nome">{nome}</span>
        <ChevronDown className="seta" aria-hidden="true" />
      </button>

      {aberto && (
        <div className="menu-painel" id={idPainel}>
          <div className="menu-cabeca">
            <span className="avatar grande" aria-hidden="true">{iniciais(nome)}</span>
            <span className="menu-id">
              <span className="menu-nome">{nome}</span>
              <span className="menu-email">{email}</span>
            </span>
          </div>

          <div className="menu-grupo">
            <Link href="/conta" className="menu-item"><UserRound />Minha conta</Link>
            {admin && <Link href="/admin" className="menu-item"><Shield />Painel admin</Link>}
          </div>

          <div className="menu-grupo">
            <span className="menu-rotulo" id={idPainel + "-tema"}>Aparência</span>
            <div className="tema-seg" role="radiogroup" aria-labelledby={idPainel + "-tema"}>
              {TEMAS.map(({ valor, Icone }) => (
                <button
                  key={valor}
                  type="button"
                  role="radio"
                  aria-checked={tema === valor}
                  className={tema === valor ? "ativo" : ""}
                  onClick={() => escolherTema(valor)}
                >
                  <Icone aria-hidden="true" />
                  <span>{ROTULO_TEMA[valor]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="menu-grupo">
            <button type="button" className="menu-item perigo" onClick={() => void sair()} disabled={saindo} aria-busy={saindo}>
              <LogOut />{saindo ? "Saindo…" : "Sair"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
