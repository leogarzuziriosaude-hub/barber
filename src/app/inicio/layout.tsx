import BarberSidebar from "@/components/BarberSidebar";
import { criarClienteSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function InicioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await criarClienteSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: configuracao } = await supabase
    .from("configuracoes")
    .select("id")
    .eq("id", 1)
    .maybeSingle();

  if (!configuracao) redirect("/login");

  return (
    <>
      <BarberSidebar />
      <div className="w-[100dvw] max-w-[100dvw] min-w-0 overflow-x-clip lg:pl-72">{children}</div>
    </>
  );
}
