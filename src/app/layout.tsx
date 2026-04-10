import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { FinanceProvider } from "@/context/FinanceContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Futsal Manager Pro | Gerenciamento de Partidas em Tempo Real",
  description:
    "Plataforma inteligente para organização de partidas de futsal. Formação de times, cronômetro, placar em tempo real, estatísticas e animações.",
  keywords: ["futsal", "manager", "esporte", "gerenciamento", "placar", "times"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="relative z-[1] min-h-full flex flex-col" suppressHydrationWarning>
        <FinanceProvider>
          {children}
        </FinanceProvider>
      </body>
    </html>
  );
}
