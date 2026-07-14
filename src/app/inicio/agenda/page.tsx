"use client";

import { useEffect, useMemo, useState } from "react";
import { carregarAgendamentos, carregarConfiguracaoAgenda, dataLocal, proximosDias, salvarAgendamentos, salvarConfiguracaoAgenda } from "@/lib/barber-storage";

type Status = "Confirmado" | "Pendente" | "Cancelado";

type Agendamento = {
  id: number;
  data: string;
  hora: string;
  cliente: string;
  servico: string;
  valor: number;
  status: Status;
  whatsapp: string;
  duracaoMinutos?: number;
};

type DiaFuncionamento = {
  id: string;
  nome: string;
  curto: string;
  ativo: boolean;
  abertura: string;
  fechamento: string;
  temPausa: boolean;
  pausaInicio: string;
  pausaFim: string;
};

type ConfigAgenda = {
  intervalo: "15" | "30" | "45" | "60";
  antecedenciaMinima: "1" | "2" | "4" | "24";
  diasParaAgendar: "7" | "15" | "30";
};

const dias = proximosDias(7);

const agendamentosIniciais: Agendamento[] = [];

const diasFuncionamentoIniciais: DiaFuncionamento[] = [
  {
    id: "domingo",
    nome: "Domingo",
    curto: "Dom",
    ativo: false,
    abertura: "09:00",
    fechamento: "14:00",
    temPausa: false,
    pausaInicio: "12:00",
    pausaFim: "13:00",
  },
  {
    id: "segunda",
    nome: "Segunda-feira",
    curto: "Seg",
    ativo: true,
    abertura: "09:00",
    fechamento: "18:00",
    temPausa: true,
    pausaInicio: "12:00",
    pausaFim: "13:00",
  },
  {
    id: "terca",
    nome: "Terça-feira",
    curto: "Ter",
    ativo: true,
    abertura: "09:00",
    fechamento: "18:00",
    temPausa: true,
    pausaInicio: "12:00",
    pausaFim: "13:00",
  },
  {
    id: "quarta",
    nome: "Quarta-feira",
    curto: "Qua",
    ativo: true,
    abertura: "09:00",
    fechamento: "18:00",
    temPausa: true,
    pausaInicio: "12:00",
    pausaFim: "13:00",
  },
  {
    id: "quinta",
    nome: "Quinta-feira",
    curto: "Qui",
    ativo: true,
    abertura: "09:00",
    fechamento: "18:00",
    temPausa: true,
    pausaInicio: "12:00",
    pausaFim: "13:00",
  },
  {
    id: "sexta",
    nome: "Sexta-feira",
    curto: "Sex",
    ativo: true,
    abertura: "09:00",
    fechamento: "18:00",
    temPausa: true,
    pausaInicio: "12:00",
    pausaFim: "13:00",
  },
  {
    id: "sabado",
    nome: "Sábado",
    curto: "Sáb",
    ativo: true,
    abertura: "09:00",
    fechamento: "14:00",
    temPausa: false,
    pausaInicio: "12:00",
    pausaFim: "13:00",
  },
];

const configAgendaInicial: ConfigAgenda = {
  intervalo: "30",
  antecedenciaMinima: "2",
  diasParaAgendar: "15",
};

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

function whatsappLink(item: Agendamento) {
  const msg = encodeURIComponent(
    `Olá, ${item.cliente}! Seu horário na PH10 está confirmado para ${item.hora}, serviço: ${item.servico}.`
  );

  const numero = item.whatsapp.replace(/\D/g, "");
  const numeroCompleto = numero.startsWith("55") ? numero : `55${numero}`;
  return `https://wa.me/${numeroCompleto}?text=${msg}`;
}

