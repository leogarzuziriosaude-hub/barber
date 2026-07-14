"use client";

import { useEffect, useMemo, useState } from "react";
import { Agendamento, StatusAtendimento, carregarAgendamentos, obterStatusAtendimento, reservaEstaAtiva } from "@/lib/barber-storage";

function dinheiro(valor: number) { return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function dataPorExtenso(data: string) { return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${data}T12:00:00`)); }
function statusClass(status: StatusAtendimento) {
  if (status === "Concluído") return "bg-green-500/10 text-green-300";
  if (status === "Cancelado") return "bg-red-500/10 text-red-300";
  return "bg-yellow-500/10 text-yellow-300";
}

export default function HistoricoPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [agora, setAgora] = useState(0);
  const [periodo, setPeriodo] = useState("");

  useEffect(() => {
    function carregar() { setAgendamentos(carregarAgendamentos()); setAgora(Date.now()); }
    carregar();
    window.addEventListener("storage", carregar);
    window.addEventListener("ph10:agendamentos-atualizados", carregar);
    const intervalo = window.setInterval(() => setAgora(Date.now()), 60_000);
    return () => { window.removeEventListener("storage", carregar); window.removeEventListener("ph10:agendamentos-atualizados", carregar); window.clearInterval(intervalo); };
  }, []);

  const grupos = useMemo(() => {
    if (!periodo) return {};
    const finalizados = agendamentos.filter((item) => item.data === periodo && !reservaEstaAtiva(item, agora)).sort((a, b) => `${b.data} ${b.hora}`.localeCompare(`${a.data} ${a.hora}`));
    return finalizados.reduce<Record<string, Agendamento[]>>((resultado, item) => { (resultado[item.data] ??= []).push(item); return resultado; }, {});
  }, [agendamentos, agora, periodo]);

  return <main className="app-page"><div className="page-wrap">
    <header className="hero-panel"><p className="eyebrow">PH10 • Registros</p><h1 className="display-font page-title mt-2">Histórico</h1><p className="subtle mt-3 text-sm">Atendimentos concluídos, cancelados e clientes que não compareceram.</p></header>
    <section className="mt-5 min-w-0 rounded-[1.75rem] bg-neutral-900 p-5">
      <label className="block min-w-0">
        <span className="text-xs font-black uppercase tracking-[.18em] text-amber-400">Período</span>
        <p className="mt-1 text-sm text-neutral-400">Escolha a data que deseja consultar.</p>
        <div className="relative mt-4 w-full max-w-sm overflow-hidden rounded-2xl bg-neutral-950 focus-within:ring-2 focus-within:ring-amber-400">
          <div aria-hidden="true" className="flex min-h-14 items-center justify-between gap-3 px-4 py-4 text-sm">
            <span className={periodo ? "text-white" : "text-neutral-400"}>
              {periodo ? periodo.split("-").reverse().join("/") : "dd/mm/aaaa"}
            </span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v4M16 2v4M3 10h18" />
              <rect x="3" y="4" width="18" height="17" rx="2" />
            </svg>
          </div>
          <input
            type="date"
            value={periodo}
            aria-label="Data do período"
            onChange={(event) => setPeriodo(event.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
      </label>
    </section>
    {!periodo ? <div className="mt-5 rounded-[1.75rem] border border-dashed border-white/10 bg-neutral-900 p-8 text-center"><p className="text-lg font-black">Selecione um período</p><p className="mt-2 text-sm text-neutral-400">Os registros serão carregados somente depois que você escolher uma data.</p></div> : Object.keys(grupos).length === 0 ? <div className="mt-5 rounded-[1.75rem] border border-dashed border-white/10 bg-neutral-900 p-8 text-center"><p className="text-lg font-black">Nenhum atendimento nessa data</p><p className="mt-2 text-sm text-neutral-400">Não existem atendimentos encerrados para o período selecionado.</p></div> : <div className="mt-6 space-y-7">{Object.entries(grupos).map(([data, itens]) => {
      const totalConcluido = itens.filter((item) => obterStatusAtendimento(item, agora) === "Concluído").reduce((total, item) => total + item.valor, 0);
      return <section key={data}><div className="mb-3 flex items-end justify-between gap-4 border-b border-white/10 pb-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-amber-400">{data.split("-").reverse().join("/")}</p><h2 className="mt-1 capitalize text-lg font-black">{dataPorExtenso(data)}</h2></div><div className="text-right"><p className="text-xs text-neutral-500">{itens.length} registro(s)</p><p className="mt-1 text-sm font-black text-neutral-300">{dinheiro(totalConcluido)}</p></div></div><div className="space-y-3">{itens.map((item) => { const status = obterStatusAtendimento(item, agora); return <article key={item.id} className="rounded-[1.5rem] bg-neutral-900 p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black text-amber-400">{item.hora}</p><h3 className="mt-1 font-black">{item.cliente}</h3><p className="mt-1 text-sm text-neutral-400">{item.servico}</p></div><div className="text-right"><p className="font-black">{dinheiro(item.valor)}</p><span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black ${statusClass(status)}`}>{status}</span></div></div></article>; })}</div></section>;
    })}</div>}
  </div></main>;
}
