import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "renuncIA — Certificado de Obsolescencia Humana",
  description:
    "Descubre qué tan rápido vas a ser reemplazado por la IA. Análisis brutal y sarcástico de tu perfil de LinkedIn.",
  openGraph: {
    title: "renuncIA — ¿Cuánto tiempo te queda?",
    description:
      "La IA ya revisó tu perfil de LinkedIn. Los resultados son... esperados.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "renuncIA — Certificado de Obsolescencia Humana",
    description: "La IA ya sabe que eres reemplazable. Tú aún no.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${jetbrainsMono.variable} ${inter.variable}`}>
      <body className="antialiased bg-slate-950 text-slate-100 font-sans">
        {/* Ambient scan line */}
        <div className="scanline" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
