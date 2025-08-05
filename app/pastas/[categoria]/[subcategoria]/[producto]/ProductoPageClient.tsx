"use client" // Marcar como Client Component para el carrusel y acordeones

import { notFound } from "next/navigation"
import Image from "next/image"
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
import ComplementaryProductCard from "@/components/ComplementaryProductCard" // Importar el nuevo componente
import { useState, useEffect } from "react" // Importar useState y useEffect para el carrusel

interface Review {
  id: number
  name: string
  rating: number
  testimonial: string
}

interface Faq {
  question: string
  answer: string
}

// Datos de ejemplo para reseñas (pueden venir de Firebase en el futuro)
const reviews: Review[] = [
  {
    id: 1,
    name: "Martina S.",
    rating: 5,
    testimonial: "¡Los ravioles de osobuco son una locura! Súper tiernos y con un sabor increíble. Mis favoritos.",
  },
  {
    id: 2,
    name: "Facundo R.",
    rating: 5,
    testimonial: "La lasaña de carne es como la de la nonna. Perfecta para un domingo en familia. ¡Recomendadísima!",
  },
  {
    id: 3,
    name: "Lucía P.",
    rating: 4,
    testimonial: "Pedí los ñoquis y llegaron perfectos. Muy ricos y el delivery fue rápido. Volveré a pedir.",
  },
  {
    id: 4,
    name: "Diego M.",
    rating: 5,
    testimonial: "Los sorrentinos de jamón y queso son un clásico que nunca falla. Calidad y sabor garantizados.",
  },
  {
    id: 5,
    name: "Valeria G.",
    rating: 5,
    testimonial: "Probé los ravioles fritos y son una adicción. Ideales para picar con amigos. ¡Una joya!",
  },
]

