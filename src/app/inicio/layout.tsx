import BarberSidebar from "@/components/BarberSidebar";

export default function InicioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BarberSidebar />
      <div className="lg:pl-72">{children}</div>
    </>
  );
}
