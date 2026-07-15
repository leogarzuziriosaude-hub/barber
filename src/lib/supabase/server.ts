import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ambientePublicoSupabase } from "./env";

export async function criarClienteSupabaseServer() {
  const cookieStore = await cookies();
  const { url, publishableKey } = ambientePublicoSupabase();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesParaSalvar) {
        try {
          cookiesParaSalvar.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components não podem gravar cookies; o proxy de autenticação
          // será responsável por atualizar a sessão quando estiver configurado.
        }
      },
    },
  });
}
