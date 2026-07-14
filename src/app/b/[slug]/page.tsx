"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Agendamento,
  BloqueioAgenda,
  Combo,
  ConfiguracaoAgenda,
  Servico,
  carregarAgendamentos,
  carregarBloqueios,
  carregarCombos,
  carregarConfiguracaoAgenda,
  carregarServicos,
  proximosDias,
  reservaEstaAtiva,
  salvarAgendamentos,
} from "@/lib/barber-storage";

const idsDosDias = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

function minutos(hora: string) { const [h, m] = hora.split(":").map(Number); return h * 60 + m; }
function horaFormatada(total: number) { return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`; }

function dinheiro(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function duracaoComUnidade(valor: string) {
  const numero = valor.replace(/\D/g, "");
  return numero ? `${numero} min` : valor;
}
function somenteLetras(valor: string) {
  return valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "").replace(/\s{2,}/g, " ");
}
function somenteDigitos(valor: string) { return valor.replace(/\D/g, "").slice(0, 9); }

export default function PaginaCliente() {
  const [servicoId, setServicoId] = useState<number | null>(null);
  const [dia, setDia] = useState(() => proximosDias(1)[0].data);
  const [horario, setHorario] = useState("");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [bloqueios, setBloqueios] = useState<BloqueioAgenda[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoAgenda | null>(null);
  const [carregado, setCarregado] = useState(false);
  const [agora, setAgora] = useState(0);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    function carregar() {
      setAgendamentos(carregarAgendamentos());
      setBloqueios(carregarBloqueios());
      const servicosAtivos = carregarServicos().filter((item) => item.status === "Ativo");
      const combosAtivos = carregarCombos().filter((item) => item.status === "Ativo");
      setServicos(servicosAtivos);
      setCombos(combosAtivos);
      setConfiguracao(carregarConfiguracaoAgenda());
      setAgora(Date.now());
      setCarregado(true);
    }
    carregar();
  }, []);

  const opcoesAgendamento: Servico[] = [
    ...servicos,
    ...combos.map((combo) => ({ id: -combo.id, nome: combo.nome, duracao: combo.duracao, valor: combo.valor, status: "Ativo" as const })),
  ];
  const servico = opcoesAgendamento.find((item) => item.id === servicoId);
  const duracaoSelecionada = Number(servico?.duracao.replace(/\D/g, "") || 0);
  const dias = proximosDias(Number(configuracao?.configAgenda.diasParaAgendar ?? 7));
  const horarios = useMemo(() => {
    if (!configuracao) return [];
    const dataSelecionada = new Date(`${dia}T12:00:00`);
    const expediente = configuracao.diasFuncionamento.find((item) => item.id === idsDosDias[dataSelecionada.getDay()]);
    if (!expediente?.ativo) return [];
    const intervalo = Number(configuracao.configAgenda.intervalo);
    const limiteMinimo = agora + Number(configuracao.configAgenda.antecedenciaMinima) * 60 * 60 * 1000;
    const lista: string[] = [];
    for (let atual = minutos(expediente.abertura); atual < minutos(expediente.fechamento); atual += intervalo) {
      const hora = horaFormatada(atual);
      const instante = new Date(`${dia}T${hora}:00`).getTime();
      const fimDoServico = atual + duracaoSelecionada;
      const sobrepoePausa = expediente.temPausa && atual < minutos(expediente.pausaFim) && fimDoServico > minutos(expediente.pausaInicio);
      const sobrepoeBloqueio = bloqueios.some((bloqueio) => bloqueio.data === dia && atual < (bloqueio.diaInteiro ? 24 * 60 : minutos(bloqueio.fim)) && fimDoServico > (bloqueio.diaInteiro ? 0 : minutos(bloqueio.inicio)));
      const terminaNoExpediente = fimDoServico <= minutos(expediente.fechamento);
      if (!sobrepoePausa && !sobrepoeBloqueio && terminaNoExpediente && instante >= limiteMinimo) lista.push(hora);
    }
    return lista;
  }, [configuracao, dia, agora, duracaoSelecionada, bloqueios]);
  const horariosOcupados = useMemo(
    () => {
      const intervaloPadrao = Number(configuracao?.configAgenda.intervalo ?? 30);
      const reservasDoDia = agendamentos.filter((item) => item.data === dia && reservaEstaAtiva(item, agora));
      return new Set(horarios.filter((hora) => {
        const inicioPretendido = minutos(hora);
        const fimPretendido = inicioPretendido + duracaoSelecionada;
        return reservasDoDia.some((reserva) => {
          const inicioReserva = minutos(reserva.hora);
          const fimReserva = inicioReserva + (reserva.duracaoMinutos ?? intervaloPadrao);
          return inicioPretendido <= fimReserva && fimPretendido >= inicioReserva;
        });
      }));
    },
    [agendamentos, configuracao, dia, duracaoSelecionada, horarios, agora]
  );

  function selecionarDia(novoDia: string) {
    setDia(novoDia);
    setHorario("");
  }

  function agendar() {
    if (!servico || !dia || !horario || !nome.trim() || !whatsapp.trim()) {
      alert("Preencha todos os campos.");
      return;
    }
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)*$/.test(nome.trim())) {
      alert("Informe um nome usando apenas letras.");
      return;
    }
    if (!/^9\d{8}$/.test(whatsapp)) {
      alert("Informe os 9 dígitos do celular, começando pelo 9.");
      return;
    }

    const listaAtual = carregarAgendamentos();
    const numeroCompletoCliente = `5521${whatsapp}`;
    const reservaExistente = listaAtual.find((item) => item.whatsapp.replace(/\D/g, "").endsWith(whatsapp) && reservaEstaAtiva(item, agora));
    if (reservaExistente) {
      alert(`Você já possui uma reserva em ${reservaExistente.data.split("-").reverse().join("/")} às ${reservaExistente.hora}. Para remarcar, entre em contato com a PH10.`);
      return;
    }
    const inicioPretendidoBloqueio = minutos(horario);
    const bloqueioAtual = carregarBloqueios().some((bloqueio) => bloqueio.data === dia && inicioPretendidoBloqueio < (bloqueio.diaInteiro ? 24 * 60 : minutos(bloqueio.fim)) && inicioPretendidoBloqueio + duracaoSelecionada > (bloqueio.diaInteiro ? 0 : minutos(bloqueio.inicio)));
    if (bloqueioAtual) {
      setBloqueios(carregarBloqueios());
      setHorario("");
      alert("Esse período não está mais disponível. Escolha outro horário.");
      return;
    }
    const inicioPretendido = minutos(horario);
    const intervaloPadrao = Number(configuracao?.configAgenda.intervalo ?? 30);
    const existeConflito = listaAtual.some((item) => {
      if (item.data !== dia || !reservaEstaAtiva(item, agora)) return false;
      const inicioReserva = minutos(item.hora);
      const fimReserva = inicioReserva + (item.duracaoMinutos ?? intervaloPadrao);
      return inicioPretendido <= fimReserva && inicioPretendido + duracaoSelecionada >= inicioReserva;
    });
    if (existeConflito) {
      setAgendamentos(listaAtual);
      setHorario("");
      alert("Esse horário acabou de ser ocupado. Escolha outro.");
      return;
    }

    const novo: Agendamento = {
      id: Date.now(), data: dia, hora: horario, cliente: nome.trim(),
      servico: servico.nome, valor: servico.valor, whatsapp: numeroCompletoCliente, duracaoMinutos: duracaoSelecionada,
    };
    const novaLista = [...listaAtual, novo];
    salvarAgendamentos(novaLista);
    setAgendamentos(novaLista);
    setEnviado(true);
  }

  return (
    <main className="min-h-screen bg-[#24211e] text-[#f3ead8]">
      <div className="mx-auto w-full max-w-md px-4 py-5 lg:max-w-4xl">
        <header className="hero-panel">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">PH10</p>
          <h1 className="mt-2 text-3xl font-black">Barbearia PH10</h1>
          <p className="mt-2 text-sm text-neutral-400">Escolha o serviço, o dia e um horário disponível.</p>
        </header>

        {enviado ? (
          <section className="mt-5 rounded-[2rem] bg-green-500/10 p-6 text-center">
            <p className="text-4xl">✅</p>
            <h2 className="mt-3 text-2xl font-black">Agendamento realizado</h2>
            <p className="mt-2 text-sm text-neutral-300">Seu horário já está reservado na agenda da PH10.</p>
            <div className="mt-5 rounded-3xl bg-neutral-900 p-4 text-left">
              <p className="font-bold">{nome}</p>
              <p className="text-sm text-neutral-400">{servico?.nome} • {dia.split("-").reverse().join("/")} • {horario}</p>
            </div>
            <button onClick={() => { setEnviado(false); setServicoId(null); setHorario(""); setNome(""); setWhatsapp(""); }} className="mt-5 w-full rounded-2xl bg-amber-400 py-4 text-sm font-black text-neutral-950">Fazer outro agendamento</button>
          </section>
        ) : (
          <>
            <section className="mt-6"><h2 className="text-xl font-black">Serviço</h2>
              {servicos.length === 0 ? <div className="mt-3 rounded-3xl border border-dashed border-white/10 bg-neutral-900 p-5 text-center text-sm text-neutral-400">Nenhum serviço disponível no momento.</div> : <div className="mt-3 grid gap-3 lg:grid-cols-2">{servicos.map((item) => <button key={item.id} onClick={() => setServicoId(item.id)} className={`rounded-3xl border p-4 text-left ${item.id === servicoId ? "border-amber-400 bg-amber-400 text-neutral-950" : "border-white/10 bg-neutral-900"}`}><div className="flex justify-between gap-3"><div><p className="font-black">{item.nome}</p><p className="text-sm opacity-70">{duracaoComUnidade(item.duracao)}</p></div><strong>{dinheiro(item.valor)}</strong></div></button>)}</div>}
            </section>
            {combos.length > 0 && <section className="mt-6 border-t border-white/10 pt-6"><div><p className="text-xs font-black uppercase tracking-[.2em] text-amber-400">Economize</p><h2 className="mt-1 text-xl font-black">Combos</h2></div><div className="mt-3 grid gap-3 lg:grid-cols-2">{combos.map((combo) => { const idSelecao = -combo.id; return <button key={combo.id} onClick={() => setServicoId(idSelecao)} className={`rounded-3xl border p-4 text-left ${idSelecao === servicoId ? "border-amber-400 bg-amber-400 text-neutral-950" : "border-amber-400/20 bg-amber-400/5"}`}><div className="flex justify-between gap-3"><div><p className="font-black">{combo.nome}</p><p className="text-sm opacity-70">{duracaoComUnidade(combo.duracao)}</p></div><strong>{dinheiro(combo.valor)}</strong></div><p className="mt-3 text-xs font-bold opacity-70">Combo especial</p></button>; })}</div></section>}
            <section className="mt-6"><h2 className="text-xl font-black">Dia</h2>
              <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">{dias.map((item) => <button key={item.data} onClick={() => selecionarDia(item.data)} className={`min-w-16 rounded-3xl border p-3 text-center ${item.data === dia ? "border-amber-400 bg-amber-400 text-neutral-950" : "border-white/10 bg-neutral-900"}`}><span className="block text-xs font-bold capitalize">{item.semana}</span><strong className="block text-2xl">{item.dia}</strong></button>)}</div>
            </section>
            <section className="mt-6"><h2 className="text-xl font-black">Horário</h2>
              <div className="mt-3 grid grid-cols-3 gap-3">{horarios.map((item) => { const ocupado = horariosOcupados.has(item); return <button key={item} disabled={!carregado || ocupado} onClick={() => setHorario(item)} className={`rounded-2xl border py-3 text-sm font-black ${ocupado ? "cursor-not-allowed border-white/5 bg-neutral-900/40 text-neutral-600 line-through" : item === horario ? "border-amber-400 bg-amber-400 text-neutral-950" : "border-white/10 bg-neutral-900"}`}>{item}</button>; })}</div>
              {carregado && horarios.length === 0 && <p className="mt-3 rounded-2xl bg-neutral-900 p-4 text-center text-sm text-neutral-400">Não há mais horários disponíveis para este dia.</p>}
              {horariosOcupados.size > 0 && <p className="mt-2 text-xs text-neutral-500">Horários riscados já estão ocupados.</p>}
            </section>
            <section className="mt-6 rounded-[2rem] bg-neutral-900 p-5">
              <h2 className="text-xl font-black">Seus dados</h2>
              <div className="mt-4 overflow-hidden rounded-2xl bg-neutral-950 focus-within:ring-2 focus-within:ring-amber-400">
                <input value={nome} onChange={(e) => setNome(somenteLetras(e.target.value))} placeholder="Seu nome" autoComplete="name" className="w-full bg-transparent px-4 py-4 outline-none" />
              </div>
              <div className="mt-3 flex overflow-hidden rounded-2xl bg-neutral-950 focus-within:ring-2 focus-within:ring-amber-400"><span className="flex items-center border-r border-white/10 px-4 text-sm font-black text-amber-400">+55 21</span><input value={whatsapp} onChange={(e) => setWhatsapp(somenteDigitos(e.target.value))} placeholder="9 0000-0000" inputMode="numeric" autoComplete="tel" maxLength={9} className="min-w-0 flex-1 bg-transparent px-4 py-4 outline-none" /></div>
            </section>
            <div className="sticky bottom-0 -mx-4 mt-6 bg-neutral-950/95 p-4 backdrop-blur lg:static lg:mx-0 lg:p-0"><button onClick={agendar} className="w-full rounded-2xl bg-amber-400 py-4 text-sm font-black text-neutral-950">Agendar horário</button>{servico && horario && <p className="mt-3 text-center text-xs text-neutral-400">{servico.nome} • {dinheiro(servico.valor)} • {horario}</p>}</div>
          </>
        )}
      </div>
    </main>
  );
}
