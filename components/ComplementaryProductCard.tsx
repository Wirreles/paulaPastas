"use client"

import { useState } from "react"
import Link from "next/link"
import { Minus, Plus, Eye } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/utils"
import { Producto } from "@/lib/types"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import { ProductPlaceholder } from "@/components/ui/ImagePlaceholder"

interface ComplementaryProductCardProps {
  producto: Producto
}

export default function ComplementaryProductCard({ producto }: ComplementaryProductCardProps) {
  const productUrl = `/pastas/${producto.categoria}/${producto.subcategoria}/${producto.slug}`
  const { addItem } = useCart() // Usar el hook useCart
  const [quantity, setQuantity] = useState(1) // Estado para la cantidad

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount)) // Cantidad mínima de 1
  }

  const handleAddToCart = () => {
    addItem(producto, quantity) // Usar la cantidad seleccionada
    setQuantity(1) // Resetear la cantidad a 1 después de agregar al carrito
  }

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      {/* Imagen más grande como en el home */}
      <div className="relative h-48 w-full">
        <Link href={productUrl}>
          <ImageWrapper
            src={producto.imagen || "/placeholder.svg"}
            alt={`${producto.nombre} caseros artesanales`}
            fill
            className="object-cover"
            fallback="/placeholder.svg?height=192&width=400&text=Producto"
            placeholder={<ProductPlaceholder className="object-cover" />}
          />
        </Link>
        {!producto.disponible && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">No Disponible</span>
          </div>
        )}
      </div>
      
      {/* Contenido de la card con flex-grow para ocupar el espacio disponible */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={productUrl}>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2 hover:text-primary-600 transition-colors">
            {producto.nombre}
          </h3>
        </Link>
        
        <p className="text-sm text-neutral-600 mb-3 line-clamp-3 flex-grow">
          {producto.descripcionAcortada || producto.descripcion}
        </p>

        {/* Precio dinámico y selector de cantidad en la misma línea */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-primary-600">{formatPrice(producto.precio * quantity)}</span>
            {producto.porciones && (
              <span className="text-xs text-neutral-500 ml-2">{producto.porciones} porciones</span>
            )}
          </div>

          {/* Selector de cantidad */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="p-1 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
              disabled={quantity <= 1}
            >
              <Minus className="w-3 h-3 text-neutral-700" />
            </button>
            <span className="text-sm font-semibold text-neutral-900 w-6 text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="p-1 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <Plus className="w-3 h-3 text-neutral-700" />
            </button>
          </div>
        </div>

        {/* Botones siempre al fondo de la card */}
        <div className="mt-auto flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-primary-600 text-white text-center px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
            disabled={!producto.disponible}
          >
            Agregar al carro
          </button>
          <Link
            href={productUrl}
            className="bg-neutral-900 text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
