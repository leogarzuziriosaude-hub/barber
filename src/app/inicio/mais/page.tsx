"use client";


export default function MaisPage() {
  function copiarLink() {
    const link = `${window.location.origin}/b/ph10`;
    navigator.clipboard.writeText(link);
    alert("Link copiado!");
  }

  return (
    <main className="app-page">
      <div className="page-wrap">
        <header className="hero-panel">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
            PH10
          </p>

          <h1 className="mt-3 text-3xl font-black">Mais</h1>

          <p className="mt-1 text-sm text-neutral-400">
            Configurações, link público e ferramentas rápidas.
          </p>
        </header>

        <section className="mt-5 space-y-3">
          <div className="rounded-[1.75rem] bg-amber-400 p-5 text-neutral-950">
            <p className="text-sm font-bold">Link de agendamento</p>
            <h2 className="mt-2 text-xl font-black">/b/ph10</h2>
            <p className="mt-1 text-sm text-neutral-800">
              Envie esse link para clientes ou coloque na bio do Instagram.
            </p>

            <button
              onClick={copiarLink}
              className="mt-4 w-full rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-black text-white"
            >
              Copiar link
            </button>
          </div>

          <div className="rounded-[1.75rem] bg-neutral-900 p-5">
            <h2 className="text-xl font-black">Dados da barbearia</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl bg-neutral-950 p-4">
                <p className="text-neutral-400">Nome</p>
                <p className="mt-1 font-bold">Barbearia PH10</p>
              </div>

              <div className="rounded-2xl bg-neutral-950 p-4">
                <p className="text-neutral-400">Responsável</p>
                <p className="mt-1 font-bold">Pedro Henrique</p>
              </div>

              <div className="rounded-2xl bg-neutral-950 p-4">
                <p className="text-neutral-400">WhatsApp</p>
                <p className="mt-1 font-bold">(21) 99999-9999</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-neutral-900 p-5">
            <h2 className="text-xl font-black">Horários</h2>

            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between rounded-2xl bg-neutral-950 p-4">
                <span className="text-neutral-400">Segunda a sexta</span>
                <strong>09:00 às 18:00</strong>
              </div>

              <div className="flex justify-between rounded-2xl bg-neutral-950 p-4">
                <span className="text-neutral-400">Sábado</span>
                <strong>09:00 às 14:00</strong>
              </div>

              <div className="flex justify-between rounded-2xl bg-neutral-950 p-4">
                <span className="text-neutral-400">Domingo</span>
                <strong>Fechado</strong>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-neutral-900 p-5">
            <h2 className="text-xl font-black">Resumo do dia</h2>

            <p className="mt-3 text-sm text-neutral-400">
              Hoje: 3 agendamentos, 2 confirmados, 1 pendente e previsão de R$ 140,00.
            </p>

            <button className="mt-4 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-black">
              Copiar resumo
            </button>
          </div>

          <button className="w-full rounded-[1.25rem] bg-red-500/10 px-4 py-4 text-sm font-black text-red-300">
            Sair
          </button>
        </section>
      </div>
    </main>
  );
}
