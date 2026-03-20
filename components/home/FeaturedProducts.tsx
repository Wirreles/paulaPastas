// ❌ IMPORTANTE: ya NO es client component
// ❌ eliminar "use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import type { Producto } from "@/lib/types"
import ProductCard from "@/components/ProductCard"

interface FeaturedProductsProps {
  productos: Producto[]
}

export default function FeaturedProducts({ productos }: FeaturedProductsProps) {

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER SEO */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Pastas frescas recientemente elaboradas
          </h2>

          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Descubrí nuestras pastas más populares, elaboradas con ingredientes frescos y recetas tradicionales.
          </p>
        </div>

        {/* GRID */}
        {productos.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {productos.map((producto) => {
              if (!producto.id) return null

              return (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  baseUrl={`/pastas/${producto.categoria}/${producto.subcategoria}`}
                />
              )
            })}

          </div>

        ) : (

          <div className="text-center py-12">
            <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🍝</span>
            </div>

            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Próximamente
            </h3>

            <p className="text-neutral-600">
              Estamos preparando deliciosos productos para esta categoría
            </p>
          </div>

        )}

        {/* CTA */}
        <div className="text-center mt-12">

          <Link
            href="/pastas"
            className="inline-flex items-center px-6 py-3 border border-neutral-900 text-neutral-900 font-semibold rounded-lg hover:bg-neutral-900 hover:text-white transition-colors w-full sm:max-w-xs mx-auto"
          >
            Ver Todas las Pastas
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>

        </div>

      </div>
    </section>
  )
}