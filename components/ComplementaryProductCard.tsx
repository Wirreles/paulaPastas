"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import type { Producto } from "@/lib/types"
import { useCart } from "@/lib/cart-context" // Importar useCart
import { formatPrice } from "@/lib/utils" // Importar formatPrice

interface ComplementaryProductCardProps {
  producto: Producto
}

export default function ComplementaryProductCard({ producto }: ComplementaryProductCardProps) {
  const productUrl = `/pastas/${producto.categoria}/${producto.subcategoria}/${producto.slug}`
  const { addItem } = useCart() // Usar el hook useCart

  const handleAddToCart = () => {
    addItem(producto, 1) // Añadir 1 unidad por defecto
  }

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="relative h-32 w-full">
        <Link href={productUrl}>
          <Image
            src={producto.imagen || "/placeholder.svg"}
            alt={`${producto.nombre} caseros artesanales`}
            fill
            className="object-cover"
          />
        </Link>
        {!producto.disponible && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">No Disponible</span>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <Link href={productUrl}>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1 hover:text-primary-600 transition-colors">
            {producto.nombre}
          </h3>
        </Link>
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{producto.descripcion}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">{formatPrice(producto.precio)}</span>
          <button
            onClick={handleAddToCart}
            className="bg-neutral-900 text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors"
            disabled={!producto.disponible}
            title="Agregar al carrito"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </article>
  )
}
