import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { AuthProvider } from "@/lib/auth-context"
import { ToastProvider } from "@/lib/toast-context"
import { CartProvider } from "@/lib/cart-context" // Importar CartProvider

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Comida Casera - Pastas Artesanales",
  description: "Pastas frescas y salsas caseras hechas con amor y tradición. ¡Pedí online!",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              {" "}
              {/* Envolver con CartProvider */}
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
