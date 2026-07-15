import BarberSidebar from "@/components/BarberSidebar";

export default function InicioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BarberSidebar />
      <div className="w-[100dvw] max-w-[100dvw] min-w-0 overflow-x-clip lg:pl-72">{children}</div>
    </>
  );
}
