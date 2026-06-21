const resumoSemana = { agendamentos: 12, confirmados: 8, pendentes: 3, cancelados: 1, faturamentoPrevisto: "R$ 620,00" };

const proximosAgendamentos = [
  { dia: "Hoje", hora: "09:00", cliente: "João Silva", servico: "Corte clássico", status: "Confirmado" },
  { dia: "Hoje", hora: "10:30", cliente: "Rafael Costa", servico: "Corte + barba", status: "Pendente" },
  { dia: "Amanhã", hora: "11:00", cliente: "Matheus Lima", servico: "Corte degradê", status: "Pendente" },
];

const alertas = [
  "3 clientes aguardam confirmação.",
  "2 clientes não retornam há mais de 45 dias.",
  "Sexta-feira ainda tem horários disponíveis.",
];

export default function InicioPage() {
  return (
    <main className="app-page">
      <div className="page-wrap">
        <header className="hero-panel">
          <div className="relative z-10 flex items-end justify-between gap-5">
            <div>
              <p className="eyebrow">PH10 • Visão geral</p>
              <h1 className="display-font page-title">Boa noite,<br />Pedro.</h1>
              <p className="subtle mt-4 max-w-md text-sm">A semana está em bom ritmo. Aqui está o que merece sua atenção hoje.</p>
            </div>
            <div className="hidden rounded-full border border-[#eee2c9]/15 px-4 py-2 text-xs text-[#cbbda9] md:block">21 JUN • 2026</div>
          </div>
        </header>

        <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="card p-4 lg:p-5"><p className="metric-label">Agendamentos</p><strong className="metric-value">{resumoSemana.agendamentos}</strong><p className="mt-3 text-[11px] text-[#8f867d]">nesta semana</p></div>
          <div className="card p-4 lg:p-5"><p className="metric-label">Confirmados</p><strong className="metric-value text-[#c6d0ba]">{resumoSemana.confirmados}</strong><p className="mt-3 text-[11px] text-[#8f867d]">67% da agenda</p></div>
          <div className="card p-4 lg:p-5"><p className="metric-label">Pendentes</p><strong className="metric-value text-[#ddb383]">{resumoSemana.pendentes}</strong><p className="mt-3 text-[11px] text-[#8f867d]">pedem atenção</p></div>
          <div className="card card-accent p-4 lg:p-5"><p className="metric-label !text-[#695d4e]">Faturamento previsto</p><strong className="mt-3 block text-2xl font-black">{resumoSemana.faturamentoPrevisto}</strong><p className="mt-3 text-[11px] text-[#695d4e]">+12% vs. semana anterior</p></div>
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_.8fr]">
          <section className="card p-5 lg:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-[#eee2c9]/10 pb-5">
              <div><p className="eyebrow">Agenda</p><h2 className="display-font section-title mt-2">Próximos horários</h2></div>
              <a href="/inicio/agenda" className="btn-secondary">Ver agenda →</a>
            </div>
            <div className="divide-y divide-[#eee2c9]/10">
              {proximosAgendamentos.map((item) => (
                <article key={`${item.hora}-${item.cliente}`} className="grid grid-cols-[3.7rem_1fr_auto] items-center gap-3 py-4">
                  <div><p className="text-lg font-black text-[#dfc79f]">{item.hora}</p><p className="text-[9px] font-bold uppercase tracking-wider text-[#81786f]">{item.dia}</p></div>
                  <div><h3 className="font-bold">{item.cliente}</h3><p className="mt-1 text-xs text-[#9e958b]">{item.servico}</p></div>
                  <span className={`status ${item.status === "Confirmado" ? "status-ok" : "status-warn"}`}>{item.status}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="card p-5 lg:p-6">
            <p className="eyebrow">Fique atento</p><h2 className="display-font section-title mt-2">Radar do dia</h2>
            <div className="mt-5 space-y-3">
              {alertas.map((alerta, i) => <div key={alerta} className="flex gap-3 rounded-xl bg-[#201e1b] p-4 text-sm leading-relaxed text-[#c6baaa]"><span className="font-mono text-xs text-[#b77a42]">0{i + 1}</span>{alerta}</div>)}
            </div>
          </section>
        </div>

        <section className="mt-4 grid gap-3 md:grid-cols-3">
          <a href="/inicio/agenda" className="card card-accent group p-5"><p className="text-xs font-bold uppercase tracking-widest text-[#746653]">Agenda</p><h3 className="display-font mt-6 text-3xl">Organizar semana</h3><p className="mt-4 text-sm">Abrir calendário <span className="transition group-hover:ml-1">→</span></p></a>
          <a href="/inicio/clientes" className="card p-5"><p className="eyebrow">Relacionamento</p><h3 className="display-font mt-6 text-3xl">Seus clientes</h3><p className="subtle mt-4 text-sm">Histórico e retornos →</p></a>
          <a href="/inicio/servicos" className="card p-5"><p className="eyebrow">Menu</p><h3 className="display-font mt-6 text-3xl">Serviços & valores</h3><p className="subtle mt-4 text-sm">Gerenciar catálogo →</p></a>
        </section>
      </div>
    </main>
  );
}
