"use client";

import { useMemo, useState } from "react";

type StatusAgendamento = "Confirmado" | "Pendente" | "Cancelado";

type Agendamento = {
  id: number;
  data: string;
  hora: string;
  cliente: string;
  servico: string;
  profissional: string;
  valor: number;
  status: StatusAgendamento;
  whatsapp: string;
};

const dias = [
  {
    data: "2026-06-21",
    diaSemana: "Dom",
    diaMes: "21",
  },
  {
    data: "2026-06-22",
    diaSemana: "Seg",
    diaMes: "22",
  },
  {
    data: "2026-06-23",
    diaSemana: "Ter",
    diaMes: "23",
  },
  {
    data: "2026-06-24",
    diaSemana: "Qua",
    diaMes: "24",
  },
  {
    data: "2026-06-25",
    diaSemana: "Qui",
    diaMes: "25",
  },
  {
    data: "2026-06-26",
    diaSemana: "Sex",
    diaMes: "26",
  },
  {
    data: "2026-06-27",
    diaSemana: "Sáb",
    diaMes: "27",
  },
];

const agendamentos: Agendamento[] = [
  {
    id: 1,
    data: "2026-06-21",
    hora: "09:00",
    cliente: "João Silva",
    servico: "Corte",
    profissional: "Pedro Henrique",
    valor: 40,
    status: "Confirmado",
    whatsapp: "21999999999",
  },
  {
    id: 2,
    data: "2026-06-21",
    hora: "10:30",
    cliente: "Rafael Costa",
    servico: "Corte + barba",
    profissional: "Pedro Henrique",
    valor: 70,
    status: "Pendente",
    whatsapp: "21988888888",
  },
  {
    id: 3,
    data: "2026-06-21",
    hora: "14:00",
    cliente: "Lucas Mendes",
    servico: "Barba",
    profissional: "Pedro Henrique",
    valor: 30,
    status: "Confirmado",
    whatsapp: "21977777777",
  },
  {
    id: 4,
    data: "2026-06-22",
    hora: "11:00",
    cliente: "Matheus Lima",
    servico: "Corte degradê",
    profissional: "Pedro Henrique",
    valor: 45,
    status: "Pendente",
    whatsapp: "21966666666",
  },
  {
    id: 5,
    data: "2026-06-22",
    hora: "16:00",
    cliente: "Bruno Alves",
    servico: "Corte + sobrancelha",
    profissional: "Pedro Henrique",
    valor: 55,
    status: "Confirmado",
    whatsapp: "21955555555",
  },
];

