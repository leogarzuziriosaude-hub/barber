"use client";

import { useEffect, useMemo, useState } from "react";
import { carregarCombos, carregarServicos, salvarCombos, salvarServicos } from "@/lib/barber-storage";

type Status = "Ativo" | "Inativo";

type Servico = {
  id: number;
  nome: string;
  duracao: string;
  valor: number;
  status: Status;
};

type Combo = {
  id: number;
  nome: string;
  duracao: string;
  servicosIds: number[];
  valor: number;
  descontoPercentual?: number;
  status: Status;
};

type ModalTipo = "escolha" | "servico" | "combo" | null;

const servicosIniciais: Servico[] = [];

const combosIniciais: Combo[] = [];

function somenteNumeros(valor: string) { return valor.replace(/\D/g, ""); }
function duracaoComUnidade(valor: string) {
  const numero = somenteNumeros(valor);
  return numero ? `${numero} min` : valor;
}

function dinheiro(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>(servicosIniciais);
  const [combos, setCombos] = useState<Combo[]>(combosIniciais);
  const [dadosCarregados, setDadosCarregados] = useState(false);

  const [modalTipo, setModalTipo] = useState<ModalTipo>(null);

  const [servicoEditando, setServicoEditando] = useState<Servico | null>(null);
  const [comboEditando, setComboEditando] = useState<Combo | null>(null);

  const [servicoParaApagar, setServicoParaApagar] = useState<Servico | null>(
    null
  );
  const [comboParaApagar, setComboParaApagar] = useState<Combo | null>(null);

  const [nomeServico, setNomeServico] = useState("");
  const [duracaoServico, setDuracaoServico] = useState("");
  const [valorServico, setValorServico] = useState("");

  const [nomeCombo, setNomeCombo] = useState("");
  const [duracaoCombo, setDuracaoCombo] = useState("");
  const [valorCombo, setValorCombo] = useState("");
  const [descontoCombo, setDescontoCombo] = useState("0");
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>(
    []
  );

  useEffect(() => {
    function carregarDados() {
      setServicos(carregarServicos());
      setCombos(carregarCombos());
      setDadosCarregados(true);
    }
    carregarDados();
  }, []);

  useEffect(() => {
    if (dadosCarregados) salvarServicos(servicos);
  }, [servicos, dadosCarregados]);

  useEffect(() => {
    if (dadosCarregados) salvarCombos(combos);
  }, [combos, dadosCarregados]);

  useEffect(() => {
    function fecharComEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        fecharTudo();
      }
    }

    if (modalTipo || servicoParaApagar || comboParaApagar) {
      document.addEventListener("keydown", fecharComEsc);
    }

    return () => {
      document.removeEventListener("keydown", fecharComEsc);
    };
  }, [modalTipo, servicoParaApagar, comboParaApagar]);

  const servicosAtivos = useMemo(() => {
    return servicos.filter((servico) => servico.status === "Ativo").length;
  }, [servicos]);

  const combosAtivos = useMemo(() => {
    return combos.filter((combo) => combo.status === "Ativo").length;
  }, [combos]);

  const ticketMedioServicos = useMemo(() => {
    if (servicos.length === 0) return 0;

    const total = servicos.reduce((soma, servico) => soma + servico.valor, 0);
    return total / servicos.length;
  }, [servicos]);

  const ticketMedioCombos = useMemo(() => {
    if (combos.length === 0) return 0;

    const total = combos.reduce((soma, combo) => soma + combo.valor, 0);
    return total / combos.length;
  }, [combos]);

  function fecharTudo() {
    setModalTipo(null);

    setServicoEditando(null);
    setComboEditando(null);

    setServicoParaApagar(null);
    setComboParaApagar(null);

    setNomeServico("");
    setDuracaoServico("");
    setValorServico("");

    setNomeCombo("");
    setDuracaoCombo("");
    setValorCombo("");
    setDescontoCombo("0");
    setServicosSelecionados([]);
  }

  function abrirNovoServico() {
    setServicoEditando(null);
    setNomeServico("");
    setDuracaoServico("");
    setValorServico("");
    setModalTipo("servico");
  }

  function abrirEditarServico(servico: Servico) {
    setServicoEditando(servico);
    setNomeServico(servico.nome);
    setDuracaoServico(somenteNumeros(servico.duracao));
    setValorServico(String(servico.valor));
    setModalTipo("servico");
  }

  function abrirNovoCombo() {
    setComboEditando(null);
    setNomeCombo("");
    setDuracaoCombo("");
    setValorCombo("");
    setDescontoCombo("0");
    setServicosSelecionados([]);
    setModalTipo("combo");
  }

  function abrirEditarCombo(combo: Combo) {
    setComboEditando(combo);
    setNomeCombo(combo.nome);
    setDuracaoCombo(somenteNumeros(combo.duracao));
    setValorCombo(String(combo.valor));
    const valorOriginal = combo.servicosIds.reduce((total, id) => total + (servicos.find((item) => item.id === id)?.valor ?? 0), 0);
    const descontoCalculado = valorOriginal > 0 ? Math.max(0, Math.round((1 - combo.valor / valorOriginal) * 100)) : 0;
    setDescontoCombo(String(combo.descontoPercentual ?? descontoCalculado));
    setServicosSelecionados(combo.servicosIds);
    setModalTipo("combo");
  }

  function salvarServico() {
    if (!nomeServico || !duracaoServico || !valorServico) {
      alert("Preencha nome, duração e valor.");
      return;
    }

    const valorNumerico = Number(valorServico.replace(",", "."));

    if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    if (servicoEditando) {
      setServicos((listaAtual) =>
        listaAtual.map((servico) =>
          servico.id === servicoEditando.id
            ? {
                ...servico,
                nome: nomeServico,
                duracao: somenteNumeros(duracaoServico),
                valor: valorNumerico,
              }
            : servico
        )
      );
    } else {
      const novoServico: Servico = {
        id: Date.now(),
        nome: nomeServico,
        duracao: somenteNumeros(duracaoServico),
        valor: valorNumerico,
        status: "Ativo",
      };

      setServicos((listaAtual) => [novoServico, ...listaAtual]);
    }

    fecharTudo();
  }

  function salvarCombo() {
    if (!nomeCombo || !duracaoCombo || !valorCombo) {
      alert("Preencha nome, duração e valor do combo.");
      return;
    }

    if (servicosSelecionados.length < 2) {
      alert("Selecione pelo menos 2 serviços para criar um combo.");
      return;
    }

    const valorNumerico = Number(valorCombo.replace(",", "."));

    if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    if (comboEditando) {
      setCombos((listaAtual) =>
        listaAtual.map((combo) =>
          combo.id === comboEditando.id
            ? {
                ...combo,
                nome: nomeCombo,
                duracao: somenteNumeros(duracaoCombo),
                valor: valorNumerico,
                descontoPercentual: Number(descontoCombo || 0),
                servicosIds: servicosSelecionados,
              }
            : combo
        )
      );
    } else {
      const novoCombo: Combo = {
        id: Date.now(),
        nome: nomeCombo,
        duracao: somenteNumeros(duracaoCombo),
        servicosIds: servicosSelecionados,
        valor: valorNumerico,
        descontoPercentual: Number(descontoCombo || 0),
        status: "Ativo",
      };

      setCombos((listaAtual) => [novoCombo, ...listaAtual]);
    }

    fecharTudo();
  }

  function alternarServicoCombo(id: number) {
    const novaLista = servicosSelecionados.includes(id)
      ? servicosSelecionados.filter((item) => item !== id)
      : [...servicosSelecionados, id];
    setServicosSelecionados(novaLista);
    const selecionados = servicos.filter((item) => novaLista.includes(item.id));
    const duracaoTotal = selecionados.reduce((total, item) => total + Number(somenteNumeros(item.duracao) || 0), 0);
    const valorOriginal = selecionados.reduce((total, item) => total + item.valor, 0);
    const desconto = Number(descontoCombo || 0);
    setDuracaoCombo(String(duracaoTotal || ""));
    setValorCombo(String(Math.max(0, valorOriginal * (1 - desconto / 100)).toFixed(2)));
  }

  function atualizarDescontoCombo(valor: string) {
    const desconto = Math.min(100, Number(somenteNumeros(valor) || 0));
    const valorOriginal = servicos
      .filter((item) => servicosSelecionados.includes(item.id))
      .reduce((total, item) => total + item.valor, 0);
    setDescontoCombo(String(desconto));
    setValorCombo(String(Math.max(0, valorOriginal * (1 - desconto / 100)).toFixed(2)));
  }

  function apagarServico() {
    if (!servicoParaApagar) return;

    setServicos((listaAtual) =>
      listaAtual.filter((servico) => servico.id !== servicoParaApagar.id)
    );

    setCombos((listaAtual) =>
      listaAtual.map((combo) => ({
        ...combo,
        servicosIds: combo.servicosIds.filter(
          (id) => id !== servicoParaApagar.id
        ),
      }))
    );

    fecharTudo();
  }

  function apagarCombo() {
    if (!comboParaApagar) return;

    setCombos((listaAtual) =>
      listaAtual.filter((combo) => combo.id !== comboParaApagar.id)
    );

    fecharTudo();
  }

  function nomesServicosDoCombo(combo: Combo) {
    const nomes = combo.servicosIds
      .map((id) => servicos.find((servico) => servico.id === id)?.nome)
      .filter(Boolean)
      .join(" + ");

    return nomes || "Serviços não encontrados";
  }

  function valorOriginalDoCombo(combo: Combo) {
    return combo.servicosIds.reduce((total, id) => {
      const servico = servicos.find((item) => item.id === id);
      return total + (servico?.valor ?? 0);
    }, 0);
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
              <h1 className="text-3xl font-black">Serviços</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Serviços avulsos e combos da barbearia.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalTipo("escolha")}
              className="rounded-2xl bg-amber-400 px-4 py-3 text-xs font-black text-neutral-950"
            >
              + Novo
            </button>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-3xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Serviços</p>
            <strong className="mt-2 block text-3xl">{servicos.length}</strong>
            <p className="mt-1 text-xs text-neutral-500">
              {servicosAtivos} ativos
            </p>
          </div>

          <div className="rounded-3xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Combos</p>
            <strong className="mt-2 block text-3xl text-amber-300">
              {combos.length}
            </strong>
            <p className="mt-1 text-xs text-neutral-500">{combosAtivos} ativos</p>
          </div>

          <div className="rounded-3xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Ticket serviços</p>
            <strong className="mt-2 block text-2xl text-green-300">
              {dinheiro(ticketMedioServicos)}
            </strong>
          </div>

          <div className="rounded-3xl bg-amber-400 p-4 text-neutral-950">
            <p className="text-xs font-bold">Ticket combos</p>
            <strong className="mt-2 block text-2xl">
              {dinheiro(ticketMedioCombos)}
            </strong>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-xl font-black">Serviços avulsos</h2>
            <p className="text-sm text-neutral-400">
              Serviços que o cliente pode agendar separadamente.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {servicos.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-neutral-900 p-6 text-center lg:col-span-2">
                <p className="text-lg font-black">Nenhum serviço cadastrado</p>
                <p className="mt-2 text-sm text-neutral-400">
                  Clique em + Novo e escolha Novo serviço.
                </p>
              </div>
            ) : (
              servicos.map((servico) => (
                <article
                  key={servico.id}
                  className="rounded-[1.75rem] bg-neutral-900 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black">{servico.nome}</h3>
                      <p className="mt-1 text-sm text-neutral-400">
                        Duração: {duracaoComUnidade(servico.duracao)}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-[11px] font-black text-green-300">
                      {servico.status}
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-black text-amber-400">
                    {dinheiro(servico.valor)}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => abrirEditarServico(servico)}
                      className="rounded-2xl bg-white/10 px-4 py-3 text-xs font-black"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => setServicoParaApagar(servico)}
                      className="rounded-2xl bg-red-500/10 px-4 py-3 text-xs font-black text-red-300"
                    >
                      Desativar
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="mt-8 border-t border-white/10 pt-6">
          <div className="mb-3">
            <h2 className="text-xl font-black">Combos</h2>
            <p className="text-sm text-neutral-400">
              Pacotes com mais de um serviço e preço especial.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {combos.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-neutral-900 p-6 text-center lg:col-span-2">
                <p className="text-lg font-black">Nenhum combo cadastrado</p>
                <p className="mt-2 text-sm text-neutral-400">
                  Clique em + Novo e escolha Novo combo.
                </p>
              </div>
            ) : (
              combos.map((combo) => {
                const valorOriginal = valorOriginalDoCombo(combo);

                return (
                  <article
                    key={combo.id}
                    className="rounded-[1.75rem] bg-neutral-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black">{combo.nome}</h3>
                        <p className="mt-1 text-sm text-neutral-400">
                          {nomesServicosDoCombo(combo)}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          Duração: {duracaoComUnidade(combo.duracao)}
                        </p>
                      </div>

                      <span className="rounded-full bg-amber-400/10 px-3 py-1 text-[11px] font-black text-amber-300">
                        Combo
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-3xl font-black text-amber-400">
                        {dinheiro(combo.valor)}
                      </p>

                      {valorOriginal > 0 && valorOriginal > combo.valor && (
                        <p className="mt-1 text-xs text-neutral-400">
                          Avulso sairia por {dinheiro(valorOriginal)}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => abrirEditarCombo(combo)}
                        className="rounded-2xl bg-white/10 px-4 py-3 text-xs font-black"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => setComboParaApagar(combo)}
                        className="rounded-2xl bg-red-500/10 px-4 py-3 text-xs font-black text-red-300"
                      >
                        Desativar
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>

      {modalTipo === "escolha" && (
        <div
          onClick={fecharTudo}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-4 lg:items-center"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-[2rem] bg-neutral-900 p-5 text-white shadow-2xl"
          >
            <h2 className="text-2xl font-black">O que deseja criar?</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Escolha se quer cadastrar um serviço avulso ou um combo.
            </p>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={abrirNovoServico}
                className="rounded-3xl bg-amber-400 p-5 text-left text-neutral-950"
              >
                <p className="text-lg font-black">Novo serviço</p>
                <p className="mt-1 text-sm font-medium">
                  Corte, barba, sobrancelha ou outro serviço individual.
                </p>
              </button>

              <button
                type="button"
                onClick={abrirNovoCombo}
                className="rounded-3xl bg-white/10 p-5 text-left"
              >
                <p className="text-lg font-black">Novo combo</p>
                <p className="mt-1 text-sm text-neutral-400">
                  Junte dois ou mais serviços com duração e preço especial.
                </p>
              </button>
            </div>

            <button
              type="button"
              onClick={fecharTudo}
              className="mt-5 w-full rounded-2xl bg-white/10 px-4 py-4 text-sm font-black"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {modalTipo === "servico" && (
        <div
          onClick={fecharTudo}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-4 lg:items-center"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-[2rem] bg-neutral-900 p-5 text-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">
                  {servicoEditando ? "Editar serviço" : "Novo serviço"}
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Preencha nome, duração e valor.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharTudo}
                className="rounded-full bg-white/10 px-3 py-2 text-sm font-black"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <input
                value={nomeServico}
                onChange={(event) => setNomeServico(event.target.value)}
                placeholder="Nome do serviço"
                className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />

              <input
                value={duracaoServico}
                onChange={(event) => setDuracaoServico(somenteNumeros(event.target.value))}
                placeholder="Duração em minutos. Ex: 40"
                inputMode="numeric"
                className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />

              <input
                value={valorServico}
                onChange={(event) => setValorServico(event.target.value)}
                placeholder="Valor. Ex: 40"
                inputMode="decimal"
                className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={fecharTudo}
                className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-black"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarServico}
                className="rounded-2xl bg-amber-400 px-4 py-4 text-sm font-black text-neutral-950"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalTipo === "combo" && (
        <div
          onClick={fecharTudo}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-4 lg:items-center"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[2rem] bg-neutral-900 p-5 text-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">
                  {comboEditando ? "Editar combo" : "Novo combo"}
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Selecione os serviços, a duração e o preço do combo.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharTudo}
                className="rounded-full bg-white/10 px-3 py-2 text-sm font-black"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-3xl bg-neutral-950 p-4">
                <p className="text-sm font-black">Serviços do combo</p>
                <p className="mt-1 text-xs text-neutral-400">
                  Selecione pelo menos 2 serviços.
                </p>

                <div className="mt-3 space-y-2">
                  {servicos.length === 0 ? (
                    <p className="text-sm text-neutral-400">
                      Cadastre serviços antes de criar um combo.
                    </p>
                  ) : (
                    servicos.map((servico) => {
                      const selecionado = servicosSelecionados.includes(
                        servico.id
                      );

                      return (
                        <button
                          key={servico.id}
                          type="button"
                          onClick={() => alternarServicoCombo(servico.id)}
                          className={`w-full rounded-2xl border p-3 text-left ${
                            selecionado
                              ? "border-amber-400 bg-amber-400 text-neutral-950"
                              : "border-white/10 bg-neutral-900"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-black">{servico.nome}</p>
                              <p className="text-xs opacity-70">
                                {duracaoComUnidade(servico.duracao)} • {dinheiro(servico.valor)}
                              </p>
                            </div>

                            <span className="text-sm font-black">
                              {selecionado ? "✓" : "+"}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <input
                value={nomeCombo}
                onChange={(event) => setNomeCombo(event.target.value)}
                placeholder="Nome do combo. Ex: Corte + barba"
                className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-neutral-400">Duração total</span>
                <div className="flex overflow-hidden rounded-2xl bg-neutral-950 focus-within:ring-2 focus-within:ring-amber-400">
                  <input value={duracaoCombo} onChange={(event) => setDuracaoCombo(somenteNumeros(event.target.value))} placeholder="60" inputMode="numeric" className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm outline-none" />
                  <span className="flex items-center px-4 text-sm font-bold text-neutral-400">min</span>
                </div>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-neutral-950 p-4">
                  <p className="text-xs font-bold text-neutral-400">Valor dos serviços</p>
                  <p className="mt-2 text-lg font-black">{dinheiro(servicos.filter((item) => servicosSelecionados.includes(item.id)).reduce((total, item) => total + item.valor, 0))}</p>
                </div>
                <label className="rounded-2xl bg-neutral-950 p-4 focus-within:ring-2 focus-within:ring-amber-400">
                  <span className="text-xs font-bold text-neutral-400">Desconto</span>
                  <div className="mt-1 flex items-center"><input value={descontoCombo} onChange={(event) => atualizarDescontoCombo(event.target.value)} inputMode="numeric" className="min-w-0 flex-1 bg-transparent text-lg font-black outline-none" /><span className="font-bold text-neutral-400">%</span></div>
                </label>
              </div>

              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Valor final</p>
                <p className="mt-2 text-3xl font-black text-amber-400">{dinheiro(Number(valorCombo || 0))}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={fecharTudo}
                className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-black"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarCombo}
                className="rounded-2xl bg-amber-400 px-4 py-4 text-sm font-black text-neutral-950"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {servicoParaApagar && (
        <div
          onClick={fecharTudo}
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-[2rem] bg-neutral-900 p-6 text-center text-white shadow-2xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
              ⚠️
            </div>

            <h2 className="mt-4 text-2xl font-black">Desativar serviço?</h2>

            <p className="mt-2 text-sm text-neutral-400">
              Tem certeza que deseja desativar{" "}
              <strong className="text-white">{servicoParaApagar.nome}</strong>?
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={fecharTudo}
                className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-black"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={apagarServico}
                className="rounded-2xl bg-red-500 px-4 py-4 text-sm font-black text-white"
              >
                Desativar
              </button>
            </div>
          </div>
        </div>
      )}

      {comboParaApagar && (
        <div
          onClick={fecharTudo}
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-[2rem] bg-neutral-900 p-6 text-center text-white shadow-2xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
              ⚠️
            </div>

            <h2 className="mt-4 text-2xl font-black">Desativar combo?</h2>

            <p className="mt-2 text-sm text-neutral-400">
              Tem certeza que deseja desativar{" "}
              <strong className="text-white">{comboParaApagar.nome}</strong>?
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={fecharTudo}
                className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-black"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={apagarCombo}
                className="rounded-2xl bg-red-500 px-4 py-4 text-sm font-black text-white"
              >
                Desativar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
