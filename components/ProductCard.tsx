"use client"

import Link from "next/link"
import { Eye, Star, Minus, Plus } from "lucide-react"
import type { Producto } from "@/lib/types"
import { useState, useCallback, useMemo, memo } from "react"

import { formatPrice } from "@/lib/utils"
import { getProductUrl } from "@/lib/product-url"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import AddToCartButton from "./AddtoCartButton"

interface ProductCardProps {
  producto: Producto
  baseUrl?: string
  priority?: boolean
}

function ProductCard({ producto, baseUrl, priority = false }: ProductCardProps) {

  const productUrl = baseUrl
    ? `${baseUrl}/${producto.slug}`
    : getProductUrl(producto)

  const [quantity, setQuantity] = useState(1)

  const handleQuantityChange = useCallback((amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount))
  }, [])

  const handleReset = useCallback(() => {
    setQuantity(1)
  }, [])

  const totalPorciones = useMemo(() => {
    return producto.porciones
      ? producto.porciones * quantity
      : null
  }, [producto.porciones, quantity])

  return (
    <article
      itemScope
      itemType="https://schema.org/Product"
      className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group flex flex-col h-full"
    >

      {/* Imagen */}
      <div className="relative h-64">
        <Link
          href={productUrl}
          prefetch={false}
          aria-label={`Ver ${producto.nombre}`}
        >
          <ImageWrapper
            src={producto.imagen}
            alt={`${producto.nombre} - pasta artesanal`}
            fill
            sizes="(max-width: 640px) 100vw,
                   (max-width: 1024px) 50vw,
                   (max-width: 1280px) 33vw,
                   25vw"
            className={`object-cover ${priority ? '' : 'group-hover:scale-105 transition-transform duration-300'}`}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            fetchPriority="auto"
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
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              No Disponible
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-grow">

        <Link
          href={productUrl}
          prefetch={false}
          aria-label={`Ver ${producto.nombre}`}
        >
          <h3
            itemProp="name"
            className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors"
          >
            {producto.nombre}
          </h3>
        </Link>

        <p className="text-neutral-600 mb-4 text-sm line-clamp-4 flex-grow">
          {producto.descripcionAcortada || producto.descripcion}
        </p>

        {/* Precio + cantidad */}
        <div className="flex items-center justify-between mb-4">

          <div>
            <span
              className="text-xl font-bold text-primary-600"
              itemProp="price"
            >
              {formatPrice(producto.precio * quantity)}
            </span>

            {totalPorciones && (
              <span className="text-sm text-neutral-500 ml-2">
                {totalPorciones} porciones
              </span>
            )}
          </div>

          {/* Controles de cantidad */}
          <div className="flex items-center gap-2">

            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              aria-label="Reducir cantidad"
              className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              <Minus className="w-4 h-4 text-neutral-700" />
            </button>

            <span
              className="w-8 text-center font-semibold text-neutral-900"
              aria-live="polite"
            >
              {quantity}
            </span>

            <button
              onClick={() => handleQuantityChange(1)}
              aria-label="Aumentar cantidad"
              className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <Plus className="w-4 h-4 text-neutral-700" />
            </button>

          </div>

        </div>

      </div>

      {/* Botones */}
      <div className="p-4 pt-0 mt-auto">

        <div className="flex gap-2">

          <AddToCartButton
            producto={producto}
            quantity={quantity}
            onAdded={handleReset}
          />

          <Link
            href={productUrl}
            prefetch={false}
            aria-label={`Ver detalles de ${producto.nombre}`}
            className="bg-neutral-900 text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center"
          >
            <Eye className="w-5 h-5" />
          </Link>

        </div>

      </div>

    </article>
  )
}

export default memo(ProductCard)