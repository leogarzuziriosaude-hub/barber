import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ambientePublicoSupabase } from "./env";

export async function atualizarSessao(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = ambientePublicoSupabase();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesParaSalvar) {
        cookiesParaSalvar.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesParaSalvar.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/inicio")) {
    const urlLogin = request.nextUrl.clone();
    urlLogin.pathname = "/login";
    return NextResponse.redirect(urlLogin);
  }

  return response;
}