// Datos de ejemplo para FAQ (pueden venir de Firebase en el futuro)
const faqs: Faq[] = [
  {
    question: "¿Hasta dónde llegan los envíos?",
    answer:
      "Realizamos envíos a Rosario, Funes, Fisherton, Villa Gobernador Gálvez, Alvear y zonas cercanas. Si tenés dudas sobre tu barrio, consultanos por WhatsApp y te confirmamos la cobertura.",
  },
  {
    question: "¿Cómo se conservan las pastas?",
    answer:
      "Nuestras pastas se entregan frescas y se pueden conservar en la heladera por 2-3 días o congelar hasta por 3 meses para mantener su frescura y calidad.",
  },
  {
    question: "¿Puedo pedir con anticipación?",
    answer:
      "Sí, puedes programar tu pedido para una fecha y hora específica durante el proceso de compra. Esto te asegura tener tus pastas listas cuando las necesites.",
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
  tiempoPreparacion?: string
  ingredientes?: string[]
  destacado?: boolean
  categoria: string
  subcategoria: string
  slug: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
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

  // JSON-LD para datos estructurados del producto
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion,
    image: producto.imagen,
    brand: {
      "@type": "Brand",
      name: "Comida Casera",
    },
    offers: {
      "@type": "Offer",
      price: producto.precio,
      priceCurrency: "ARS",
      availability: producto.disponible ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Comida Casera",
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
          item: "https://comidacasera.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Pastas",
          item: "https://comidacasera.com/pastas",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: categoria === "rellenas" ? "Pastas Rellenas" : categoria === "sin-relleno" ? "Sin Relleno" : "Sin TACC",
          item: `https://comidacasera.com/pastas/${categoria}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: subcategoria,
          item: `https://comidacasera.com/pastas/${categoria}/${subcategoria}`,
        },
        {
          "@type": "ListItem",
          position: 5,
          name: producto.nombre,
          item: `https://comidacasera.com/pastas/${categoria}/${subcategoria}/${productoSlug}`,
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
              <Link href="/pastas" className="text-neutral-500 hover:text-primary-600">
                Pastas
              </Link>
              <span className="text-neutral-400">/</span>
              <Link href={`/pastas/${categoria}`} className="text-neutral-500 hover:text-primary-600">
                {categoria === "rellenas"
                  ? "Pastas Rellenas"
                  : categoria === "sin-relleno"
                    ? "Sin Relleno"
                    : "Sin TACC"}
              </Link>
              <span className="text-neutral-400">/</span>
              <Link href={`/pastas/${categoria}/${subcategoria}`} className="text-neutral-500 hover:text-primary-600">
                {subcategoria}
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
              href={`/pastas/${categoria}/${subcategoria}`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a {subcategoria}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 1. Encabezado del producto (ya existente) */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src={producto.imagen || "/placeholder.svg"}
                  alt={`${producto.nombre} caseros artesanales`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {producto.destacado && (
                <div className="absolute top-4 left-4 bg-primary-600 text-white px-4 py-2 rounded-full font-semibold flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Destacado
                </div>
              )}
              {/* Opcional: etiquetas visuales como "Sin TACC", "Artesanal" */}
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
            </div>

            {/* Información */}
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                  {categoria.replace("-", " ")} • {subcategoria}
                </span>
                <h1 className="font-display text-4xl font-bold text-neutral-900 mt-2">{producto.nombre}</h1>
              </div>

              <p className="text-lg text-neutral-600 leading-relaxed">{producto.descripcion}</p>

              {/* Precio y detalles */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-primary-600">${producto.precio}</span>
                  {!producto.disponible && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      No disponible
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
                  {producto.porciones && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {producto.porciones} porciones
                    </div>
                  )}
                  {producto.tiempoPreparacion && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {producto.tiempoPreparacion}
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de compra (ya existente) */}
              <button
                disabled={!producto.disponible}
                className="w-full bg-primary-600 text-white py-4 rounded-full font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {producto.disponible ? "Agregar al Carrito" : "No Disponible"}
              </button>
            </div>
          </div>

          {/* 2. ✅ Sección: "Complémentalo con" */}
          {productosComplementarios.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-3xl font-bold text-neutral-900 mb-8 text-center">Complémentalo con</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {productosComplementarios.map((complemento) => (
                  <ComplementaryProductCard key={complemento.id} producto={complemento} />
                ))}
              </div>
            </section>
          )}

          {/* 3. ✅ Acordeones: Ingredientes y Envío */}
          <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ingredientes */}
            <details
              className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer group"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              <summary className="flex justify-between items-center font-bold text-neutral-900 text-xl">
                Ingredientes
                <ChevronRight className="w-6 h-6 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
              </summary>
              <div className="mt-4 text-neutral-700 leading-relaxed">
                {producto.ingredientes && producto.ingredientes.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {producto.ingredientes.map((ingrediente, index) => (
                      <li key={index}>{ingrediente}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay información de ingredientes disponible para este producto.</p>
                )}
              </div>
            </details>

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
                  Nuestras pastas se entregan frescas y se pueden conservar en la heladera por 2-3 días o congelar hasta
                  por 3 meses para mantener su frescura y calidad.
                </p>
              </div>
            </details>
          </section>

          {/* 4. ✅ Descripción del producto */}
          <section className="mt-16 bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-neutral-900 mb-4">
              Un plato con historia, cocinado a fuego lento.
            </h2>
            <p className="text-lg text-neutral-700 leading-relaxed mb-8">
              {producto.descripcion} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
              esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
              qui officia deserunt mollit anim id est laborum.
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
          <section className="mt-16 bg-primary-50 rounded-2xl shadow-lg p-8 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-8">¿Cómo prepararlos?</h2>
            <p className="text-lg text-neutral-700 leading-relaxed max-w-4xl mx-auto">
              El ritual comienza. Elegí tu música preferida mientras el agua hierve con una pizca generosa de sal. Dejas
              tu salsa preferida descongelando en una sartén. Cuando el agua burbujea, agregá suavemente los ravioles
              directamente desde el freezer, sin descongelar. En unos 3-5 minutos, verás como suben a la superficie. Que
              floten es su forma de decirte que están listos. Escurrilos con suavidad, elegí tu plato más lindo y
              servilos con tu salsa favorita. <span className="font-semibold">Consejo de chef:</span> cuando empieza a
              flotar el primero, podés apagar la cocina y dejarlo tapado hasta que suban todos para asegurarte que no se
              pasen!
            </p>
          </section>

          {/* 6. ✅ Sección: Reseñas (Carrusel) */}
          <ReviewsCarousel />

          {/* 7. ✅ Sección: Preguntas Frecuentes (Acordeón) */}
          <section className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-lg text-neutral-600">
                Resolvemos las dudas más comunes sobre nuestros ravioles artesanales y el proceso de compra.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
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
              ))}
            </div>
          </section>

          {/* 8. ✅ Sección: Otros productos recomendados */}
          {productosRelacionados.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-3xl font-bold text-neutral-900 mb-8 text-center">
                Otros {subcategoria} que te pueden gustar
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

// Componente de carrusel de reseñas (Client Component)
function ReviewsCarousel() {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(1)

  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(3)
      } else if (window.innerWidth >= 768) {
        setItemsPerPage(2)
      } else {
        setItemsPerPage(1)
      }
    }

    calculateItemsPerPage()
    window.addEventListener("resize", calculateItemsPerPage)

    return () => window.removeEventListener("resize", calculateItemsPerPage)
  }, [])

  const nextReview = () => {
    setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % reviews.length)
  }

  const prevReview = () => {
    setCurrentReviewIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length)
  }

  return (
    <section className="py-16 bg-neutral-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Los que ya probaron</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            La opinión de nuestros clientes es lo más importante.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentReviewIndex * (100 / itemsPerPage)}%)`,
              }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4">
                  <div className="bg-white rounded-lg p-6 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center mb-4">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                        {[...Array(5 - review.rating)].map((_, i) => (
                          <Star key={i + review.rating} className="w-5 h-5 text-neutral-300" />
                        ))}
                      </div>
                      <p className="text-neutral-700 italic mb-4">"{review.testimonial}"</p>
                    </div>
                    <p className="font-semibold text-neutral-900" aria-label={`Reseña de ${review.name}`}>
                      - {review.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevReview}
            className="absolute top-1/2 left-0 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-neutral-100 transition-colors z-10 hidden md:block"
            aria-label="Reseña anterior"
          >
            <ChevronLeft className="w-6 h-6 text-neutral-700" />
          </button>
          <button
            onClick={nextReview}
            className="absolute top-1/2 right-0 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-neutral-100 transition-colors z-10 hidden md:block"
            aria-label="Siguiente reseña"
          >
            <ChevronRight className="w-6 h-6 text-neutral-700" />
          </button>
        </div>
      </div>
    </section>
  )
}
