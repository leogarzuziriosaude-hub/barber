"use client";

import { useState } from "react";

const servicos = [
  { id: 1, nome: "Corte", tempo: "40 min", valor: 40 },
  { id: 2, nome: "Barba", tempo: "30 min", valor: 30 },
  { id: 3, nome: "Corte + barba", tempo: "1h", valor: 70 },
  { id: 4, nome: "Corte + sobrancelha", tempo: "50 min", valor: 55 },
];

const dias = [
  { data: "2026-06-21", semana: "Dom", dia: "21" },
  { data: "2026-06-22", semana: "Seg", dia: "22" },
  { data: "2026-06-23", semana: "Ter", dia: "23" },
  { data: "2026-06-24", semana: "Qua", dia: "24" },
  { data: "2026-06-25", semana: "Qui", dia: "25" },
];

const horarios = ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"];

function dinheiro(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PaginaCliente() {
  const [servicoId, setServicoId] = useState<number | null>(null);
  const [dia, setDia] = useState("2026-06-21");
  const [horario, setHorario] = useState("");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [enviado, setEnviado] = useState(false);

  const servico = servicos.find((item) => item.id === servicoId);

  function solicitar() {
    if (!servicoId || !dia || !horario || !nome || !whatsapp) {
      alert("Preencha todos os campos.");
      return;
    }

    setEnviado(true);
  }

  return (
    <main className="min-h-screen bg-[#24211e] text-[#f3ead8]">
      <div className="mx-auto w-full max-w-md px-4 py-5 lg:max-w-4xl">
        <header className="hero-panel">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
            PH10
          </p>

          <h1 className="mt-2 text-3xl font-black">Barbearia PH10</h1>

          <p className="mt-2 text-sm text-neutral-400">
            Escolha serviço, dia e horário. Depois aguarde a confirmação.
          </p>
        </header>

        {enviado ? (
          <section className="mt-5 rounded-[2rem] bg-green-500/10 p-6 text-center">
            <p className="text-4xl">✅</p>

            <h2 className="mt-3 text-2xl font-black">
              Agendamento solicitado
            </h2>

            <p className="mt-2 text-sm text-neutral-300">
              A PH10 vai confirmar seu horário pelo WhatsApp.
            </p>

            <div className="mt-5 rounded-3xl bg-neutral-900 p-4 text-left">
              <p className="font-bold">{nome}</p>
              <p className="text-sm text-neutral-400">
                {servico?.nome} • {horario}
              </p>
            </div>

            <button
              onClick={() => setEnviado(false)}
              className="mt-5 w-full rounded-2xl bg-amber-400 py-4 text-sm font-black text-neutral-950"
            >
              Fazer outro agendamento
            </button>
          </section>
        ) : (
          <>
            <section className="mt-6">
              <h2 className="text-xl font-black">Serviço</h2>

              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {servicos.map((item) => {
                  const ativo = item.id === servicoId;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setServicoId(item.id)}
                      className={`rounded-3xl border p-4 text-left ${
                        ativo
                          ? "border-amber-400 bg-amber-400 text-neutral-950"
                          : "border-white/10 bg-neutral-900"
                      }`}
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-black">{item.nome}</p>
                          <p className="text-sm opacity-70">{item.tempo}</p>
                        </div>

                        <strong>{dinheiro(item.valor)}</strong>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-black">Dia</h2>

              <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
                {dias.map((item) => {
                  const ativo = item.data === dia;

                  return (
                    <button
                      key={item.data}
                      onClick={() => setDia(item.data)}
                      className={`min-w-16 rounded-3xl border p-3 text-center ${
                        ativo
                          ? "border-amber-400 bg-amber-400 text-neutral-950"
                          : "border-white/10 bg-neutral-900"
                      }`}
                    >
                      <span className="block text-xs font-bold">
                        {item.semana}
                      </span>
                      <strong className="block text-2xl">{item.dia}</strong>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-black">Horário</h2>

              <div className="mt-3 grid grid-cols-3 gap-3">
                {horarios.map((item) => {
                  const ativo = item === horario;

                  return (
                    <button
                      key={item}
                      onClick={() => setHorario(item)}
                      className={`rounded-2xl border py-3 text-sm font-black ${
                        ativo
                          ? "border-amber-400 bg-amber-400 text-neutral-950"
                          : "border-white/10 bg-neutral-900"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-6 rounded-[2rem] bg-neutral-900 p-5">
              <h2 className="text-xl font-black">Seus dados</h2>

              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className="mt-4 w-full rounded-2xl bg-neutral-950 px-4 py-4 outline-none"
              />

              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp"
                className="mt-3 w-full rounded-2xl bg-neutral-950 px-4 py-4 outline-none"
              />
            </section>

            <div className="sticky bottom-0 -mx-4 mt-6 bg-neutral-950/95 p-4 backdrop-blur lg:static lg:mx-0 lg:p-0">
              <button
                onClick={solicitar}
                className="w-full rounded-2xl bg-amber-400 py-4 text-sm font-black text-neutral-950"
              >
                Solicitar agendamento
              </button>

              {servico && horario && (
                <p className="mt-3 text-center text-xs text-neutral-400">
                  {servico.nome} • {dinheiro(servico.valor)} • {horario}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
