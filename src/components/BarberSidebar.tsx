"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menu = [
  { nome: "Agenda", href: "/inicio" },
  { nome: "Clientes", href: "/inicio/clientes" },
  { nome: "Serviços", href: "/inicio/servicos" },
  { nome: "Mais", href: "/inicio/mais" },
];

export default function BarberSidebar() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="fixed left-4 top-4 z-[80] rounded-2xl bg-amber-400 px-4 py-3 text-xl font-black text-neutral-950 shadow-xl lg:hidden"
      >
        ☰
      </button>

      {aberto && (
        <button
          onClick={() => setAberto(false)}
          className="fixed inset-0 z-[90] bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[100] h-screen w-72 border-r border-white/10 bg-neutral-950 p-5 text-white transition-transform duration-300 lg:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="rounded-3xl bg-amber-400 p-5 text-neutral-950">
          <p className="text-xs font-black uppercase tracking-[0.3em]">PH10</p>
          <h1 className="mt-2 text-2xl font-black">Pedro Henrique</h1>
          <p className="mt-1 text-sm font-medium text-neutral-800">
            Painel da barbearia
          </p>
        </div>

        <nav className="mt-6 space-y-2">
          {menu.map((item) => {
            const ativo = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setAberto(false)}
                className={`block rounded-2xl px-4 py-3 text-sm font-black transition ${
                  ativo
                    ? "bg-white text-neutral-950"
                    : "text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.nome}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-3xl bg-neutral-900 p-4">
          <p className="text-sm font-bold">Link público</p>
          <p className="mt-1 text-sm text-neutral-400">/b/ph10</p>
        </div>

        <button
          onClick={() => setAberto(false)}
          className="mt-6 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-black lg:hidden"
        >
          Fechar
        </button>
      </aside>
    </>
  );
}