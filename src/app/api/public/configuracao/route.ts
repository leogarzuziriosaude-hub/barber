import { NextResponse } from "next/server";
import { criarClienteSupabaseAdmin } from "@/lib/supabase/admin";
import { agendaDoBanco, buscarConfiguracao, perfilDoBanco } from "@/lib/supabase/configuracoes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const configuracao = await buscarConfiguracao(criarClienteSupabaseAdmin());
    return NextResponse.json({
      perfil: perfilDoBanco(configuracao),
      configuracao: agendaDoBanco(configuracao),
    });
  } catch {
    return NextResponse.json({ erro: "Configuração indisponível." }, { status: 503 });
  }
}