export default function AgendaPage() {
  const [diaSelecionado, setDiaSelecionado] = useState(dataLocal());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(
    agendamentosIniciais
  );

  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalHorariosAberto, setModalHorariosAberto] = useState(false);
  const [diaExpandido, setDiaExpandido] = useState<string | null>(null);

  const [diasFuncionamento, setDiasFuncionamento] = useState<
    DiaFuncionamento[]
  >(diasFuncionamentoIniciais);

  const [configAgenda, setConfigAgenda] =
    useState<ConfigAgenda>(configAgendaInicial);

  const [cliente, setCliente] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [servico, setServico] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(dataLocal());
  const [hora, setHora] = useState("");

  useEffect(() => {
    function carregar() {
      setAgendamentos(
        carregarAgendamentos().map((item) => ({ ...item, status: "Confirmado" }))
      );
      const configuracaoSalva = carregarConfiguracaoAgenda();
      if (configuracaoSalva) {
        setDiasFuncionamento(configuracaoSalva.diasFuncionamento);
        setConfigAgenda(configuracaoSalva.configAgenda);
      }
    }
    carregar();

    function fecharComEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        fecharModalNovo();
        setModalHorariosAberto(false);
      }
    }

    if (modalNovoAberto || modalHorariosAberto) {
      document.addEventListener("keydown", fecharComEsc);
    }

    return () => {
      document.removeEventListener("keydown", fecharComEsc);
    };
  }, [modalNovoAberto, modalHorariosAberto]);

  const agendamentosDoDia = useMemo(() => {
    return agendamentos
      .filter((item) => item.data === diaSelecionado)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [agendamentos, diaSelecionado]);

  const totalConfirmados = agendamentosDoDia.filter(
    (a) => a.status === "Confirmado"
  ).length;

  const faturamento = agendamentosDoDia
    .filter((a) => a.status !== "Cancelado")
    .reduce((total, a) => total + a.valor, 0);

  const diasAtivos = diasFuncionamento.filter((dia) => dia.ativo);

  const resumoDiasAtivos =
    diasAtivos.length === 0
      ? "Nenhum dia ativo"
      : diasAtivos.map((dia) => dia.curto).join(", ");

  function abrirModalNovo() {
    setCliente("");
    setWhatsapp("");
    setServico("");
    setValor("");
    setData(diaSelecionado);
    setHora("");
    setModalNovoAberto(true);
  }

  function fecharModalNovo() {
    setModalNovoAberto(false);
    setCliente("");
    setWhatsapp("");
    setServico("");
    setValor("");
    setData(diaSelecionado);
    setHora("");
  }

  function salvarNovoAgendamento() {
    if (!cliente || !whatsapp || !servico || !valor || !data || !hora) {
      alert("Preencha todos os campos.");
      return;
    }

    const valorNumerico = Number(valor.replace(",", "."));

    if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    const novoAgendamento: Agendamento = {
      id: Date.now(),
      data,
      hora,
      cliente,
      servico,
      valor: valorNumerico,
      status: "Confirmado",
      whatsapp,
    };

    if (agendamentos.some((item) => item.data === data && item.hora === hora && item.status !== "Cancelado")) {
      alert("Esse horário já está ocupado.");
      return;
    }

    const novaLista = [novoAgendamento, ...agendamentos];
    setAgendamentos(novaLista);
    salvarAgendamentos(novaLista);
    setDiaSelecionado(data);
    fecharModalNovo();
  }

  function atualizarDiaFuncionamento(
    id: string,
    campo: keyof DiaFuncionamento,
    valorAtualizado: string | boolean
  ) {
    setDiasFuncionamento((listaAtual) =>
      listaAtual.map((dia) =>
        dia.id === id ? { ...dia, [campo]: valorAtualizado } : dia
      )
    );
  }

  function cancelarAgendamento(id: number) {
    const novaLista = agendamentos.filter((item) => item.id !== id);
    setAgendamentos(novaLista);
    salvarAgendamentos(novaLista);
  }

  return (
    <main className="app-page">
      <div className="page-wrap">
        <header className="hero-panel">
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

          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-3xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Agendamentos</p>
            <strong className="mt-2 block text-3xl">
              {agendamentosDoDia.length}
            </strong>
          </div>

          <div className="rounded-3xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Clientes</p>
            <strong className="mt-2 block text-3xl text-yellow-300">
              {new Set(agendamentosDoDia.map((item) => item.whatsapp)).size}
            </strong>
          </div>

          <div className="rounded-3xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Agendados</p>
            <strong className="mt-2 block text-3xl text-green-300">
              {totalConfirmados}
            </strong>
          </div>

          <div className="rounded-3xl bg-amber-400 p-4 text-neutral-950">
            <p className="text-xs font-bold">Previsto</p>
            <strong className="mt-2 block text-2xl">
              {dinheiro(faturamento)}
            </strong>
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] bg-neutral-900 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Horários de funcionamento</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Define os dias e horários disponíveis para o cliente agendar.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setDiaExpandido(null);
                setModalHorariosAberto(true);
              }}
              className="rounded-2xl bg-amber-400 px-4 py-3 text-xs font-black text-neutral-950"
            >
              Configurar
            </button>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl bg-neutral-950 p-4">
              <p className="text-xs text-neutral-400">Dias ativos</p>
              <p className="mt-1 text-sm font-black text-white">
                {resumoDiasAtivos}
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-950 p-4">
              <p className="text-xs text-neutral-400">Intervalo</p>
              <p className="mt-1 text-sm font-black text-white">
                A cada {configAgenda.intervalo} min
              </p>
            </div>

          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-black">Dias</h2>

          <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
            {dias.map((dia) => {
              const lista = agendamentos.filter((a) => a.data === dia.data);
              const previsto = lista
                .filter((a) => a.status !== "Cancelado")
                .reduce((total, a) => total + a.valor, 0);

              const ativo = dia.data === diaSelecionado;

              return (
                <button
                  key={dia.data}
                  type="button"
                  onClick={() => setDiaSelecionado(dia.data)}
                  className={`min-w-[96px] rounded-3xl border p-3 text-center ${
                    ativo
                      ? "border-amber-400 bg-amber-400 text-neutral-950"
                      : "border-white/10 bg-neutral-900 text-white"
                  }`}
                >
                  <span className="text-xs font-bold">{dia.semana}</span>
                  <strong className="block text-3xl">{dia.dia}</strong>
                  <p className="mt-1 text-xs opacity-70">
                    {lista.length} reserva(s)
                  </p>
                  <p className="mt-1 text-xs font-black">
                    {dinheiro(previsto)}
                  </p>
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
              <article
                key={item.id}
                className="rounded-[1.75rem] bg-neutral-900 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-amber-400">
                      {item.hora}
                    </p>
                    <h3 className="mt-1 text-lg font-black">{item.cliente}</h3>
                    <p className="text-sm text-neutral-400">{item.servico}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-black">{dinheiro(item.valor)}</p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black ${statusClass(
                        item.status
                      )}`}
                    >
                      Agendado
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3">
                  <a
                    href={whatsappLink(item)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-green-500 px-3 py-3 text-center text-xs font-black text-white"
                  >
                    WhatsApp
                  </a>

                  <button
                    type="button"
                    className="rounded-2xl bg-white/10 px-3 py-3 text-xs font-black"
                  >
                    Remarcar
                  </button>

                  <button
                    type="button"
                    onClick={() => cancelarAgendamento(item.id)}
                    className="rounded-2xl bg-red-500/10 px-3 py-3 text-xs font-black text-red-300"
                  >
                    Cancelar
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>

      {modalNovoAberto && (
        <div
          onClick={fecharModalNovo}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-4 lg:items-center"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-[2rem] bg-neutral-900 p-5 text-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Novo agendamento</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Cadastro manual feito pelo Pedro.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModalNovo}
                className="rounded-full bg-white/10 px-3 py-2 text-sm font-black"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <input
                value={cliente}
                onChange={(event) => setCliente(event.target.value)}
                placeholder="Nome do cliente"
                className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />

              <input
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                placeholder="WhatsApp"
                className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />

              <input
                value={servico}
                onChange={(event) => setServico(event.target.value)}
                placeholder="Serviço. Ex: Corte"
                className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />

              <input
                value={valor}
                onChange={(event) => setValor(event.target.value)}
                placeholder="Valor. Ex: 40"
                inputMode="decimal"
                className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={data}
                  onChange={(event) => setData(event.target.value)}
                  className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />

                <input
                  type="time"
                  value={hora}
                  onChange={(event) => setHora(event.target.value)}
                  className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={fecharModalNovo}
                className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-black"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarNovoAgendamento}
                className="rounded-2xl bg-amber-400 px-4 py-4 text-sm font-black text-neutral-950"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalHorariosAberto && (
        <div
          onClick={() => setModalHorariosAberto(false)}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-4 lg:items-center"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-neutral-900 p-5 text-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">
                  Horários de funcionamento
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Esses horários vão definir a disponibilidade do cliente.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalHorariosAberto(false)}
                className="rounded-full bg-white/10 px-3 py-2 text-sm font-black"
              >
                ✕
              </button>
            </div>

            <section className="mt-5 rounded-3xl bg-neutral-950 p-4">
              <h3 className="text-lg font-black">Regras da agenda</h3>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <label className="block">
                  <span className="text-xs font-bold text-neutral-400">
                    Intervalo
                  </span>

                  <select
                    value={configAgenda.intervalo}
                    onChange={(event) =>
                      setConfigAgenda((atual) => ({
                        ...atual,
                        intervalo: event.target
                          .value as ConfigAgenda["intervalo"],
                      }))
                    }
                    className="mt-2 w-full rounded-2xl bg-neutral-900 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">1 hora</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-neutral-400">
                    Antecedência mínima
                  </span>

                  <select
                    value={configAgenda.antecedenciaMinima}
                    onChange={(event) =>
                      setConfigAgenda((atual) => ({
                        ...atual,
                        antecedenciaMinima: event.target
                          .value as ConfigAgenda["antecedenciaMinima"],
                      }))
                    }
                    className="mt-2 w-full rounded-2xl bg-neutral-900 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="1">1 hora antes</option>
                    <option value="2">2 horas antes</option>
                    <option value="4">4 horas antes</option>
                    <option value="24">1 dia antes</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-neutral-400">
                    Janela de atendimento
                  </span>

                  <select
                    value={configAgenda.diasParaAgendar}
                    onChange={(event) =>
                      setConfigAgenda((atual) => ({
                        ...atual,
                        diasParaAgendar: event.target
                          .value as ConfigAgenda["diasParaAgendar"],
                      }))
                    }
                    className="mt-2 w-full rounded-2xl bg-neutral-900 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="7">7 dias</option>
                    <option value="15">15 dias</option>
                    <option value="30">30 dias</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="mt-4 space-y-3">
              {diasFuncionamento.map((dia) => (
                <article
                  key={dia.id}
                  className="rounded-3xl bg-neutral-950 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setDiaExpandido((atual) => atual === dia.id ? null : dia.id)}
                      className="flex flex-1 items-center justify-between gap-3 text-left"
                    >
                    <div>
                      <h3 className="font-black">{dia.nome}</h3>
                      <p className="mt-1 text-xs text-neutral-400">
                        {dia.ativo
                          ? `${dia.abertura} às ${dia.fechamento}`
                          : "Fechado"}
                      </p>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-neutral-300 shadow-inner">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 transition-transform duration-200 ${diaExpandido === dia.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 7.5 5 5 5-5" />
                      </svg>
                    </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        atualizarDiaFuncionamento(
                          dia.id,
                          "ativo",
                          !dia.ativo
                        )
                      }
                      className={`rounded-full px-4 py-2 text-xs font-black ${
                        dia.ativo
                          ? "bg-green-500/10 text-green-300"
                          : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {dia.ativo ? "Aberto" : "Fechado"}
                    </button>
                  </div>

                  {dia.ativo && diaExpandido === dia.id && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-xs font-bold text-neutral-400">
                            Abertura
                          </span>

                          <input
                            type="time"
                            value={dia.abertura}
                            onChange={(event) =>
                              atualizarDiaFuncionamento(
                                dia.id,
                                "abertura",
                                event.target.value
                              )
                            }
                            className="mt-2 w-full rounded-2xl bg-neutral-900 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </label>

                        <label className="block">
                          <span className="text-xs font-bold text-neutral-400">
                            Fechamento
                          </span>

                          <input
                            type="time"
                            value={dia.fechamento}
                            onChange={(event) =>
                              atualizarDiaFuncionamento(
                                dia.id,
                                "fechamento",
                                event.target.value
                              )
                            }
                            className="mt-2 w-full rounded-2xl bg-neutral-900 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </label>
                      </div>

                      <div className="rounded-2xl bg-neutral-900 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-black">Pausa/almoço</p>
                            <p className="mt-1 text-xs text-neutral-400">
                              Bloqueia horários durante esse período.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              atualizarDiaFuncionamento(
                                dia.id,
                                "temPausa",
                                !dia.temPausa
                              )
                            }
                            className={`rounded-full px-4 py-2 text-xs font-black ${
                              dia.temPausa
                                ? "bg-amber-400 text-neutral-950"
                                : "bg-white/10 text-white"
                            }`}
                          >
                            {dia.temPausa ? "Ativa" : "Sem pausa"}
                          </button>
                        </div>

                        {dia.temPausa && (
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <label className="block">
                              <span className="text-xs font-bold text-neutral-400">
                                Início
                              </span>

                              <input
                                type="time"
                                value={dia.pausaInicio}
                                onChange={(event) =>
                                  atualizarDiaFuncionamento(
                                    dia.id,
                                    "pausaInicio",
                                    event.target.value
                                  )
                                }
                                className="mt-2 w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                              />
                            </label>

                            <label className="block">
                              <span className="text-xs font-bold text-neutral-400">
                                Fim
                              </span>

                              <input
                                type="time"
                                value={dia.pausaFim}
                                onChange={(event) =>
                                  atualizarDiaFuncionamento(
                                    dia.id,
                                    "pausaFim",
                                    event.target.value
                                  )
                                }
                                className="mt-2 w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </section>

            <div className="sticky bottom-0 -mx-5 mt-5 bg-neutral-900/95 px-5 pb-1 pt-4 backdrop-blur">
              <button
                type="button"
                onClick={() => {
                  salvarConfiguracaoAgenda({ diasFuncionamento, configAgenda });
                  setModalHorariosAberto(false);
                }}
                className="w-full rounded-2xl bg-amber-400 px-4 py-4 text-sm font-black text-neutral-950"
              >
                Salvar configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
