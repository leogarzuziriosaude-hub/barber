import Link from "next/link";

const servicos = [
  { nome: "Corte", duracao: "40 min", valor: "R$ 40,00", status: "Ativo" },
  { nome: "Barba", duracao: "30 min", valor: "R$ 30,00", status: "Ativo" },
  { nome: "Corte + barba", duracao: "1h", valor: "R$ 70,00", status: "Ativo" },
  { nome: "Corte + sobrancelha", duracao: "50 min", valor: "R$ 55,00", status: "Ativo" },
];


export default function ServicosPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-md px-4 pb-24 pt-5 lg:max-w-6xl lg:pb-8">
        <header className="rounded-[2rem] bg-neutral-900 p-5">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
            PH10
          </p>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black">Serviços</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Valores, duração e serviços disponíveis.
              </p>
            </div>

            <button className="rounded-2xl bg-amber-400 px-4 py-3 text-xs font-black text-neutral-950">
              + Novo
            </button>
          </div>
        </header>

        <section className="mt-5 grid gap-3 lg:grid-cols-2">
          {servicos.map((servico) => (
            <article key={servico.nome} className="rounded-[1.75rem] bg-neutral-900 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{servico.nome}</h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Duração: {servico.duracao}
                  </p>
                </div>

                <span className="rounded-full bg-green-500/10 px-3 py-1 text-[11px] font-black text-green-300">
                  {servico.status}
                </span>
              </div>

              <p className="mt-4 text-3xl font-black text-amber-400">
                {servico.valor}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button className="rounded-2xl bg-white/10 px-4 py-3 text-xs font-black">
                  Editar
                </button>

                <button className="rounded-2xl bg-red-500/10 px-4 py-3 text-xs font-black text-red-300">
                  Desativar
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}