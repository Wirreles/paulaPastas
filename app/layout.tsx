import type React from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import Analytics from "@/components/Analytics";

// 1. Optimización de fuentes: Solo cargamos lo estrictamente necesario
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  // preload: true // Next.js lo hace por defecto
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["700"] // Si solo usas negrita para títulos, especifícalo aquí
});

export const metadata: Metadata = {
  metadataBase: new URL("https://paulapastas.com"),
  title: "Paula Pastas - Pastas Artesanales",
  description: "Pastas frescas y salsas caseras hechas con amor y tradición. ¡Pedí online!",
  icons: {
    icon: [
      { url: "/pplog2.webp" },
      { url: "/pplog2.webp", sizes: "192x192", type: "image/webp" },
    ],
    apple: "/pplog2.webp",
  },
  alternates: { canonical: "/" },
  openGraph: {
    url: "https://paulapastas.com",
    siteName: "Paula Pastas",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* DNS Prefetch es más ligero que Preconnect para analíticas que no son críticas para el LCP */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
      </head>

      <body
        className={`${inter.className} flex flex-col min-h-screen antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {/* El Header es lo primero que se pinta. Asegúrate que sus iconos sean SVGs inline 
              y no una librería de fuentes pesada como FontAwesome */}
          <Header />

          <main className="flex-grow">
            {children}
          </main>

          <Footer />
        </Providers>

        {/* 2. Movemos Analytics al final del body para que no compita con el LCP del contenido */}
        <Analytics />

        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TRQ7MJL5"
            height="0" width="0" style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      </body>
    </html>
  );
}