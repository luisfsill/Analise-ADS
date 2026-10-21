"use client";
import { House } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [{ href: "/", rotulo: "Início", Icone: House }];

/** Menus principais da barra superior; o atual fica destacado. */
export default function NavLinks() {
  const caminho = usePathname();
  return (
    <div className="nav-links">
      {LINKS.map(({ href, rotulo, Icone }) => {
        const ativo = caminho === href;
        return (
          <Link key={href} href={href} className={"lnk" + (ativo ? " ativo" : "")} aria-current={ativo ? "page" : undefined}>
            <Icone />
            <span>{rotulo}</span>
          </Link>
        );
      })}
    </div>
  );
}
