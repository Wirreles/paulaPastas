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
import { useAuth } from "@/lib/auth-context"
import { FirebaseService } from "@/lib/firebase-service"
import ReviewForm from "@/components/ReviewForm"
import type { Review as ReviewType } from "@/lib/types"

// Usar la interfaz Review de types.ts en lugar de la local

interface Faq {
  question: string
  answer: string
}

// Las reseñas ahora se cargan dinámicamente desde Firebase

// Datos de ejemplo para FAQ (pueden venir de Firebase en el futuro)
const faqs: Faq[] = [
  {
    question: "¿Qué diferencia hay entre los ravioles de Paula y los de supermercado?",
    answer:
      "Los ravioles de Paula Pastas se distinguen en cada detalle frente a los productos industriales. La masa está elaborada 100% con sémola de trigo de grano duro de alta calidad, sin colorantes ni conservantes artificiales. Nuestros rellenos no contienen aditivos: al cortarlos o morderlos, podés ver claramente los ingredientes reales que usamos. A diferencia de muchas opciones comerciales —que emplean harinas refinadas, estabilizantes, colorantes y etiquetas poco claras como \"sabores naturales\" o \"aditivos autorizados\"—, en Paula Pastas te ofrecemos transparencia, pureza y sabor real en tu mesa.",
  },
  {
    question: "¿Cuánto duran en el freezer? ¿Y en la heladera?",
    answer:
      "Nuestros ravioles pueden conservarse hasta 2 meses en freezer. Una vez cocidos, duran entre 2 y 3 días en heladera (en recipiente hermético). Sin embargo, recomendamos consumirlos dentro de las primeras 48 horas para preservar su sabor y textura originales.",
  },
  {
    question: "¿Cuántos ravioles se calculan por persona?",
    answer:
      "Cada caja de 500 gramos contiene aproximadamente 48 ravioles artesanales, de gran tamaño (4 cm en crudo). Ese contenido representa: 2 porciones abundantes (24 unidades c/u) o 3 porciones moderadas (16 unidades c/u). La cantidad ideal puede variar según el tipo de comida o el apetito de quienes los disfruten.",
  },
  {
    question: "¿Cuál es el sabor más pedido por los clientes?",
    answer:
      "Tenemos un podio muy aclamado aunque sin dudas hay un ganador. En primer lugar está el Ossobuco al Malbec, con su sabor profundo y sus horas de cocción lenta, es el favorito indiscutido.",
  },
  {
    question: "¿Tienen ravioles para vegetarianos?",
    answer:
      "¡Sí! Tenemos ravioles aptos para vegetarianos: Espinaca Cremosa con Crocante de Nuez. Y próximamente ampliaremos nuestra carta con más opciones veggie. Tip: no te pierdas nuestros Ñoquis de los 29, también aptos para vegetarianos.",
  },
  {
    question: "¿Puedo cocinarlos al horno o fritos, o solo hervidos?",
    answer:
      "Nuestros ravioles son aptos para: hervido, frito, salteado, al horno o en air fryer. Con cada compra incluimos nuestro manual de consejos del chef, para que los disfrutes al máximo con cualquier técnica.",
  },
  {
    question: "¿Cómo se cocinan los ravioles congelados?",
    answer:
      "Los ravioles se exponen al método de cocción que elijas directo desde el freezer. Nunca se descongelan.",
  },
  {
    question: "¿Dónde comprar ravioles artesanales en Rosario?",
    answer:
      "En Paula Pastas elaboramos cada raviol artesanalmente, uno por uno, con el cuidado y la atención que hacen la diferencia. Sí, son los mejores. Obviamente. 😉",
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
  subcategoria: string
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
  // Sección de preguntas frecuentes dinámicas
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

              <p className="text-lg text-neutral-600 leading-relaxed whitespace-pre-line">{producto.descripcion}</p>
              
              {producto.descripcionAcortada && (
                <p className="text-base text-neutral-500 leading-relaxed whitespace-pre-line italic">
                  {producto.descripcionAcortada}
                </p>
              )}

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
                  Nuestras pastas se entregan frescas y se pueden conservar en la heladera por 2-3 días o congelar hasta
                  por 3 meses para mantener su frescura y calidad.
                </p>
              </div>
            </details>
          </section>

          {/* 4. ✅ Descripción del producto */}
          <section className="mt-16 bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-neutral-900 mb-4">
              {producto.historiaPlato?.titulo || "Un plato con historia, cocinado a fuego lento."}
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

          {/* 6. ✅ NUEVA SECCIÓN: "¿Por qué nuestros ravioles son diferentes?" */}
          <section className="mt-16 bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
              ¿Por qué nuestros ravioles son diferentes?
            </h2>
            <div className="text-lg text-neutral-700 leading-relaxed max-w-4xl mx-auto space-y-6 text-left">
              <p>
                Porque no se trata solo de pasta.
              </p>
              <p>
                Cocinamos a fuego lento los rellenos como si fueran el plato principal: ossobuco braseado, carré glaseado, espinaca cremosa con crocante de nuez.
              </p>
              <p>
                Cada raviol está elaborado artesanalmente en Rosario, con sémola seleccionada y sin conservantes.
              </p>
              <p>
                Y lo mejor: en menos de 10 minutos, tenes un plato que podrías servir en un restaurante... pero en tu casa.
              </p>
            </div>
          </section>

          {/* 7. ✅ Sección: Reseñas (Carrusel) */}
          <ReviewsSection productoId={producto.id || ""} productoNombre={producto.nombre} />

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

// Componente de reseñas dinámicas (Client Component)
function ReviewsSection({ productoId, productoNombre }: { productoId: string; productoNombre: string }) {
  const { user, userData } = useAuth()
  const [reviews, setReviews] = useState<ReviewType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(1)
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const productReviews = await FirebaseService.getReviewsByProduct(productoId)
        setReviews(productReviews)
      } catch (error) {
        console.error("Error cargando reseñas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReviews()
  }, [productoId])

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
    if (reviews.length > 0) {
      setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % reviews.length)
    }
  }

  const prevReview = () => {
    if (reviews.length > 0) {
      setCurrentReviewIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length)
    }
  }

  const handleReviewSubmitted = () => {
    // Recargar las reseñas después de enviar una nueva
    const loadReviews = async () => {
      try {
        const productReviews = await FirebaseService.getReviewsByProduct(productoId)
        setReviews(productReviews)
      } catch (error) {
        console.error("Error recargando reseñas:", error)
      }
    }
    loadReviews()
  }

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }

  const isReviewExpanded = (reviewId: string) => expandedReviews.has(reviewId)

  const canUserReview = user && userData && userData.rol === "cliente"

  return (
    <section className="py-16 bg-neutral-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Los que ya probaron
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            La opinión de nuestros clientes es lo más importante.
          </p>
          
          {canUserReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Escribir Reseña
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600">Cargando reseñas...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="relative">
            <div className="flex items-center justify-center space-x-8">
              {reviews
                .slice(currentReviewIndex, currentReviewIndex + itemsPerPage)
                .map((review, index) => (
                  <div
                    key={review.id}
                    className={`bg-white rounded-2xl shadow-lg p-8 text-center w-[350px] flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${
                      isReviewExpanded(review.id || "") 
                        ? "h-auto min-h-[280px] shadow-xl border-2 border-primary-200" 
                        : "h-[280px]"
                    }`}
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < review.rating ? "text-yellow-400 fill-current" : "text-neutral-300"
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div className={`flex flex-col ${
                      !isReviewExpanded(review.id || "") ? "flex-1" : ""
                    }`}>
                      <div className={`review-text-container ${
                        !isReviewExpanded(review.id || "") ? "flex-1 overflow-hidden" : ""
                      }`}>
                        <p className={`text-lg text-neutral-700 mb-4 italic text-wrap-safe leading-relaxed ${
                          !isReviewExpanded(review.id || "") ? "line-clamp-3" : ""
                        }`}>
                          "{review.testimonial}"
                        </p>
                      </div>
                      
                      {/* Botón "Ver más" solo si el texto es largo */}
                      {review.testimonial.length > 120 && (
                        <button
                          onClick={() => toggleReviewExpansion(review.id || "")}
                          className={`text-primary-600 hover:text-primary-700 text-sm font-medium mb-4 transition-colors ${
                            isReviewExpanded(review.id || "") ? "font-semibold" : ""
                          }`}
                        >
                          {isReviewExpanded(review.id || "") ? "Ver menos" : "Ver más"}
                        </button>
                      )}
                    </div>
                    
                    <p className="text-neutral-600 font-semibold mt-auto">- {review.userName}</p>
                  </div>
                ))}
            </div>

            {reviews.length > itemsPerPage && (
              <>
                <button
                  onClick={prevReview}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-neutral-50 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-neutral-600" />
                </button>

                <button
                  onClick={nextReview}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-neutral-50 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-neutral-600" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-neutral-600 mb-4">
              Aún no hay reseñas para este producto.
            </p>
            {canUserReview && (
              <p className="text-neutral-500">
                ¡Sé el primero en compartir tu experiencia!
              </p>
            )}
          </div>
        )}
      </div>

      {showReviewForm && (
        <ReviewForm
          productoId={productoId}
          productoNombre={productoNombre}
          onClose={() => setShowReviewForm(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </section>
  )
}
