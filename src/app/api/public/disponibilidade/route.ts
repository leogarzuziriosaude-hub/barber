import { NextResponse } from "next/server";
import { criarClienteSupabaseAdmin } from "@/lib/supabase/admin";
import { buscarAgendamentos, buscarBloqueios } from "@/lib/supabase/agenda";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = criarClienteSupabaseAdmin();
    const [agendamentos, bloqueios] = await Promise.all([buscarAgendamentos(supabase), buscarBloqueios(supabase)]);
    return NextResponse.json({
      agendamentos: agendamentos.filter((item) => !item.statusManual).map(({ id, data, hora, duracaoMinutos }) => ({ id, data, hora, duracaoMinutos })),
      bloqueios,
    });
  } catch {
    return NextResponse.json({ erro: "Disponibilidade indisponível." }, { status: 503 });
  }
}
