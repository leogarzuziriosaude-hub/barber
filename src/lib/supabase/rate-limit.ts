import "server-only";

import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { chaveSecretaSupabase } from "./env";

type Regra = { limite: number; janelaSegundos: number; bloqueioSegundos: number };

export function ipDaRequisicao(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "ip-desconhecido";
}

export function chaveRateLimit(escopo: string, identificador: string) {
  return createHmac("sha256", chaveSecretaSupabase()).update(`${escopo}:${identificador}`).digest("hex");
}

export async function consumirRateLimit(supabase: SupabaseClient, chave: string, regra: Regra) {
  const { data, error } = await supabase.rpc("consumir_rate_limit", {
    p_chave: chave,
    p_limite: regra.limite,
    p_janela_segundos: regra.janelaSegundos,
    p_bloqueio_segundos: regra.bloqueioSegundos,
  });
  if (error) throw error;
  return data as { permitido: boolean; restantes?: number; tentar_em?: number };
}

export async function limparRateLimit(supabase: SupabaseClient, chave: string) {
  await supabase.rpc("limpar_rate_limit", { p_chave: chave });
}

export function respostaBloqueada(segundos = 900) {
  return Response.json(
    { erro: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
    { status: 429, headers: { "Retry-After": String(Math.max(1, segundos)) } }
  );
}
