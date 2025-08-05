"use client" // Asegurarse de que es un Client Component

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Star, Minus, Plus } from "lucide-react" // Importar Minus y Plus
import type { Producto } from "@/lib/types"
import { useState } from "react" // Importar useState
import { useCart } from "@/lib/cart-context" // Importar useCart
import { formatPrice } from "@/lib/utils" // Importar formatPrice

interface ProductCardProps {
  producto: Producto
}

export default function ProductCard({ producto }: ProductCardProps) {
  const productUrl = `/pastas/${producto.categoria}/${producto.subcategoria}/${producto.slug}`
  const [quantity, setQuantity] = useState(1) // Estado para la cantidad
  const { addItem } = useCart() // Usar el hook useCart

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount)) // Cantidad mínima de 1
  }

  const handleAddToCart = () => {
    addItem(producto, quantity) // Usar la función addItem del contexto
    setQuantity(1) // Resetear la cantidad a 1 después de agregar al carrito
  }

  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden hover-lift group">
      <div className="relative h-48">
        <Link href={productUrl}>
          <Image
            src={producto.imagen || "/placeholder.svg"}
            alt={`${producto.nombre} caseros artesanales`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {producto.destacado && (
          <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
            <Star className="w-3 h-3 mr-1" />
            Destacado
          </div>
        )}
        {!producto.disponible && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">No Disponible</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-2">
          <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
            {producto.categoria.replace("-", " ")} • {producto.subcategoria}
          </span>
        </div>

        <Link href={productUrl}>
          <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
            {producto.nombre}
          </h3>
        </Link>

        <p className="text-neutral-600 mb-4 line-clamp-2">{producto.descripcion}</p>

        {producto.ingredientes.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-neutral-500 mb-1">Ingredientes principales:</p>
            <p className="text-sm text-neutral-600">
              {producto.ingredientes.slice(0, 3).join(", ")}
              {producto.ingredientes.length > 3 && "..."}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-primary-600">{formatPrice(producto.precio)}</span>
            {producto.porciones && (
              <span className="text-sm text-neutral-500 ml-2">{producto.porciones} porciones</span>
            )}
          </div>

          {producto.tiempoPreparacion && (
            <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
              {producto.tiempoPreparacion}
            </span>
          )}
        </div>

        {/* Selector de cantidad */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4 text-neutral-700" />
          </button>
          <span className="text-lg font-semibold text-neutral-900 w-8 text-center">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-neutral-700" />
          </button>
        </div>

        <div className="flex gap-2">
          <Link
            href={productUrl}
            className="flex-1 bg-primary-600 text-white text-center px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Ver Detalles
          </Link>
          <button
            onClick={handleAddToCart} // Usar el handler para agregar al carrito
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
