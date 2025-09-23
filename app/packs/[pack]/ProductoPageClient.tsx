"use client" // Marcar como Client Component para el carrusel y acordeones

import { notFound } from "next/navigation"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import { ProductPlaceholder } from "@/components/ui/ImagePlaceholder"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  Users,
  ShoppingBag,
  Star,
  Leaf,
  Award,
  Snowflake,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import ProductCard from "@/components/ProductCard"
import ComplementaryProductCard from "@/components/ComplementaryProductCard"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { FirebaseService } from "@/lib/firebase-service"
import ReviewForm from "@/components/ReviewForm"
import type { Review as ReviewType } from "@/lib/types"
import { useCart } from "@/lib/cart-context"
import { Minus, Plus } from "lucide-react"

interface Faq {
  question: string
  answer: string
}

// FAQs específicas para packs
const faqs: Faq[] = [
  {
    question: "¿Cuántas porciones rinde cada pack?",
    answer: "Cada pack está diseñado para diferentes cantidades de personas. El Pack Clásico rinde 4-6 porciones, el Romántico para 2 personas, el Familiar para 6-8 personas y el Gourmet para 4 personas.",
  },
  {
    question: "¿Hacen envíos a mi zona?",
    answer: "Realizamos envíos a Rosario, Funes, Fisherton, Villa Gobernador Gálvez, Alvear y zonas cercanas. Si tenés dudas sobre tu barrio, contactanos por WhatsApp.",
  },
  {
    question: "¿Cuánto duran los packs en el freezer?",
    answer: "Todos nuestros packs duran hasta 30 días en el freezer manteniendo su calidad y sabor. Te recomendamos consumirlos dentro de este plazo.",
  },
  {
    question: "¿Puedo personalizar un pack?",
    answer: "¡Por supuesto! Podés crear tu pack personalizado eligiendo tus pastas y salsas favoritas. Contactanos por WhatsApp para armar tu combo ideal.",
  },
]

interface Producto {
  id: string
  nombre: string
  descripcion: string
  imagen: string
  precio: number
  disponible: boolean
  porciones?: number
  ingredientes?: string[]
  destacado?: boolean
  categoria: string
  subcategoria?: string
  slug: string
  seoTitle?: string
  seoDescription?: string
  descripcionAcortada?: string
  seoKeywords?: string[]
  // Nuevas secciones dinámicas para productos
  comoPreparar?: {
    titulo: string
    texto: string
  }
  historiaPlato?: {
    titulo: string
    texto: string
  }
  preguntasFrecuentes?: {
    pregunta: string
    respuesta: string
  }[]
}

interface ProductoPageClientProps {
  categoria: string
  subcategoria: string
  productoSlug: string
  producto: Producto | null
  productosRelacionados: Producto[]
  productosComplementarios: Producto[]
}