function formatarDinheiro(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarDataCompleta(data: string) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function criarLinkWhatsapp(agendamento: Agendamento) {
  const mensagem = encodeURIComponent(
    `Olá, ${agendamento.cliente}! Seu horário na PH10 está confirmado para ${agendamento.hora}, serviço: ${agendamento.servico}. Qualquer coisa é só chamar.`
  );

  return `https://wa.me/55${agendamento.whatsapp}?text=${mensagem}`;
}

export default function DashboardPage() {
  const [diaSelecionado, setDiaSelecionado] = useState("2026-06-21");

  const agendamentosDoDia = useMemo(() => {
    return agendamentos
      .filter((item) => item.data === diaSelecionado)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [diaSelecionado]);

  const totalPendentes = agendamentosDoDia.filter(
    (item) => item.status === "Pendente"
  ).length;

  const totalConfirmados = agendamentosDoDia.filter(
    (item) => item.status === "Confirmado"
  ).length;

  const faturamentoPrevisto = agendamentosDoDia
    .filter((item) => item.status !== "Cancelado")
    .reduce((total, item) => total + item.valor, 0);

  const proximoAgendamento = agendamentosDoDia.find(
    (item) => item.status !== "Cancelado"
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto min-h-screen w-full max-w-md bg-neutral-950 px-4 pb-24 pt-5">
        <header className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-neutral-900 to-neutral-800 p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
                PH10
              </p>
              <h1 className="mt-2 text-2xl font-black leading-tight">
                Pedro Henrique
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                Painel rápido da barbearia
              </p>
            </div>

            <button className="rounded-full bg-amber-400 px-4 py-2 text-xs font-black text-neutral-950">
              + Novo
            </button>
          </div>

          <div className="mt-5 rounded-3xl bg-black/30 p-4">
            <p className="text-xs font-semibold text-neutral-400">
              Próximo atendimento
            </p>

            {proximoAgendamento ? (
              <div className="mt-2">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-2xl text-amber-400">
                    {proximoAgendamento.hora}
                  </strong>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                    {proximoAgendamento.status}
                  </span>
                </div>

                <p className="mt-1 font-bold">{proximoAgendamento.cliente}</p>
                <p className="text-sm text-neutral-400">
                  {proximoAgendamento.servico}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-neutral-400">
                Nenhum atendimento marcado para este dia.
              </p>
            )}
          </div>
        </header>

        <section className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-white/10 bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Agendamentos</p>
            <strong className="mt-2 block text-3xl">
              {agendamentosDoDia.length}
            </strong>
          </div>

          <div className="rounded-3xl border border-white/10 bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Pendentes</p>
            <strong className="mt-2 block text-3xl text-yellow-300">
              {totalPendentes}
            </strong>
          </div>

          <div className="rounded-3xl border border-white/10 bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Confirmados</p>
            <strong className="mt-2 block text-3xl text-green-300">
              {totalConfirmados}
            </strong>
          </div>

          <div className="rounded-3xl bg-amber-400 p-4 text-neutral-950">
            <p className="text-xs font-bold">Previsto</p>
            <strong className="mt-2 block text-2xl">
              {formatarDinheiro(faturamentoPrevisto)}
            </strong>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-black">Agenda</h2>
              <p className="text-sm capitalize text-neutral-400">
                {formatarDataCompleta(diaSelecionado)}
              </p>
            </div>

            <button className="text-xs font-bold text-amber-400">
              Ver semana
            </button>
          </div>

          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {dias.map((dia) => {
              const ativo = dia.data === diaSelecionado;
              const quantidade = agendamentos.filter(
                (item) => item.data === dia.data
              ).length;

              return (
                <button
                  key={dia.data}
                  onClick={() => setDiaSelecionado(dia.data)}
                  className={`min-w-16 rounded-3xl border p-3 text-center transition ${
                    ativo
                      ? "border-amber-400 bg-amber-400 text-neutral-950"
                      : "border-white/10 bg-neutral-900 text-white"
                  }`}
                >
                  <span className="block text-xs font-bold">
                    {dia.diaSemana}
                  </span>
                  <strong className="mt-1 block text-2xl">
                    {dia.diaMes}
                  </strong>
                  <span
                    className={`mt-1 block text-[11px] ${
                      ativo ? "text-neutral-800" : "text-neutral-500"
                    }`}
                  >
                    {quantidade} marc.
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 space-y-3">
          {agendamentosDoDia.length > 0 ? (
            agendamentosDoDia.map((item) => {
              const linkWhatsapp = criarLinkWhatsapp(item);

              return (
                <article
                  key={item.id}
                  className="rounded-[1.75rem] border border-white/10 bg-neutral-900 p-4 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-amber-400">
                        {item.hora}
                      </p>
                      <h3 className="mt-1 text-lg font-black">
                        {item.cliente}
                      </h3>
                      <p className="text-sm text-neutral-400">
                        {item.servico}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black">
                        {formatarDinheiro(item.valor)}
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black ${
                          item.status === "Confirmado"
                            ? "bg-green-500/10 text-green-300"
                            : item.status === "Pendente"
                              ? "bg-yellow-500/10 text-yellow-300"
                              : "bg-red-500/10 text-red-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a
                      href={linkWhatsapp}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-green-500 px-3 py-3 text-center text-xs font-black text-white"
                    >
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
              );
            })
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-neutral-900 p-6 text-center">
              <p className="text-lg font-black">Agenda vazia</p>
              <p className="mt-2 text-sm text-neutral-400">
                Nenhum cliente marcado para esse dia.
              </p>

              <button className="mt-5 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-neutral-950">
                Criar agendamento
              </button>
            </div>
          )}
        </section>

        <nav className="fixed bottom-4 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 grid-cols-4 rounded-[1.5rem] border border-white/10 bg-neutral-900/95 p-2 shadow-2xl backdrop-blur">
          <button className="rounded-2xl bg-amber-400 px-2 py-3 text-xs font-black text-neutral-950">
            Agenda
          </button>
          <button className="rounded-2xl px-2 py-3 text-xs font-bold text-neutral-400">
            Clientes
          </button>
          <button className="rounded-2xl px-2 py-3 text-xs font-bold text-neutral-400">
            Serviços
          </button>
          <button className="rounded-2xl px-2 py-3 text-xs font-bold text-neutral-400">
            Mais
          </button>
        </nav>
      </div>
    </main>
  );
}