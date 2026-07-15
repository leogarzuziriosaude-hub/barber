import BarberSidebar from "@/components/BarberSidebar";

export default function InicioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BarberSidebar />
      <div className="w-full min-w-0 overflow-x-clip lg:pl-72">{children}</div>
    </>
  );
}
