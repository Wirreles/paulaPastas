import type React from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import Analytics from "@/components/Analytics"; // Importamos el nuevo componente

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL("https://paulapastas.com"),
  title: "Paula Pastas - Pastas Artesanales",
  description: "Pastas frescas y salsas caseras hechas con amor y tradición. ¡Pedí online!",
  icons: {
    icon: [
      { url: "/pplog2.png" },
      { url: "/pplog2.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/pplog2.png",
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
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {/* CORRECCIÓN: crossorigin -> crossOrigin */}
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
      </head>

      <body
        className={`${inter.className} flex flex-col min-h-screen antialiased`}
        suppressHydrationWarning
      >
        {/* Los scripts ahora se cargan de forma diferida mediante este componente */}
        <Analytics />

        <Providers>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>

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