import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LegacyStorageCleanup from "@/components/LegacyStorageCleanup";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PH10 Barbearia",
  description: "Gestão e agendamento da Barbearia PH10",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#24211e",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full"><LegacyStorageCleanup />{children}</body>
    </html>
  );
}
