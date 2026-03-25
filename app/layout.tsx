import type React from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; // Importamos ambas fuentes
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";

// 1. Configuración de fuentes
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair", // Esta es la variable que usa tu globals.css
});

export const metadata: Metadata = {
  metadataBase: new URL("https://paulapastas.com"),
  title: "Paula Pastas - Pastas Artesanales",
  description: "Pastas frescas y salsas caseras hechas con amor y tradición. ¡Pedí online!",
  icons: {
    icon: [
      { url: "/pplog2.png" },
      { url: "/pplog2.png", sizes: "192x192", type: "image/png" }, // El tamaño que optimizamos antes
    ],
    apple: "/pplog2.png",
  },
  alternates: {
    canonical: "/", // Next.js lo gestiona automáticamente con metadataBase
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Agregamos ambas variables de fuente al HTML
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Preconnect solo para los dominios más críticos */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
      </head>

      <body className={`${inter.className} flex flex-col min-h-screen antialiased`}>
        {/* Google Tag Manager (Script principal) */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TRQ7MJL5');`,
          }}
        />

        {/* Scripts de Terceros con carga diferida (Optimiza TBT y LCP) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FCTYS7HER2"
          strategy="lazyOnload"
        />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FCTYS7HER2', { page_path: window.location.pathname });`,
          }}
        />

        <Script
          id="fb-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2255346224965031');
            fbq('track', 'PageView');`,
          }}
        />

        <Script
          id="clarity-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "vva4r0prt3");`,
          }}
        />

        <Providers>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>

        {/* Noscripts al final para no interferir con el renderizado inicial */}
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