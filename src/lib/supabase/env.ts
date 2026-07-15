function exigir(nome: string, valor: string | undefined) {
  if (!valor) throw new Error(`Variável de ambiente ausente: ${nome}`);
  return valor;
}

export function ambientePublicoSupabase() {
  return {
    url: exigir("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKey: exigir("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  };
}

export function chaveSecretaSupabase() {
  return exigir("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);
}
