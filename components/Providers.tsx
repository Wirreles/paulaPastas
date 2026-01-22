"use client"

import React from "react"
import dynamic from "next/dynamic"
import { AuthProvider } from "@/lib/auth-context"
import { ToastProvider } from "@/lib/toast-context"
import { CartProvider } from "@/lib/cart-context"

// Lazy load del CartSidebar solo en el cliente
const CartSidebar = dynamic(() => import("@/components/CartSidebar"), {
    ssr: false,
})

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ToastProvider>
                <CartProvider>
                    {children}
                    <CartSidebar />
                </CartProvider>
            </ToastProvider>
        </AuthProvider>
    )
}
