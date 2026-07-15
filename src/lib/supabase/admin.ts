import "server-only";

import { createClient } from "@supabase/supabase-js";
import { ambientePublicoSupabase, chaveSecretaSupabase } from "./env";

export function criarClienteSupabaseAdmin() {
  const { url } = ambientePublicoSupabase();
  return createClient(url, chaveSecretaSupabase(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
