"use client";

import { useEffect, useMemo, useState } from "react";
import ClientReservationLookup from "@/components/booking/ClientReservationLookup";
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
  cadastrarOuAtualizarCliente,
  proximosDias,
  registrarAlteracaoAgendamento,
  reservaEstaAtiva,
  salvarAgendamentos,
} from "@/lib/barber-storage";

const idsDosDias = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
// Temporário: futuramente virá do módulo Configurações.
const whatsappPH10 = "5521994073006";

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
function gerarCodigoReserva(agendamentos: Agendamento[]) {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  do {
    codigo = `PH10-${Array.from({ length: 6 }, () => caracteres[Math.floor(Math.random() * caracteres.length)]).join("")}`;
  } while (agendamentos.some((item) => item.codigo === codigo));
  return codigo;
}

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
  const [reservaConcluida, setReservaConcluida] = useState<Agendamento | null>(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [reservaExistenteAviso, setReservaExistenteAviso] = useState<Agendamento | null>(null);

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
      setReservaExistenteAviso(reservaExistente);
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

    const novo = registrarAlteracaoAgendamento({
      id: Date.now(), data: dia, hora: horario, cliente: nome.trim(),
      servico: servico.nome, valor: servico.valor, whatsapp: numeroCompletoCliente,
      duracaoMinutos: duracaoSelecionada, codigo: gerarCodigoReserva(listaAtual),
    }, { tipo: "Criada", origem: "Cliente", dataNova: dia, horaNova: horario });
    const novaLista = [...listaAtual, novo];
    salvarAgendamentos(novaLista);
    cadastrarOuAtualizarCliente(novo.cliente, novo.whatsapp);
    setAgendamentos(novaLista);
    setReservaConcluida(novo);
    setCodigoCopiado(false);
  }

  async function copiarCodigo() {
    if (!reservaConcluida?.codigo) return;
    await navigator.clipboard.writeText(reservaConcluida.codigo);
    setCodigoCopiado(true);
  }

  function linkConfirmacaoWhatsapp(reserva: Agendamento) {
    const mensagem = encodeURIComponent(
      `Olá, PH10! Acabei de fazer uma reserva.\n\n` +
      `Nome: ${reserva.cliente}\n` +
      `Serviço: ${reserva.servico}\n` +
      `Data: ${reserva.data.split("-").reverse().join("/")}\n` +
      `Horário: ${reserva.hora}\n` +
      `Valor: ${dinheiro(reserva.valor)}\n` +
      `Código: ${reserva.codigo}`
    );
    return `https://wa.me/${whatsappPH10}?text=${mensagem}`;
  }

  function linkPedidoRemarcacao(reserva: Agendamento) {
    const mensagem = encodeURIComponent(
      `Olá, PH10! Eu já tenho uma reserva para ${reserva.data.split("-").reverse().join("/")} às ${reserva.hora} e preciso conversar sobre uma remarcação.${reserva.codigo ? `\nCódigo: ${reserva.codigo}` : ""}`
    );
    return `https://wa.me/${whatsappPH10}?text=${mensagem}`;
  }

  return (
    <main className="min-h-screen bg-[#24211e] text-[#f3ead8]">
      <div className="mx-auto w-full max-w-md px-4 py-5 lg:max-w-4xl">
        {!reservaConcluida && (
          <header className="hero-panel">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">PH10</p>
            <h1 className="mt-2 text-3xl font-black">Barbearia PH10</h1>
            <p className="mt-2 text-sm text-neutral-400">Escolha o serviço, o dia e um horário disponível.</p>
            <ClientReservationLookup
              agendamentos={agendamentos}
              bloqueios={bloqueios}
              configuracao={configuracao}
              whatsappPH10={whatsappPH10}
              onAtualizar={setAgendamentos}
            />
          </header>
        )}

        {reservaConcluida ? (
          <section className="rounded-[2rem] bg-green-500/10 p-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-green-400/30 bg-green-400/10 text-green-300 shadow-[0_0_40px_rgba(74,222,128,.12)]">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 4 4L19 6" />
              </svg>
            </div>
            <h2 className="mt-3 text-2xl font-black">Reserva realizada</h2>
            <p className="mt-2 text-sm text-neutral-300">Seu horário já está reservado na agenda da PH10.</p>
            <div className="mt-5 rounded-3xl bg-neutral-900 p-5 text-left">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.18em] text-neutral-400">Código da reserva</p>
                  <p className="mt-1 text-xl font-black text-amber-400">{reservaConcluida.codigo}</p>
                </div>
                <button type="button" onClick={copiarCodigo} className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-xs font-black">
                  {codigoCopiado ? "Copiado!" : "Copiar"}
                </button>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-neutral-400">Cliente</dt><dd className="text-right font-bold">{reservaConcluida.cliente}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-neutral-400">Serviço</dt><dd className="text-right font-bold">{reservaConcluida.servico}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-neutral-400">Data</dt><dd className="text-right font-bold">{reservaConcluida.data.split("-").reverse().join("/")}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-neutral-400">Horário</dt><dd className="text-right font-bold">{reservaConcluida.hora}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-neutral-400">Valor</dt><dd className="text-right font-bold">{dinheiro(reservaConcluida.valor)}</dd></div>
              </dl>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-neutral-400">Guarde esse código. Ele identifica sua reserva caso você precise falar com a PH10.</p>
            <a
              href={linkConfirmacaoWhatsapp(reservaConcluida)}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex w-full items-center justify-center rounded-2xl bg-green-500 px-4 py-4 text-sm font-black text-white"
            >
              Enviar confirmação ao PH10
            </a>
            <p className="mt-2 text-xs text-neutral-400">A mensagem será aberta pronta. Revise e toque em enviar no WhatsApp.</p>
            <button onClick={() => { setReservaConcluida(null); setServicoId(null); setHorario(""); setNome(""); setWhatsapp(""); }} className="mt-4 w-full rounded-2xl bg-white/10 py-4 text-sm font-black">Voltar ao início</button>
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

      {reservaExistenteAviso && (
        <div onClick={() => setReservaExistenteAviso(null)} className="safe-modal-shell fixed inset-0 z-[300] flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="reserva-existente-titulo" onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-neutral-900 p-6 text-center text-white shadow-2xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-amber-400/25 bg-amber-400/10 text-2xl font-black text-amber-400">!</div>
            <h2 id="reserva-existente-titulo" className="mt-4 text-2xl font-black">Você já tem uma reserva</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">Encontramos um horário ativo para este WhatsApp.</p>
            <div className="mt-5 rounded-2xl bg-neutral-950 p-4 text-left">
              <div className="flex justify-between gap-4"><span className="text-sm text-neutral-400">Data</span><strong>{reservaExistenteAviso.data.split("-").reverse().join("/")}</strong></div>
              <div className="mt-2 flex justify-between gap-4"><span className="text-sm text-neutral-400">Horário</span><strong>{reservaExistenteAviso.hora}</strong></div>
              {reservaExistenteAviso.codigo && <p className="mt-3 border-t border-white/10 pt-3 text-center font-mono text-xs font-bold tracking-wider text-neutral-500">{reservaExistenteAviso.codigo}</p>}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-neutral-400">Para trocar o horário, fale com a PH10 antes de fazer uma nova reserva.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setReservaExistenteAviso(null)} className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-black">Entendi</button>
              <a href={linkPedidoRemarcacao(reservaExistenteAviso)} target="_blank" rel="noreferrer" className="flex items-center justify-center rounded-2xl bg-green-500 px-4 py-4 text-sm font-black text-white">Falar com a PH10</a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
