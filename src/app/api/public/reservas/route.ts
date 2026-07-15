import { NextRequest, NextResponse } from "next/server";
import { criarClienteSupabaseAdmin } from "@/lib/supabase/admin";
import { buscarCatalogo } from "@/lib/supabase/catalogo";
import { buscarConfiguracao, agendaDoBanco } from "@/lib/supabase/configuracoes";
import { buscarAgendamentos, buscarBloqueios } from "@/lib/supabase/agenda";
import { intervalosSeSobrepoem } from "@/lib/agenda-rules.mjs";

const idsDias = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
function minutos(hora: string) { const [h, m] = hora.split(":").map(Number); return h * 60 + m; }
function protocolo() { const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return `PH10-${Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")}`; }
function respostaReserva(item: Awaited<ReturnType<typeof buscarAgendamentos>>[number]) { return item; }

export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("codigo")?.toUpperCase();
  const whatsapp = request.nextUrl.searchParams.get("whatsapp")?.replace(/\D/g, "");
  if (!codigo || !whatsapp) return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  const reservas = await buscarAgendamentos(criarClienteSupabaseAdmin());
  const reserva = reservas.find((item) => item.codigo === codigo && item.whatsapp === whatsapp);
  return reserva ? NextResponse.json({ reserva: respostaReserva(reserva) }) : NextResponse.json({ erro: "Reserva não encontrada." }, { status: 404 });
}

