import type React from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import dynamic from "next/dynamic";

// 🔥 Analytics lazy → NO bloquea LCP
const Analytics = dynamic(() => import("@/components/Analytics"), {
  ssr: false,
});

// 🔥 Fonts optimizadas
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://paulapastas.com"),
  title: {
    default: "Paula Pastas - Pastas Artesanales",
    template: "%s | Paula Pastas",
  },
  description:
    "Pastas frescas y salsas caseras hechas con amor y tradición. ¡Pedí online!",
  icons: {
    icon: [
      { url: "/pplog2.webp", sizes: "any" },
      { url: "/pplog2.webp", sizes: "192x192", type: "image/webp" },
    ],
    apple: "/pplog2.webp",
  },
  openGraph: {
    url: "https://paulapastas.com",
    siteName: "Paula Pastas",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* 🔥 PRECONNECT BIEN HECHO */}
        <link
          rel="preconnect"
          href="https://firestore.googleapis.com"
          crossOrigin=""
        />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />

        {/* 🔸 terceros no críticos */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
      </head>

      <body className={`${inter.className} flex flex-col min-h-screen antialiased`}>
        <Providers>
          <Header />

          <main className="flex-grow">{children}</main>

          <Footer />
        </Providers>

        {/* 🔥 Analytics lazy */}
        <Analytics />

        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TRQ7MJL5"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      </body>
    </html>
  );
}