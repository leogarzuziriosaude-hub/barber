"use client";

import { createBrowserClient } from "@supabase/ssr";
import { ambientePublicoSupabase } from "./env";

export function criarClienteSupabase() {
  const { url, publishableKey } = ambientePublicoSupabase();
  return createBrowserClient(url, publishableKey);
}
