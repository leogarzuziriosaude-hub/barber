export const AGENDAMENTOS_KEY = "ph10:agendamentos";
export const SERVICOS_KEY = "ph10:servicos";
export const COMBOS_KEY = "ph10:combos";
export const AGENDA_CONFIG_KEY = "ph10:configuracao-agenda";
export const BLOQUEIOS_KEY = "ph10:bloqueios";

export type Servico = { id: number; nome: string; duracao: string; valor: number; status: "Ativo" | "Inativo" };
export type Combo = { id: number; nome: string; duracao: string; servicosIds: number[]; valor: number; descontoPercentual?: number; status: "Ativo" | "Inativo" };
export type DiaFuncionamento = { id: string; nome: string; curto: string; ativo: boolean; abertura: string; fechamento: string; temPausa: boolean; pausaInicio: string; pausaFim: string };
export type ConfigAgenda = { intervalo: "15" | "30" | "45" | "60"; antecedenciaMinima: "1" | "2" | "4" | "24"; diasParaAgendar: "7" | "15" | "30" };
export type ConfiguracaoAgenda = { diasFuncionamento: DiaFuncionamento[]; configAgenda: ConfigAgenda };
export type BloqueioAgenda = { id: number; data: string; diaInteiro: boolean; inicio: string; fim: string; motivo: string };

export type Agendamento = {
  id: number;
  data: string;
  hora: string;
  cliente: string;
  servico: string;
  valor: number;
  whatsapp: string;
  duracaoMinutos?: number;
  statusManual?: "Cancelado" | "Não compareceu";
};

export type StatusAtendimento = "Agendado" | "Em atendimento" | "Concluído" | "Cancelado" | "Não compareceu";

export function obterStatusAtendimento(agendamento: Agendamento, agora: number): StatusAtendimento {
  if (agendamento.statusManual) return agendamento.statusManual;
  const inicio = new Date(`${agendamento.data}T${agendamento.hora}:00`).getTime();
  const fim = inicio + (agendamento.duracaoMinutos ?? 30) * 60 * 1000;
  if (agora < inicio) return "Agendado";
  if (agora < fim) return "Em atendimento";
  return "Concluído";
}

export function reservaEstaAtiva(agendamento: Agendamento, agora: number) {
  const status = obterStatusAtendimento(agendamento, agora);
  return status === "Agendado" || status === "Em atendimento";
}

export function carregarAgendamentos(): Agendamento[] {
  if (typeof window === "undefined") return [];

  try {
    const dados = window.localStorage.getItem(AGENDAMENTOS_KEY);
    return dados ? (JSON.parse(dados) as Agendamento[]) : [];
  } catch {
    return [];
  }
}

export function salvarAgendamentos(agendamentos: Agendamento[]) {
  window.localStorage.setItem(AGENDAMENTOS_KEY, JSON.stringify(agendamentos));
  window.dispatchEvent(new Event("ph10:agendamentos-atualizados"));
}

function carregarLista<T>(chave: string): T[] {
  if (typeof window === "undefined") return [];
  try { const dados = localStorage.getItem(chave); return dados ? JSON.parse(dados) : []; } catch { return []; }
}

export const carregarServicos = () => carregarLista<Servico>(SERVICOS_KEY);
export const carregarCombos = () => carregarLista<Combo>(COMBOS_KEY);
export const carregarBloqueios = () => carregarLista<BloqueioAgenda>(BLOQUEIOS_KEY);
export function salvarServicos(servicos: Servico[]) { localStorage.setItem(SERVICOS_KEY, JSON.stringify(servicos)); }
export function salvarCombos(combos: Combo[]) { localStorage.setItem(COMBOS_KEY, JSON.stringify(combos)); }
export function salvarBloqueios(bloqueios: BloqueioAgenda[]) { localStorage.setItem(BLOQUEIOS_KEY, JSON.stringify(bloqueios)); }
export function carregarConfiguracaoAgenda(): ConfiguracaoAgenda | null {
  if (typeof window === "undefined") return null;
  try { const dados = localStorage.getItem(AGENDA_CONFIG_KEY); return dados ? JSON.parse(dados) : null; } catch { return null; }
}
export function salvarConfiguracaoAgenda(configuracao: ConfiguracaoAgenda) {
  localStorage.setItem(AGENDA_CONFIG_KEY, JSON.stringify(configuracao));
}

export function dataLocal(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function proximosDias(quantidade = 7) {
  return Array.from({ length: quantidade }, (_, indice) => {
    const data = new Date();
    data.setHours(12, 0, 0, 0);
    data.setDate(data.getDate() + indice);

    return {
      data: dataLocal(data),
      semana: new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
        .format(data)
        .replace(".", ""),
      dia: String(data.getDate()).padStart(2, "0"),
    };
  });
}
