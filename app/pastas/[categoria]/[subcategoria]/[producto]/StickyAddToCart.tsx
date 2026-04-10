"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Minus, Plus, ShoppingBag, Check } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { Producto } from "@/lib/types"

export default function StickyAddToCart({ producto }: { producto: Producto }) {
    const { addItem } = useCart()

    const [cantidad, setCantidad] = useState(1)
    const [isAdded, setIsAdded] = useState(false)

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // 🧠 Memo precio
    const totalPrice = useMemo(() => {
        return (producto.precio * cantidad).toLocaleString("es-AR")
    }, [producto.precio, cantidad])

    // 🧹 Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    const handleAdd = useCallback(() => {
        if (!producto.disponible) return

        addItem(producto, cantidad)
        setIsAdded(true)

        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(() => {
            setIsAdded(false)
        }, 2000)
    }, [addItem, producto, cantidad])

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg lg:hidden">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">

                {/* Cantidad */}
                <div className="flex items-center bg-neutral-100 rounded-xl p-1">
                    <button
                        onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                        disabled={cantidad <= 1}
                        className="p-2 rounded-lg hover:bg-white transition active:scale-90 disabled:opacity-50"
                    >
                        <Minus className="w-4 h-4 text-neutral-600" />
                    </button>

                    <span className="w-8 text-center font-bold text-neutral-900">
                        {cantidad}
                    </span>

                    <button
                        onClick={() => setCantidad((prev) => prev + 1)}
                        className="p-2 rounded-lg hover:bg-white transition active:scale-90"
                    >
                        <Plus className="w-4 h-4 text-neutral-600" />
                    </button>
                </div>

                {/* Precio */}
                <div className="flex flex-col min-w-[80px]">
                    <span className="text-sm font-bold text-neutral-900">
                        ${totalPrice}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                        Total
                    </span>
                </div>

                {/* Botón */}
                <button
                    onClick={handleAdd}
                    disabled={!producto.disponible || isAdded}
                    className={`flex-1 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${isAdded
                            ? "bg-green-600 text-white"
                            : "bg-primary-600 hover:bg-primary-700 text-white"
                        } disabled:opacity-50`}
                >
                    {isAdded ? (
                        <>
                            <Check className="w-4 h-4" />
                            Agregado
                        </>
                    ) : (
                        <>
                            <ShoppingBag className="w-4 h-4" />
                            Agregar
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}