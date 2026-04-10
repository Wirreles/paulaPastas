// AddToCartButton.tsx
"use client"

import { useCart } from "@/lib/cart-context"
import type { Producto } from "@/lib/types"
import { useCallback } from "react"

export default function AddToCartButton({
  producto,
  quantity,
  onAdded
}: {
  producto: Producto
  quantity: number
  onAdded?: () => void
}) {
  const { addItem } = useCart()

  const handleClick = useCallback(() => {
    addItem(producto, quantity)
    onAdded?.()
  }, [addItem, producto, quantity, onAdded])

  return (
    <button
      onClick={handleClick}
      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
      disabled={!producto.disponible}
    >
      Agregar al carro
    </button>
  )
}