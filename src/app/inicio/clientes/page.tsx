const clientes = [
  {
    nome: "João Silva",
    whatsapp: "21999999999",
    ultimoServico: "Corte",
    ultimoAtendimento: "21/06/2026",
    totalVisitas: 8,
    status: "Ativo",
  },
  {
    nome: "Rafael Costa",
    whatsapp: "21988888888",
    ultimoServico: "Corte + barba",
    ultimoAtendimento: "18/06/2026",
    totalVisitas: 5,
    status: "Ativo",
  },
  {
    nome: "Lucas Mendes",
    whatsapp: "21977777777",
    ultimoServico: "Barba",
    ultimoAtendimento: "02/05/2026",
    totalVisitas: 3,
    status: "Sumido",
  },
  {
    nome: "Bruno Alves",
    whatsapp: "21955555555",
    ultimoServico: "Corte + sobrancelha",
    ultimoAtendimento: "27/04/2026",
    totalVisitas: 4,
    status: "Sumido",
  },
];

export default function ClientesPage() {
  const clientesSumidos = clientes.filter(
    (cliente) => cliente.status === "Sumido"
  ).length;

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-md px-4 pb-24 pt-5 lg:max-w-6xl lg:pb-8">
        <header className="rounded-[2rem] bg-neutral-900 p-5">
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

            <button className="rounded-2xl bg-amber-400 px-4 py-3 text-xs font-black text-neutral-950">
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
            <p className="text-xs text-neutral-400">Sumidos</p>
            <strong className="mt-2 block text-3xl text-yellow-300">
              {clientesSumidos}
            </strong>
          </div>

          <div className="rounded-3xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">Ativos</p>
            <strong className="mt-2 block text-3xl text-green-300">
              {clientes.length - clientesSumidos}
            </strong>
          </div>

          <div className="rounded-3xl bg-amber-400 p-4 text-neutral-950">
            <p className="text-xs font-bold">Top visitas</p>
            <strong className="mt-2 block text-2xl">8</strong>
          </div>
        </section>

        <section className="mt-5 space-y-3">
          {clientes.map((cliente) => {
            const mensagem = encodeURIComponent(
              `Fala, ${cliente.nome}! Tudo bem? Quer marcar um horário na PH10 essa semana?`
            );

            const link = `https://wa.me/55${cliente.whatsapp}?text=${mensagem}`;

            return (
              <article
                key={cliente.whatsapp}
                className="rounded-[1.75rem] bg-neutral-900 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black">{cliente.nome}</h2>
                    <p className="mt-1 text-sm text-neutral-400">
                      Último: {cliente.ultimoAtendimento}
                    </p>
                    <p className="text-sm text-neutral-400">
                      {cliente.ultimoServico} • {cliente.totalVisitas} visitas
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
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-green-500 px-3 py-3 text-center text-xs font-black text-white"
                  >
                    WhatsApp
                  </a>

                  <button className="rounded-2xl bg-white/10 px-3 py-3 text-xs font-black">
                    Ver histórico
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}