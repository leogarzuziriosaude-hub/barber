"use client";

import { useEffect, useMemo, useState } from "react";

type Cliente = {
  id: number;
  nome: string;
  whatsapp: string;
  ultimoAtendimento: string | null;
  ultimoServico: string | null;
  totalVisitas: number;
  status: "Ativo" | "Sumido";
};

const clientesIniciais: Cliente[] = [];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [clienteHistorico, setClienteHistorico] = useState<Cliente | null>(null);

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    function fecharComEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setModalNovoAberto(false);
        setClienteHistorico(null);
      }
    }

    if (modalNovoAberto || clienteHistorico) {
      document.addEventListener("keydown", fecharComEsc);
    }

    return () => {
      document.removeEventListener("keydown", fecharComEsc);
    };
  }, [modalNovoAberto, clienteHistorico]);

  const clientesSumidos = useMemo(() => {
    return clientes.filter((cliente) => cliente.status === "Sumido").length;
  }, [clientes]);

  const clientesAtivos = clientes.length - clientesSumidos;

  const maiorNumeroVisitas = clientes.reduce((maior, cliente) => {
    return cliente.totalVisitas > maior ? cliente.totalVisitas : maior;
  }, 0);

  function salvarCliente() {
    if (!nome || !whatsapp) {
      alert("Preencha nome e WhatsApp.");
      return;
    }

    const novoCliente: Cliente = {
      id: Date.now(),
      nome,
      whatsapp,
      ultimoAtendimento: null,
      ultimoServico: null,
      totalVisitas: 0,
      status: "Ativo",
    };

    setClientes((listaAtual) => [novoCliente, ...listaAtual]);
    setNome("");
    setWhatsapp("");
    setModalNovoAberto(false);
  }

  function abrirWhatsapp(cliente: Cliente) {
    const mensagem = encodeURIComponent(
      `Fala, ${cliente.nome}! Tudo bem? Quer marcar um horário na PH10 essa semana?`
    );

    return `https://wa.me/55${cliente.whatsapp}?text=${mensagem}`;
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
              <h1 className="text-3xl font-black">Clientes</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Controle quem voltou, quem sumiu e quem mais agenda.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalNovoAberto(true)}
              className="rounded-2xl bg-amber-400 px-4 py-3 text-xs font-black text-neutral-950"
            >
              + Novo
            </button>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-3xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Total</p>
            <strong className="mt-2 block text-3xl">{clientes.length}</strong>
          </div>

          <div className="rounded-3xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Ativos</p>
            <strong className="mt-2 block text-3xl text-green-300">
              {clientesAtivos}
            </strong>
          </div>

          <div className="rounded-3xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Sumidos</p>
            <strong className="mt-2 block text-3xl text-yellow-300">
              {clientesSumidos}
            </strong>
          </div>

          <div className="rounded-3xl bg-amber-400 p-4 text-neutral-950">
            <p className="text-xs font-bold">Top visitas</p>
            <strong className="mt-2 block text-2xl">
              {maiorNumeroVisitas}
            </strong>
          </div>
        </section>

        <section className="mt-5 space-y-3">
          {clientes.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-neutral-900 p-6 text-center">
              <p className="text-lg font-black">Nenhum cliente cadastrado</p>
              <p className="mt-2 text-sm text-neutral-400">
                Clique em + Novo para cadastrar o primeiro cliente.
              </p>
            </div>
          ) : (
            clientes.map((cliente) => (
              <article
                key={cliente.id}
                className="rounded-[1.75rem] bg-neutral-900 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black">{cliente.nome}</h2>

                    <p className="mt-1 text-sm text-neutral-400">
                      WhatsApp: {cliente.whatsapp}
                    </p>

                    <p className="text-sm text-neutral-400">
                      {cliente.ultimoAtendimento
                        ? `Último: ${cliente.ultimoAtendimento}`
                        : "Sem atendimentos ainda"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-black ${
                      cliente.status === "Ativo"
                        ? "bg-green-500/10 text-green-300"
                        : "bg-yellow-500/10 text-yellow-300"
                    }`}
                  >
                    {cliente.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a
                    href={abrirWhatsapp(cliente)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-green-500 px-3 py-3 text-center text-xs font-black text-white"
                  >
                    WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={() => setClienteHistorico(cliente)}
                    className="rounded-2xl bg-white/10 px-3 py-3 text-xs font-black"
                  >
                    Ver histórico
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>

      {modalNovoAberto && (
        <div
          onClick={() => setModalNovoAberto(false)}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-4 lg:items-center"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-[2rem] bg-neutral-900 p-5 text-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Novo cliente</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Cadastro manual de cliente da PH10.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalNovoAberto(false)}
                className="rounded-full bg-white/10 px-3 py-2 text-sm font-black"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <input
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Nome do cliente"
                className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />

              <input
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                placeholder="WhatsApp"
                className="w-full rounded-2xl bg-neutral-950 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModalNovoAberto(false)}
                className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-black"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarCliente}
                className="rounded-2xl bg-amber-400 px-4 py-4 text-sm font-black text-neutral-950"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {clienteHistorico && (
        <div
          onClick={() => setClienteHistorico(null)}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-4 lg:items-center"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-[2rem] bg-neutral-900 p-5 text-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Histórico</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  {clienteHistorico.nome}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setClienteHistorico(null)}
                className="rounded-full bg-white/10 px-3 py-2 text-sm font-black"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-neutral-950 p-4">
              <p className="text-sm text-neutral-400">Total de visitas</p>
              <p className="mt-1 text-3xl font-black text-amber-400">
                {clienteHistorico.totalVisitas}
              </p>
            </div>

            <div className="mt-3 rounded-2xl bg-neutral-950 p-4">
              <p className="text-sm text-neutral-400">Último atendimento</p>
              <p className="mt-1 font-bold">
                {clienteHistorico.ultimoAtendimento ?? "Nenhum atendimento ainda"}
              </p>
            </div>

            <div className="mt-3 rounded-2xl bg-neutral-950 p-4">
              <p className="text-sm text-neutral-400">Último serviço</p>
              <p className="mt-1 font-bold">
                {clienteHistorico.ultimoServico ?? "Nenhum serviço ainda"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setClienteHistorico(null)}
              className="mt-5 w-full rounded-2xl bg-amber-400 px-4 py-4 text-sm font-black text-neutral-950"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}