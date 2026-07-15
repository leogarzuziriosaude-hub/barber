import { NextResponse } from "next/server";
import { criarClienteSupabaseAdmin } from "@/lib/supabase/admin";
import { buscarCatalogo } from "@/lib/supabase/catalogo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await buscarCatalogo(criarClienteSupabaseAdmin(), true));
  } catch {
    return NextResponse.json({ erro: "Catálogo indisponível." }, { status: 503 });
  }
}
