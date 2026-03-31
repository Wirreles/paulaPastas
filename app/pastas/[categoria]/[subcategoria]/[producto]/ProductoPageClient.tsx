"use client" // Marcar como Client Component para el carrusel y acordeones

import { notFound } from "next/navigation"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import Link from "next/link"
import {
  ArrowLeft,
  Users,
  ShoppingBag,
  Star,
  Leaf,
  Award,
  Snowflake,
  ChevronRight,
  Minus,
  Plus
} from "lucide-react"
import ProductCard from "@/components/ProductCard"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { FirebaseService } from "@/lib/firebase-service"
import dynamic from 'next/dynamic'


const ReviewsSection = dynamic(() => import('./ReviewsSection'), {
  ssr: false, // Las reviews dependen de Firebase en el cliente
  loading: () => <div className="mt-16 h-96 animate-pulse bg-neutral-100 rounded-3xl" />
});

import Script from 'next/script';
import type { Review as ReviewType, Producto } from "@/lib/types"
import { getProductCanonicalUrl, getCategoryUrl, getSubcategoryUrl } from "@/lib/product-url"
import { useCart } from "@/lib/cart-context"

// Usar la interfaz Review de types.ts en lugar de la local
const imageSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px";

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

  // Estadísticas de reviews aprobadas
  const [reviewData, setReviewData] = useState<{
    avg: number
    count: number
    reviews: ReviewType[]
  }>({
    avg: 0,
    count: 0,
    reviews: [],
  })

  // ✅ FIX BUCLE INFINITO: Memoizamos la función y validamos el estado previo
  const handleStatsChange = useCallback((data: { avg: number; count: number; reviews?: ReviewType[] }) => {
    setReviewData((prev) => {
      // Usamos ?.length y fallback a 0 para comparar de forma segura
      const newCount = data.reviews?.length || 0;
      const prevCount = prev.reviews?.length || 0;

      if (prev.avg === data.avg && prev.count === data.count && prevCount === newCount) {
        return prev;
      }

      return {
        avg: data.avg,
        count: data.count,
        reviews: data.reviews ?? [],
      };
    });
  }, []);

  // Funciones del carrito
  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }, [])

  const [isAdded, setIsAdded] = useState(false)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleAddToCart = useCallback(() => {
    if (quantity > 0 && producto.disponible) {
      addItem(producto, quantity)
      setQuantity(1) // Resetear cantidad después de agregar
      setIsAdded(true)

      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(() => {
        setIsAdded(false)
      }, 2000)
    }
  }, [addItem, producto, quantity])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const formattedPrice = useMemo(() => {
    return (producto.precio * quantity).toLocaleString('es-AR')
  }, [producto.precio, quantity])

  const CATEGORY_NAMES: Record<string, string> = {
    "rellenas": "Pastas Rellenas",
    "sin-relleno": "Sin Relleno",
    "sin-tacc": "Sin TACC",
    "salsas": "Salsas",
  }
  const categoriaNombre = CATEGORY_NAMES[categoria] || categoria
  const subcatUrl = getSubcategoryUrl(categoria, subcategoria)
  const productImages = producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes : [producto.imagen]


  // JSON-LD para datos estructurados del producto
  const structuredData = useMemo(() => {
    const canonicalUrl = getProductCanonicalUrl(producto)

    // 1. Lógica de FAQ corregida: Solo si existen en el producto
    const hasFaqs = producto.preguntasFrecuentes && producto.preguntasFrecuentes.length > 0

    const faqJsonLd = hasFaqs ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: producto.preguntasFrecuentes?.map((faq) => ({
        "@type": "Question",
        name: faq.pregunta,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.respuesta,
        },
      })),
    } : null

    const aggregateRating =
      reviewData.count > 0
        ? {
          "@type": "AggregateRating",
          ratingValue: Number(reviewData.avg.toFixed(1)),
          reviewCount: reviewData.count,
          bestRating: 5,
        }
        : undefined

    const reviewJsonLd =
      reviewData.count > 0
        ? reviewData.reviews.slice(0, 5).map((r) => ({
          "@type": "Review",
          author: {
            "@type": "Person",
            name: r.userName,
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: 5,
          },
          reviewBody: r.testimonial,
        }))
        : undefined

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: producto.nombre,
      description: producto.descripcion,
      image: productImages[0],
      aggregateRating,
      review: reviewJsonLd,
      brand: {
        "@type": "Brand",
        name: "Paula Pastas",
      },
      offers: {
        "@type": "Offer",
        price: producto.precio,
        priceCurrency: "ARS",
        availability: producto.disponible
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: canonicalUrl,
        seller: {
          "@type": "Organization",
          name: "Paula Pastas",
        },
      }
    }

    const breadcrumbItems: any[] = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Pastas",
        item: "https://paulapastas.com/pastas"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoriaNombre,
        item: `https://paulapastas.com${getCategoryUrl(categoria)}`
      }
    ]

    if (subcatUrl) {
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 3,
        name: subcategoria,
        item: `https://paulapastas.com${subcatUrl}`
      })
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 4,
        name: producto.nombre,
        item: canonicalUrl
      })
    } else {
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 3,
        name: producto.nombre,
        item: canonicalUrl
      })
    }

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems
    }

    // ✅ SOLUCIÓN AL ERROR: Forzamos el tipo como any[] para permitir esquemas mixtos
    const schemas: any[] = [jsonLd, breadcrumbJsonLd]
    if (faqJsonLd) schemas.push(faqJsonLd)

    return JSON.stringify(schemas)
  }, [
    categoria,
    categoriaNombre,
    subcategoria,
    subcatUrl,
    producto.nombre,
    producto.descripcion,
    producto.slug,
    producto.precio,
    producto.disponible,
    productImages[0],
    producto.preguntasFrecuentes,
    reviewData.avg,
    reviewData.count,
    reviewData.reviews,
  ])

  const backUrl = subcatUrl || getCategoryUrl(categoria)

  return (
    <>
      {/* ✅ Corrección: Usamos el componente Script de Next.js para evitar errores de parseo */}
      {/* Cambiamos Script por una etiqueta nativa para evitar que Next.js 
          procese el JSON-LD como un recurso externo bloqueante */}
      <script
        id="structured-data-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />

      <div className="min-h-screen bg-neutral-50 pb-28 sm:pb-0">
        {/* --- Breadcrumb --- */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <Link href="/" className="text-neutral-500 hover:text-primary-600">
                Inicio
              </Link>
              <span className="text-neutral-400">/</span>
              <Link href="/pastas" className="text-neutral-500 hover:text-primary-600">
                Pastas
              </Link>
              <span className="text-neutral-400">/</span>
              <Link href={getCategoryUrl(categoria)} className="text-neutral-500 hover:text-primary-600">
                {categoriaNombre}
              </Link>
              {subcatUrl && (
                <>
                  <span className="text-neutral-400">/</span>
                  <Link href={subcatUrl} className="text-neutral-500 hover:text-primary-600">
                    {subcategoria}
                  </Link>
                </>
              )}
              <span className="text-neutral-400">/</span>
              <span className="text-neutral-900 font-medium">{producto.nombre}</span>
            </nav>
          </div>
        </div>

        {/* --- Cuerpo de la página --- */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Botón Volver */}
          <div className="mb-8">
            <Link
              href={backUrl}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a {subcatUrl ? subcategoria : categoriaNombre}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Carrusel de Imágenes */}
            <div className="relative">
              <ProductImagesCarousel images={productImages} producto={producto} />
            </div>

            {/* Información del Producto */}
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                  {categoria.replace("-", " ")} • {subcategoria}
                </span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mt-2">
                  {producto.nombre}
                </h1>
              </div>

              <p className="text-lg text-neutral-600 leading-relaxed whitespace-pre-line">
                {producto.descripcion}
              </p>

              {/* Card de Precio y Selector */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-primary-600">${formattedPrice}</span>
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
                    disabled={!producto.disponible}
                  >
                    <Plus className="w-4 h-4 text-neutral-700" />
                  </button>
                </div>
              </div>

              {/* Botón de compra (Desktop) */}
              <button
                onClick={handleAddToCart}
                disabled={!producto.disponible || isAdded}
                className={`hidden sm:flex w-full py-4 rounded-full font-semibold transition-colors items-center justify-center ${isAdded
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-primary-600 text-white hover:bg-primary-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {!producto.disponible ? "No Disponible" : isAdded ? "¡Agregado al Carrito!" : "Agregar al Carrito"}
              </button>
            </div>
          </div>

          {/* Acordeones: Ingredientes y Envío */}
          <section className={`mt-16 grid gap-8 ${producto.ingredientes && producto.ingredientes.length > 0 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {producto.ingredientes && producto.ingredientes.length > 0 && (
              <details className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer group">
                <summary className="flex justify-between items-center font-bold text-neutral-900 text-xl list-none">
                  Ingredientes
                  <ChevronRight className="w-6 h-6 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                </summary>
                <div className="mt-4 text-neutral-700 leading-relaxed">
                  <ul className="list-disc list-inside space-y-1">
                    {producto.ingredientes.map((ing, idx) => <li key={idx}>{ing}</li>)}
                  </ul>
                </div>
              </details>
            )}

            <details className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-bold text-neutral-900 text-xl list-none">
                Envío y Conservación
                <ChevronRight className="w-6 h-6 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
              </summary>
              <div className="mt-4 text-neutral-700 leading-relaxed">
                <p className="mb-2">Realizamos envíos a Rosario y zonas cercanas.</p>
                <p>Se entregan congeladas: 2-3 días en heladera o 2 meses en freezer.</p>
              </div>
            </details>
          </section>

          {/* Historia del Plato */}
          <details className="mt-16 bg-white rounded-2xl shadow-lg p-8 cursor-pointer group">
            <summary className="flex justify-between items-center font-bold text-neutral-900 text-xl list-none">
              <span>{producto.historiaPlato?.titulo || "Un plato con historia"}</span>
              <ChevronRight className="w-6 h-6 text-primary-600 transition-transform duration-300 group-open:rotate-90 flex-shrink-0" />
            </summary>
            <div className="mt-4 text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
              {producto.historiaPlato?.texto || "Cocinamos a fuego lento para un sabor auténtico."}
            </div>
          </details>

          {/* Cómo Preparar */}
          {producto.comoPreparar && (
            <details className="mt-16 bg-primary-50 rounded-2xl shadow-lg p-8 cursor-pointer group">
              <summary className="flex justify-between items-center font-bold text-neutral-900 text-xl list-none">
                <span>{producto.comoPreparar.titulo}</span>
                <ChevronRight className="w-6 h-6 text-primary-600 transition-transform duration-300 group-open:rotate-90 flex-shrink-0" />
              </summary>
              <div className="mt-4 text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
                {producto.comoPreparar.texto}
              </div>
            </details>
          )}

          {/* Productos Complementarios */}
          {productosComplementarios.length > 0 && (
            <section className="mt-16">
              <p className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-8 text-center">Complementalo con</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {productosComplementarios.map((comp) => (
                  comp.id && <ProductCard key={comp.id} producto={comp} baseUrl={`/${comp.categoria}/${comp.subcategoria}`} />
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          <section className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-8 text-center">
              Preguntas frecuentes
            </h2>

            <div className="space-y-4 max-w-3xl mx-auto">
              {/* ✅ Corrección de Tipado: Usamos solo propiedades válidas de la interfaz */}
              {producto.preguntasFrecuentes && producto.preguntasFrecuentes.length > 0 ? (
                producto.preguntasFrecuentes.map((faq, idx) => (
                  <details key={idx} className="bg-neutral-50 rounded-lg p-5 cursor-pointer group">
                    <summary className="flex justify-between items-center font-bold text-neutral-900 text-lg list-none">
                      {faq.pregunta}
                      <ChevronRight className="w-5 h-5 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                    </summary>
                    <div className="mt-4 text-neutral-700 leading-relaxed whitespace-pre-line">
                      {faq.respuesta}
                    </div>
                  </details>
                ))
              ) : (
                <p className="text-center text-neutral-500 italic">
                  No hay preguntas frecuentes disponibles para este producto.
                </p>
              )}
            </div>
          </section>

          {/* --- REVIEWS SECTION (Diferido con Dynamic) --- */}
          {/* Al estar aquí abajo, no bloquea el renderizado de arriba */}
          <ReviewsSection
            productoId={producto.id || ""}
            productoNombre={producto.nombre}
          // onStatsChange={handleStatsChange} 
          />

          {/* Productos Relacionados */}
          {productosRelacionados.length > 0 && (
            <section className="mt-16">
              <h3 className="font-display text-3xl font-bold text-neutral-900 mb-8 text-center">
                Otros {subcategoria} que te pueden gustar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {productosRelacionados.map((rel) => <ProductCard key={rel.id} producto={rel} />)}
              </div>
            </section>
          )}
        </div>

        {/* --- Sticky Bar Mobile --- */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 sm:hidden px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="p-2 rounded-full bg-neutral-100"
            >
              <Minus className="w-4 h-4 text-neutral-700" />
            </button>
            <span className="text-base font-semibold w-8 text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={!producto.disponible}
              className="p-2 rounded-full bg-neutral-100"
            >
              <Plus className="w-4 h-4 text-neutral-700" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-neutral-500 uppercase">Total</div>
            <div className="text-lg font-bold text-primary-600">${formattedPrice}</div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!producto.disponible || isAdded}
            className={`shrink-0 h-11 px-6 rounded-full font-semibold transition-colors ${isAdded ? "bg-green-600 text-white" : "bg-primary-600 text-white"
              } disabled:opacity-50`}
          >
            {isAdded ? "Agregado" : "Agregar"}
          </button>
        </div>
      </div>
    </>
  );
}

function ProductImagesCarousel({
  images,
  producto,
}: {
  images: string[]
  producto: Producto
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<ReturnType<typeof window.requestAnimationFrame> | null>(null)

  const handleScroll = () => {
    if (!scrollerRef.current) return
    if (rafRef.current) return

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      const el = scrollerRef.current
      if (!el) return

      const width = el.clientWidth
      if (!width) return

      const newIdx = Math.round(el.scrollLeft / width)
      const safeIdx = Math.max(0, Math.min(images.length - 1, newIdx))

      // ✅ 1 y 2. Corrección: Solo actualizamos si el índice REALMENTE cambió,
      // y usamos el estado previo para evitar cierres obsoletos (stale closures).
      setActiveIndex((prevIdx) => {
        if (prevIdx === safeIdx) return prevIdx; // React aborta la renderización aquí
        return safeIdx;
      })
    })
  }

  const scrollToIndex = (idx: number) => {
    const el = scrollerRef.current
    if (!el) return
    const width = el.clientWidth

    // ✅ 3. Corrección: Quitamos 'behavior: "smooth"' porque la clase CSS 
    // 'scroll-smooth' del contenedor ya se encarga de esto por hardware.
    el.scrollTo({ left: idx * width })
  }

  const altBase = `${producto.nombre} caseros artesanales`
  const isMulti = images.length > 1

  return (
    <div
      className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100" // bg-neutral evita el "hueco blanco"
      role="region"
      aria-label="Carrusel de imágenes del producto"
    >
      {isMulti ? (
        <div
          ref={scrollerRef}
          className="h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar" // no-scrollbar es clave
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Oculta barra en Firefox/IE
        >
          {images.map((src, idx) => (
            <div
              key={`${src}-${idx}`}
              className="relative h-full w-full shrink-0 snap-center"
              style={{ willChange: 'transform' }} // Optimización de GPU
            >
              <ImageWrapper
                src={src}
                alt={`${altBase} - Imagen ${idx + 1}`}
                fill
                className="object-cover"
                priority={idx === 0}
                fetchPriority={idx === 0 ? "high" : "low"}
                sizes={imageSizes} // Consistente
                fallback="/placeholder.svg"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative h-full w-full">
          <ImageWrapper
            src={images[0]}
            alt={altBase}
            fill
            className="object-cover"
            priority
            fetchPriority="high"
            sizes={imageSizes} // Consistente
            fallback="/placeholder.svg?height=400&width=400&text=Producto"
          />
        </div>
      )}

      {producto.destacado && (
        <div className="absolute top-4 left-4 bg-primary-600 text-white px-4 py-2 rounded-full font-semibold flex items-center">
          <Star className="w-4 h-4 mr-1" />
          Destacado
        </div>
      )}

      {producto.categoria === "sin-tacc" && (
        <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
          Sin TACC
        </div>
      )}

      {producto.categoria !== "salsas" && (
        <div className="absolute bottom-4 left-4 bg-neutral-900 text-white px-4 py-2 rounded-full text-sm font-semibold">
          Artesanal
        </div>
      )}

      {isMulti && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-3 py-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className="w-2.5 h-2.5 rounded-full bg-neutral-300"
              aria-label={`Ir a la imagen ${idx + 1} de ${images.length}`}
              aria-current={idx === activeIndex}
              style={{
                backgroundColor: idx === activeIndex ? "rgb(37 99 235)" : undefined,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