export async function POST(request: NextRequest) {
  try {
    const corpo = await request.json() as { nome: string; whatsapp: string; itemTipo: "servico" | "combo"; itemId: string; data: string; hora: string };
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)*$/.test(corpo.nome?.trim()) || !/^55219\d{8}$/.test(corpo.whatsapp ?? "")) throw new Error("dados");
    const supabase = criarClienteSupabaseAdmin();
    const [catalogo, configBanco, bloqueios, reservas] = await Promise.all([buscarCatalogo(supabase, true), buscarConfiguracao(supabase), buscarBloqueios(supabase), buscarAgendamentos(supabase)]);
    const item = corpo.itemTipo === "servico" ? catalogo.servicos.find((x) => x.id === corpo.itemId) : catalogo.combos.find((x) => x.id === corpo.itemId);
    if (!item) return NextResponse.json({ erro: "Serviço indisponível." }, { status: 409 });
    const config = agendaDoBanco(configBanco);
    const dia = config.diasFuncionamento.find((x) => x.id === idsDias[new Date(`${corpo.data}T12:00:00`).getDay()]);
    const inicio = minutos(corpo.hora); const fim = inicio + Number(item.duracao);
    const instante = new Date(`${corpo.data}T${corpo.hora}:00-03:00`).getTime();
    const antecedencia = Number(config.configAgenda.antecedenciaMinima) * 3600000;
    const limiteJanela = Date.now() + Number(config.configAgenda.diasParaAgendar) * 86400000;
    const invalido = instante < Date.now() + antecedencia || instante > limiteJanela || !dia?.ativo || inicio < minutos(dia.abertura) || fim > minutos(dia.fechamento) || (dia.temPausa && intervalosSeSobrepoem(inicio, fim, minutos(dia.pausaInicio), minutos(dia.pausaFim))) || bloqueios.some((b) => b.data === corpo.data && intervalosSeSobrepoem(inicio, fim, b.diaInteiro ? 0 : minutos(b.inicio), b.diaInteiro ? 1440 : minutos(b.fim))) || reservas.some((r) => !r.statusManual && r.data === corpo.data && intervalosSeSobrepoem(inicio, fim, minutos(r.hora), minutos(r.hora) + (r.duracaoMinutos ?? 30)));
    if (invalido) return NextResponse.json({ erro: "Horário indisponível." }, { status: 409 });
    const ativaMesmoCliente = reservas.some((r) => !r.statusManual && r.whatsapp === corpo.whatsapp && new Date(`${r.data}T${r.hora}:00-03:00`).getTime() + (r.duracaoMinutos ?? 30) * 60000 > Date.now());
    if (ativaMesmoCliente) return NextResponse.json({ erro: "Este WhatsApp já possui uma reserva ativa." }, { status: 409 });
    const { data: cliente, error: erroCliente } = await supabase.from("clientes").upsert({ nome: corpo.nome.trim(), whatsapp: corpo.whatsapp }, { onConflict: "whatsapp" }).select("id").single();
    if (erroCliente) throw erroCliente;
    const historico = [{ id: crypto.randomUUID(), tipo: "Criada", origem: "Cliente", realizadaEm: new Date().toISOString(), dataNova: corpo.data, horaNova: corpo.hora }];
    const { data: criada, error } = await supabase.from("agendamentos").insert({ protocolo: protocolo(), cliente_id: cliente.id, cliente_nome: corpo.nome.trim(), whatsapp: corpo.whatsapp, item_tipo: corpo.itemTipo, servico_id: corpo.itemTipo === "servico" ? corpo.itemId : null, combo_id: corpo.itemTipo === "combo" ? corpo.itemId : null, item_nome: item.nome, data: corpo.data, hora: corpo.hora, duracao_minutos: Number(item.duracao), valor_centavos: Math.round(item.valor * 100), historico }).select("id").single();
    if (error) throw error;
    const reserva = (await buscarAgendamentos(supabase)).find((x) => x.id === criada.id);
    return NextResponse.json({ reserva }, { status: 201 });
  } catch {
    return NextResponse.json({ erro: "Não foi possível criar a reserva." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const corpo = await request.json() as { codigo: string; whatsapp: string; acao: "cancelar" | "remarcar"; data?: string; hora?: string };
    const supabase = criarClienteSupabaseAdmin();
    const reservas = await buscarAgendamentos(supabase);
    const reserva = reservas.find((x) => x.codigo === corpo.codigo && x.whatsapp === corpo.whatsapp);
    if (!reserva || new Date(`${reserva.data}T${reserva.hora}:00-03:00`).getTime() - Date.now() < 2 * 3600000) return NextResponse.json({ erro: "Alteração não permitida." }, { status: 409 });
    if (corpo.acao === "remarcar") {
      if (!corpo.data || !corpo.hora) return NextResponse.json({ erro: "Novo horário inválido." }, { status: 400 });
      const [configBanco, bloqueios] = await Promise.all([buscarConfiguracao(supabase), buscarBloqueios(supabase)]);
      const config = agendaDoBanco(configBanco);
      const dia = config.diasFuncionamento.find((x) => x.id === idsDias[new Date(`${corpo.data}T12:00:00`).getDay()]);
      const inicio = minutos(corpo.hora); const fim = inicio + (reserva.duracaoMinutos ?? 30);
      const instante = new Date(`${corpo.data}T${corpo.hora}:00-03:00`).getTime();
      const invalido = instante < Date.now() + 2 * 3600000 || !dia?.ativo || inicio < minutos(dia.abertura) || fim > minutos(dia.fechamento) || (dia.temPausa && intervalosSeSobrepoem(inicio, fim, minutos(dia.pausaInicio), minutos(dia.pausaFim))) || bloqueios.some((b) => b.data === corpo.data && intervalosSeSobrepoem(inicio, fim, b.diaInteiro ? 0 : minutos(b.inicio), b.diaInteiro ? 1440 : minutos(b.fim))) || reservas.some((r) => r.id !== reserva.id && !r.statusManual && r.data === corpo.data && intervalosSeSobrepoem(inicio, fim, minutos(r.hora), minutos(r.hora) + (r.duracaoMinutos ?? 30)));
      if (invalido) return NextResponse.json({ erro: "Novo horário indisponível." }, { status: 409 });
    }
    const historico = [...(reserva.historicoAlteracoes ?? []), { id: crypto.randomUUID(), tipo: corpo.acao === "cancelar" ? "Cancelada" : "Remarcada", origem: "Cliente", realizadaEm: new Date().toISOString(), dataAnterior: reserva.data, horaAnterior: reserva.hora, dataNova: corpo.data, horaNova: corpo.hora }];
    const alteracao = corpo.acao === "cancelar" ? { status: "cancelado", historico } : { data: corpo.data, hora: corpo.hora, historico };
    const { error } = await supabase.from("agendamentos").update(alteracao).eq("id", reserva.id);
    if (error) throw error;
    const atualizada = (await buscarAgendamentos(supabase)).find((x) => x.id === reserva.id);
    return NextResponse.json({ reserva: atualizada });
  } catch { return NextResponse.json({ erro: "Não foi possível alterar a reserva." }, { status: 400 }); }
}
