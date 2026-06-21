"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Status = "Confirmado" | "Pendente" | "Cancelado";

const dias = [
  { data: "2026-06-21", semana: "Dom", dia: "21" },
  { data: "2026-06-22", semana: "Seg", dia: "22" },
  { data: "2026-06-23", semana: "Ter", dia: "23" },
  { data: "2026-06-24", semana: "Qua", dia: "24" },
  { data: "2026-06-25", semana: "Qui", dia: "25" },
  { data: "2026-06-26", semana: "Sex", dia: "26" },
  { data: "2026-06-27", semana: "Sáb", dia: "27" },
];

const agendamentos = [
  {
    id: 1,
    data: "2026-06-21",
    hora: "09:00",
    cliente: "João Silva",
    servico: "Corte",
    valor: 40,
    status: "Confirmado" as Status,
    whatsapp: "21999999999",
  },
  {
    id: 2,
    data: "2026-06-21",
    hora: "10:30",
    cliente: "Rafael Costa",
    servico: "Corte + barba",
    valor: 70,
    status: "Pendente" as Status,
    whatsapp: "21988888888",
  },
  {
    id: 3,
    data: "2026-06-21",
    hora: "14:00",
    cliente: "Lucas Mendes",
    servico: "Barba",
    valor: 30,
    status: "Confirmado" as Status,
    whatsapp: "21977777777",
  },
  {
    id: 4,
    data: "2026-06-22",
    hora: "11:00",
    cliente: "Matheus Lima",
    servico: "Corte degradê",
    valor: 45,
    status: "Pendente" as Status,
    whatsapp: "21966666666",
  },
  {
    id: 5,
    data: "2026-06-22",
    hora: "16:00",
    cliente: "Bruno Alves",
    servico: "Corte + sobrancelha",
    valor: 55,
    status: "Confirmado" as Status,
    whatsapp: "21955555555",
  },
];

function dinheiro(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function statusClass(status: Status) {
  if (status === "Confirmado") return "bg-green-500/10 text-green-300";
  if (status === "Pendente") return "bg-yellow-500/10 text-yellow-300";
  return "bg-red-500/10 text-red-300";
}

function whatsappLink(item: (typeof agendamentos)[number]) {
  const msg = encodeURIComponent(
    `Olá, ${item.cliente}! Seu horário na PH10 está confirmado para ${item.hora}, serviço: ${item.servico}.`
  );

  return `https://wa.me/55${item.whatsapp}?text=${msg}`;
}


export default function InicioPage() {
  const [diaSelecionado, setDiaSelecionado] = useState("2026-06-21");

  const agendamentosDoDia = useMemo(() => {
    return agendamentos
      .filter((item) => item.data === diaSelecionado)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [diaSelecionado]);

  const totalPendentes = agendamentosDoDia.filter((a) => a.status === "Pendente").length;
  const totalConfirmados = agendamentosDoDia.filter((a) => a.status === "Confirmado").length;
  const faturamento = agendamentosDoDia
    .filter((a) => a.status !== "Cancelado")
    .reduce((total, a) => total + a.valor, 0);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-md px-4 pb-24 pt-5 lg:max-w-6xl lg:pb-8">
        <header className="rounded-[2rem] bg-neutral-900 p-5">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
            PH10
          </p>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black">Agenda</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Pedro Henrique • controle do dia
              </p>
            </div>

            <button className="rounded-2xl bg-amber-400 px-4 py-3 text-xs font-black text-neutral-950">
              + Novo
            </button>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-3xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Agendamentos</p>
            <strong className="mt-2 block text-3xl">{agendamentosDoDia.length}</strong>
          </div>

          <div className="rounded-3xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Pendentes</p>
            <strong className="mt-2 block text-3xl text-yellow-300">{totalPendentes}</strong>
          </div>

          <div className="rounded-3xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Confirmados</p>
            <strong className="mt-2 block text-3xl text-green-300">{totalConfirmados}</strong>
          </div>

          <div className="rounded-3xl bg-amber-400 p-4 text-neutral-950">
            <p className="text-xs font-bold">Previsto</p>
            <strong className="mt-2 block text-2xl">{dinheiro(faturamento)}</strong>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-black">Dias</h2>

          <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
            {dias.map((dia) => {
              const lista = agendamentos.filter((a) => a.data === dia.data);
              const pendentes = lista.filter((a) => a.status === "Pendente").length;
              const previsto = lista.reduce((total, a) => total + a.valor, 0);
              const ativo = dia.data === diaSelecionado;

              return (
                <button
                  key={dia.data}
                  onClick={() => setDiaSelecionado(dia.data)}
                  className={`min-w-[96px] rounded-3xl border p-3 text-left ${
                    ativo
                      ? "border-amber-400 bg-amber-400 text-neutral-950"
                      : "border-white/10 bg-neutral-900 text-white"
                  }`}
                >
                  <span className="text-xs font-bold">{dia.semana}</span>
                  <strong className="block text-3xl">{dia.dia}</strong>
                  <p className="mt-1 text-xs opacity-70">
                    {lista.length} marc. • {pendentes} pend.
                  </p>
                  <p className="mt-1 text-xs font-black">{dinheiro(previsto)}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 space-y-3">
          {agendamentosDoDia.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-neutral-900 p-6 text-center">
              <p className="text-lg font-black">Agenda vazia</p>
              <p className="mt-2 text-sm text-neutral-400">
                Nenhum cliente marcado para esse dia.
              </p>
            </div>
          ) : (
            agendamentosDoDia.map((item) => (
              <article key={item.id} className="rounded-[1.75rem] bg-neutral-900 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-amber-400">{item.hora}</p>
                    <h3 className="mt-1 text-lg font-black">{item.cliente}</h3>
                    <p className="text-sm text-neutral-400">{item.servico}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-black">{dinheiro(item.valor)}</p>
                    <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black ${statusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
                  <a href={whatsappLink(item)} target="_blank" className="rounded-2xl bg-green-500 px-3 py-3 text-center text-xs font-black text-white">
                    WhatsApp
                  </a>
                  <button className="rounded-2xl bg-white/10 px-3 py-3 text-xs font-black">
                    Confirmar
                  </button>
                  <button className="rounded-2xl bg-white/10 px-3 py-3 text-xs font-black">
                    Remarcar
                  </button>
                  <button className="rounded-2xl bg-red-500/10 px-3 py-3 text-xs font-black text-red-300">
                    Cancelar
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}