export default function ProductoPageClient({
  categoria,
  subcategoria,
  productoSlug,
  producto,
  productosRelacionados,
  productosComplementarios,
}: ProductoPageClientProps) {
  if (!producto) {
    notFound()
  }

  // Estado para el carrito
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  // Funciones del carrito
  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }, [])

  const handleAddToCart = useCallback(() => {
    if (quantity > 0 && producto.disponible) {
      addItem(producto, quantity)
      setQuantity(1) // Resetear cantidad después de agregar
    }
  }, [addItem, producto, quantity])

  const formatPrice = useCallback((price: number) => {
    return price.toLocaleString('es-AR')
  }, [])

  // JSON-LD para datos estructurados del producto
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion,
    image: producto.imagen,
    brand: {
      "@type": "Brand",
      name: "Paula Pastas",
    },
    offers: {
      "@type": "Offer",
      price: producto.precio,
      priceCurrency: "ARS",
      availability: producto.disponible ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Paula Pastas",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: "https://paulapastas.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Packs",
          item: "https://paulapastas.com/pack-raviolada",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: producto.nombre,
          item: `https://paulapastas.com/packs/${productoSlug}`,
        },
      ],
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-neutral-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-neutral-500 hover:text-primary-600">
                Inicio
              </Link>
              <span className="text-neutral-400">/</span>
              <Link href="/pack-raviolada" className="text-neutral-500 hover:text-primary-600">
                Packs
              </Link>
              <span className="text-neutral-400">/</span>
              <span className="text-neutral-900 font-medium">{producto.nombre}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/pack-raviolada"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Packs
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 1. Encabezado del producto */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <ImageWrapper
                  src={producto.imagen || "/placeholder.svg"}
                  alt={`${producto.nombre} caseros artesanales`}
                  fill
                  className="object-cover"
                  priority={true}
                  fallback="/placeholder.svg?height=400&width=400&text=Pack"
                  placeholder={<ProductPlaceholder className="object-cover" />}
                />
              </div>
              {producto.destacado && (
                <div className="absolute top-4 left-4 bg-primary-600 text-white px-4 py-2 rounded-full font-semibold flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Destacado
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-neutral-900 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Pack
              </div>
            </div>

            {/* Información */}
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                  packs • combo
                </span>
                <h1 className="font-display text-4xl font-bold text-neutral-900 mt-2">{producto.nombre}</h1>
              </div>

              <p className="text-lg text-neutral-600 leading-relaxed whitespace-pre-line">{producto.descripcion}</p>
              
              {producto.descripcionAcortada && (
                <p className="text-base text-neutral-500 leading-relaxed whitespace-pre-line italic">
                  {producto.descripcionAcortada}
                </p>
              )}

              {/* Precio y detalles */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-primary-600">${formatPrice(producto.precio * quantity)}</span>
                    {producto.porciones && (
                      <div className="text-sm text-neutral-500 mt-1">
                        <Users className="w-4 h-4 inline mr-1" />
                        {producto.porciones} porciones
                      </div>
                    )}
                  </div>
                  {!producto.disponible && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      No disponible
                    </span>
                  )}
                </div>

                {/* Selector de cantidad */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4 text-neutral-700" />
                  </button>
                  <span className="text-xl font-semibold text-neutral-900 w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-neutral-700" />
                  </button>
                </div>
              </div>

              {/* Botón de compra */}
              <button
                onClick={handleAddToCart}
                disabled={!producto.disponible}
                className="w-full bg-primary-600 text-white py-4 rounded-full font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {producto.disponible ? "Agregar al Carrito" : "No Disponible"}
              </button>
            </div>
          </div>

          {/* 2. ✅ Sección: "Complementalo con" */}
          {productosComplementarios.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-3xl font-bold text-neutral-900 mb-8 text-center">Complementalo con</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {productosComplementarios.map((complemento) => (
                  <ComplementaryProductCard key={complemento.id} producto={complemento} />
                ))}
              </div>
            </section>
          )}

          {/* 3. ✅ Acordeones: Ingredientes y Envío */}
          <section className={`mt-16 grid gap-8 ${producto.ingredientes && producto.ingredientes.length > 0 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Ingredientes - Solo mostrar si el producto tiene ingredientes */}
            {producto.ingredientes && producto.ingredientes.length > 0 && (
              <details
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer group"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                <summary className="flex justify-between items-center font-bold text-neutral-900 text-xl">
                  Ingredientes
                  <ChevronRight className="w-6 h-6 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                </summary>
                <div className="mt-4 text-neutral-700 leading-relaxed">
                  <ul className="list-disc list-inside space-y-1">
                    {producto.ingredientes.map((ingrediente, index) => (
                      <li key={index}>{ingrediente}</li>
                    ))}
                  </ul>
                </div>
              </details>
            )}

            {/* Envío */}
            <details
              className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer group"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              <summary className="flex justify-between items-center font-bold text-neutral-900 text-xl">
                Envío y Conservación
                <ChevronRight className="w-6 h-6 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                </summary>
              <div className="mt-4 text-neutral-700 leading-relaxed">
                <p className="mb-2">
                  Realizamos envíos a Rosario, Funes, Fisherton, Villa Gobernador Gálvez, Alvear y zonas cercanas.
                  Consulta nuestra sección de{" "}
                  <Link href="/delivery" className="text-primary-600 hover:underline">
                    Delivery
                  </Link>{" "}
                  para más detalles sobre tiempos y costos de entrega en tu zona.
                </p>
                <p>
                  Nuestros packs se entregan congelados y se pueden conservar cocidos en la heladera por 2-3 días o mantener congelados por 2 meses para mantener su frescura y calidad.
                </p>
              </div>
            </details>
          </section>

          {/* 4. ✅ Descripción del producto */}
          <section className="mt-16 bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-neutral-900 mb-4">
              {producto.historiaPlato?.titulo || "Un pack con historia, cocinado a fuego lento."}
            </h2>
            <p className="text-lg text-neutral-700 leading-relaxed mb-8 whitespace-pre-line">
              {producto.historiaPlato?.texto || producto.descripcion}
            </p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-neutral-700">
              <div className="flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-primary-600" />
                <span>Hecho en pequeños lotes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary-600" />
                <span>Sin aditivos</span>
              </div>
              <div className="flex items-center space-x-2">
                <Snowflake className="w-5 h-5 text-primary-600" />
                <span>Congelados para conservar frescura</span>
              </div>
            </div>
          </section>

          {/* 5. ✅ Sección: "¿Cómo prepararlos?" */}
          {producto.comoPreparar && (
            <section className="mt-16 bg-primary-50 rounded-2xl shadow-lg p-8 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
                {producto.comoPreparar.titulo}
              </h2>
              <p className="text-lg text-neutral-700 leading-relaxed max-w-4xl mx-auto whitespace-pre-line">
                {producto.comoPreparar.texto}
              </p>
            </section>
          )}

          {/* 6. ✅ NUEVA SECCIÓN: "¿Por qué nuestros packs son diferentes?" */}
          <section className="mt-16 bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
              ¿Por qué nuestros packs son diferentes?
            </h2>
            <div className="text-lg text-neutral-700 leading-relaxed max-w-4xl mx-auto space-y-6 text-left">
              <p>
                Porque no se trata solo de pasta.
              </p>
              <p>
                Cocinamos a fuego lento los rellenos como si fueran el plato principal: ossobuco braseado, carré glaseado, espinaca cremosa con crocante de nuez.
              </p>
              <p>
                Cada pack está elaborado artesanalmente en Rosario, con sémola seleccionada y sin conservantes.
              </p>
              <p>
                Y lo mejor: en menos de 10 minutos, tenes un plato que podrías servir en un restaurante... pero en tu casa.
              </p>
            </div>
          </section>

          {/* 7. ✅ Sección: Preguntas Frecuentes (Acordeón) */}
          <section className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-lg text-neutral-600">
                Resolvemos las dudas más comunes sobre nuestros packs artesanales y el proceso de compra.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              {producto.preguntasFrecuentes && producto.preguntasFrecuentes.length > 0 ? (
                producto.preguntasFrecuentes.map((faq, index) => (
                  <details
                    key={index}
                    className="bg-neutral-50 rounded-lg shadow-sm p-5 cursor-pointer group"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    <summary className="flex justify-between items-center font-bold text-neutral-900 text-lg">
                      {faq.pregunta}
                      <ChevronRight className="w-5 h-5 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                    </summary>
                    <div className="mt-4 text-neutral-700 leading-relaxed whitespace-pre-line">{faq.respuesta}</div>
                  </details>
                ))
              ) : (
                // Mostrar FAQs estáticas si no hay dinámicas
                faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="bg-neutral-50 rounded-lg shadow-sm p-5 cursor-pointer group"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    <summary className="flex justify-between items-center font-bold text-neutral-900 text-lg">
                      {faq.question}
                      <ChevronRight className="w-5 h-5 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                    </summary>
                    <div className="mt-4 text-neutral-700 leading-relaxed">{faq.answer}</div>
                  </details>
                ))
              )}
            </div>
          </section>

          {/* 8. ✅ Sección: Otros productos recomendados */}
          {productosRelacionados.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-3xl font-bold text-neutral-900 mb-8 text-center">
                Otros packs que te pueden gustar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {productosRelacionados.map((productoRel) => (
                  <ProductCard key={productoRel.id} producto={productoRel} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
