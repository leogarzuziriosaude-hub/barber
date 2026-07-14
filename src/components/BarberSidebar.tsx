"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menu = [
  { nome: "Início", href: "/inicio", icon: "⌂" },
  { nome: "Agenda", href: "/inicio/agenda", icon: "◷" },
  { nome: "Histórico", href: "/inicio/historico", icon: "◴" },
  { nome: "Clientes", href: "/inicio/clientes", icon: "◉" },
  { nome: "Serviços", href: "/inicio/servicos", icon: "✦" },
];

export default function BarberSidebar() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button onClick={() => setAberto(true)} aria-label="Abrir menu" className="mobile-menu-trigger fixed left-4 z-[80] grid h-11 w-11 place-items-center rounded-full border border-[#eee2c9]/20 bg-[#302b27] text-lg text-[#eee2c9] shadow-xl lg:hidden">☰</button>
      {aberto && <button onClick={() => setAberto(false)} aria-label="Fechar menu" className="fixed inset-0 z-[90] bg-black/65 backdrop-blur-sm lg:hidden" />}

      <aside className={`mobile-sidebar fixed left-0 top-0 z-[100] flex w-72 flex-col border-r border-[#eee2c9]/10 bg-[#211f1c] p-5 text-[#f3ead8] transition-transform duration-300 lg:translate-x-0 ${aberto ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="border-b border-[#eee2c9]/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full border border-[#d8c29e]/50 text-sm font-black text-[#d8c29e]">PH</div>
            <div>
              <p className="display-font text-xl leading-none">PH10 Barber</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[.2em] text-[#9f9487]">Estúdio masculino</p>
            </div>
          </div>
        </div>

        <nav className="mt-7 space-y-1.5">
          <p className="mb-3 px-3 text-[9px] font-black uppercase tracking-[.28em] text-[#776f66]">Painel de controle</p>
          {menu.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setAberto(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${ativo ? "bg-[#e7d7b8] text-[#24211e]" : "text-[#aaa095] hover:bg-[#eee2c9]/[.06] hover:text-[#f3ead8]"}`}>
                <span className="w-5 text-center text-base">{item.icon}</span>{item.nome}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-[#eee2c9]/10 bg-[#2c2824] p-4">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#a89d91]">Link público</p>
          <p className="mt-2 font-mono text-sm text-[#e1c89f]">/b/ph10</p>
          <Link href="/b/ph10" className="mt-4 inline-flex text-[10px] font-black uppercase tracking-[.14em] text-[#f3ead8]">Visualizar página →</Link>
        </div>
      </aside>
    </>
  );
}
