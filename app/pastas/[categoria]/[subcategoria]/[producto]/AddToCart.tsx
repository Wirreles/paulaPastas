"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { Minus, Plus, ShoppingBag, Check } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { Producto } from "@/lib/types"

interface AddToCartProps {
    producto: Producto
}

export default function AddToCart({ producto }: AddToCartProps) {
    const [cantidad, setCantidad] = useState(1)
    const [isAdded, setIsAdded] = useState(false)
    const { addItem } = useCart()

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // 🧠 Memoizar cálculo de precio
    const totalPrice = useMemo(() => {
        return (producto.precio * cantidad).toLocaleString("es-AR")
    }, [producto.precio, cantidad])

    // 🧹 Cleanup seguro
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    const handleAddToCart = useCallback(() => {
        if (!producto.disponible || cantidad <= 0) return

        addItem(producto, cantidad)

        setIsAdded(true)
        setCantidad(1)

        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(() => {
            setIsAdded(false)
        }, 2000)
    }, [addItem, producto, cantidad])

    return (
        <div className="space-y-6 pt-6 border-t border-neutral-100">

            {/* Precio */}
            <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                    <span className="text-3xl font-bold text-neutral-900">
                        ${totalPrice}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                        Subtotal (ARS)
                    </span>
                </div>

                {!producto.disponible && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        No disponible
                    </span>
                )}
            </div>

            {/* Controles */}
            <div className="flex flex-col sm:flex-row items-center gap-4">

                {/* Cantidad */}
                <div className="flex items-center bg-neutral-100 rounded-2xl p-1.5 w-full sm:w-auto justify-between">
                    <button
                        onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                        disabled={cantidad <= 1 || !producto.disponible}
                        className="p-2 hover:bg-white rounded-xl transition-all shadow-sm active:scale-90 disabled:opacity-50"
                    >
                        <Minus className="w-5 h-5 text-neutral-600" />
                    </button>

                    <span className="w-12 text-center font-bold text-neutral-900 text-lg">
                        {cantidad}
                    </span>

                    <button
                        onClick={() => setCantidad((prev) => prev + 1)}
                        disabled={!producto.disponible}
                        className="p-2 hover:bg-white rounded-xl transition-all shadow-sm active:scale-90 disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5 text-neutral-600" />
                    </button>
                </div>

                {/* Botón */}
                <button
                    onClick={handleAddToCart}
                    disabled={!producto.disponible || isAdded}
                    className={`flex-1 w-full font-bold py-4 px-8 rounded-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-lg ${isAdded
                            ? "bg-green-600 text-white shadow-green-100"
                            : "bg-primary-600 hover:bg-primary-700 text-white shadow-primary-100"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isAdded ? (
                        <>
                            <Check className="w-5 h-5" />
                            ¡Agregado!
                        </>
                    ) : (
                        <>
                            <ShoppingBag className="w-5 h-5" />
                            {!producto.disponible ? "No Disponible" : "Agregar al pedido"}
                        </>
                    )}
                </button>
            </div>

            {/* Métodos de pago */}
            <div className="flex flex-col items-center sm:items-start gap-3 pt-2 sm:pl-1">
                <span className="text-xs sm:text-sm text-neutral-500 font-medium">
                    Medios de pago disponibles
                </span>

                <div className="flex items-center gap-4 sm:gap-5 md:gap-6 opacity-90">
                    <img src="/payments/visa.svg" alt="Visa" className="h-6 sm:h-7 md:h-8 lg:h-9 w-auto opacity-70 hover:opacity-100 hover:scale-110 transition-all duration-200" />
                    <img src="/payments/mastercard.svg" alt="Mastercard" className="h-6 sm:h-7 md:h-8 lg:h-9 w-auto opacity-70 hover:opacity-100 hover:scale-110 transition-all duration-200" />
                    <img src="/payments/mercadopago.svg" alt="Mercado Pago" className="h-6 sm:h-7 md:h-8 lg:h-9 w-auto opacity-70 hover:opacity-100 hover:scale-110 transition-all duration-200" />
                </div>
            </div>
        </div>
    )
}