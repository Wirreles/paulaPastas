"use client" // Asegurarse de que es un Client Component

import Image from "next/image"
import Link from "next/link"
import { Eye, Star, Minus, Plus } from "lucide-react" // Cambiar ShoppingBag por Eye
import type { Producto } from "@/lib/types"
import { useState } from "react" // Importar useState
import { useCart } from "@/lib/cart-context" // Importar useCart
import { formatPrice } from "@/lib/utils" // Importar formatPrice

interface ProductCardProps {
  producto: Producto
  baseUrl?: string // Prop opcional para baseUrl
}

export default function ProductCard({ producto, baseUrl }: ProductCardProps) {
  // Usar baseUrl si se proporciona, sino construir la URL estándar
  const productUrl = baseUrl 
    ? `${baseUrl}/${producto.slug}`
    : `/pastas/${producto.categoria}/${producto.subcategoria}/${producto.slug}`
  
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
    <article className="bg-white rounded-lg shadow-lg overflow-hidden hover-lift group flex flex-col h-full">
      {/* Imagen más grande como en el home */}
      <div className="relative h-64">
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

      {/* Contenido de la card con flex-grow para ocupar el espacio disponible */}
      <div className="p-4 flex flex-col flex-grow">
        <Link href={productUrl}>
          <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
            {producto.nombre}
          </h3>
        </Link>

        <p className="text-neutral-600 mb-4 text-sm line-clamp-4 flex-grow">
          {producto.descripcionAcortada || producto.descripcion}
        </p>

        {/* Precio dinámico y selector de cantidad en la misma línea */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xl font-bold text-primary-600">{formatPrice(producto.precio * quantity)}</span>
            {producto.porciones && (
              <span className="text-sm text-neutral-500 ml-2">{producto.porciones} porciones</span>
            )}
          </div>

          {/* Selector de cantidad */}
          <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Botones siempre al fondo de la card */}
      <div className="p-4 pt-0 mt-auto">
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-primary-600 text-white text-center px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            disabled={!producto.disponible}
          >
            Agregar al carro
          </button>
          <Link
            href={productUrl}
            className="bg-neutral-900 text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center"
            title="Ver detalles"
          >
            <Eye className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
