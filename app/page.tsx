"use client" // Necesario para el carrusel y el acordeón interactivo

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Star, Clock, Truck, Leaf, Award, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import ProductCard from "@/components/ProductCard"
import type { HomeSection } from "@/lib/types" // Importar el nuevo tipo

// Datos de ejemplo para reseñas
const reviews = [
  {
    id: 1,
    name: "María G.",
    rating: 5,
    testimonial: "Las mejores pastas caseras que he probado en Rosario. ¡Frescas y deliciosas!",
  },
  {
    id: 2,
    name: "Juan P.",
    rating: 5,
    testimonial: "El delivery es súper rápido y las porciones son generosas. ¡Mis favoritas!",
  },
  {
    id: 3,
    name: "Ana L.",
    rating: 4,
    testimonial: "Excelente opción para una cena rápida y sabrosa. Los ravioles de osobuco son un must.",
  },
  {
    id: 4,
    name: "Carlos R.",
    rating: 5,
    testimonial: "Siempre pido para eventos familiares, ¡nunca fallan! Calidad y sabor garantizados.",
  },
  {
    id: 5,
    name: "Sofía M.",
    rating: 5,
    testimonial: "La lasaña es espectacular, como hecha en casa. ¡Totalmente recomendada!",
  },
  {
    id: 6,
    name: "Pedro D.",
    rating: 4,
    testimonial: "Los ñoquis son muy ricos y la atención al cliente es excelente. Volveré a pedir.",
  },
]

// Datos de ejemplo para FAQ
const faqs = [
  {
    question: "¿Cuál es el horario de atención y delivery?",
    answer:
      "Nuestro horario de atención y delivery es de Lunes a Viernes de 18:00 a 23:00 hs, y Sábados y Domingos de 12:00 a 23:00 hs.",
  },
  {
    question: "¿Qué zonas cubren con el delivery?",
    answer:
      "Realizamos delivery en Villa Gobernador Gálvez, Rosario Centro, Zona Sur y Zona Oeste. Puedes verificar la cobertura exacta en nuestra sección de Delivery.",
  },
  {
    question: "¿Las pastas son frescas o congeladas?",
    answer:
      "Todas nuestras pastas son elaboradas diariamente con ingredientes frescos y de primera calidad para garantizar la máxima frescura al momento de la entrega.",
  },
  {
    question: "¿Tienen opciones sin TACC?",
    answer:
      "Sí, contamos con una variedad de pastas libres de gluten elaboradas con harinas certificadas sin TACC, perfectas para celíacos sin renunciar al sabor tradicional.",
  },
  {
    question: "¿Cómo puedo hacer un pedido?",
    answer:
      "Puedes hacer tu pedido directamente desde nuestra página web, seleccionando los productos que desees y eligiendo tu zona de entrega. También puedes contactarnos por WhatsApp para asistencia personalizada.",
  },
]

export default function HomePage() {
  const [productosDestacados, setProductosDestacados] = useState<any[]>([])
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]) // Nuevo estado para secciones del home
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(1) // Default for mobile

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

    calculateItemsPerPage() // Set initial value
    window.addEventListener("resize", calculateItemsPerPage) // Update on resize

    return () => window.removeEventListener("resize", calculateItemsPerPage)
  }, [])

  // useEffect para cargar las secciones del home
  useEffect(() => {
    async function loadHomeSections() {
      try {
        const data = await FirebaseService.getHomeSections()
        setHomeSections(data)
      } catch (error) {
        console.error("Error fetching home sections:", error)
      }
    }
    loadHomeSections()
  }, [])

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await FirebaseService.getProductosDestacados()
        setProductosDestacados(data)
      } catch (error) {
        console.error("Error fetching productos destacados:", error)
      }
    }
    loadProducts()
  }, [])

  const nextReview = () => {
    setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % reviews.length)
  }

  const prevReview = () => {
    setCurrentReviewIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length)
  }

  // Obtener imágenes dinámicas
  const heroImage =
    homeSections.find((s) => s.id === "hero-main-image")?.imageUrl ||
    "/placeholder.svg?height=800&width=1200&text=Hero Image" // Fallback más genérico
  const dishesGalleryImages = homeSections
    .filter((s) => s.sectionId === "dishes-gallery")
    .sort((a, b) => a.order - b.order)
  const qualityAssuredImage =
    homeSections.find((s) => s.id === "quality-assured-image")?.imageUrl ||
    "/placeholder.svg?height=400&width=600&text=Quality Assured Image"

  // Mapear las categorías del home a partir de los datos dinámicos
  const categoriasHome = [
    {
      nombre: "Sorrentinos",
      slug: "rellenas/sorrentinos", // Ajustado para la ruta correcta
      descripcion: "Grandes y sabrosos",
      imagen:
        homeSections.find((s) => s.id === "home-category-sorrentinos")?.imageUrl ||
        "/placeholder.svg?height=300&width=400&text=Sorrentinos",
    },
    {
      nombre: "Ñoquis",
      slug: "sin-relleno/noquis", // Ajustado para la ruta correcta
      descripcion: "Suaves y esponjosos",
      imagen:
        homeSections.find((s) => s.id === "home-category-noquis")?.imageUrl ||
        "/placeholder.svg?height=300&width=400&text=Ñoquis",
    },
    {
      nombre: "Ravioles",
      slug: "rellenas/ravioles", // Ajustado para la ruta correcta
      descripcion: "Rellenos tradicionales",
      imagen:
        homeSections.find((s) => s.id === "home-category-ravioles")?.imageUrl ||
        "/placeholder.svg?height=300&width=400&text=Ravioles",
    },
    {
      nombre: "Lasañas",
      slug: "rellenas/lasana", // Ajustado para la ruta correcta
      descripcion: "Capas de sabor",
      imagen:
        homeSections.find((s) => s.id === "home-category-lasana")?.imageUrl ||
        "/placeholder.svg?height=300&width=400&text=Lasañas",
    },
    {
      nombre: "Fideos",
      slug: "sin-relleno/fideos", // Ajustado para la ruta correcta
      descripcion: "Clásicos y versátiles",
      imagen:
        homeSections.find((s) => s.id === "home-category-fideos")?.imageUrl ||
        "/placeholder.svg?height=300&width=400&text=Fideos",
    },
  ]

  // JSON-LD para reseñas (ejemplo básico)
  const reviewsJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Paula Pastas",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9", // Valor promedio de tus reseñas
      reviewCount: "250", // Número total de reseñas
    },
    review: reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.name,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
      },
      reviewBody: review.testimonial,
    })),
  }

  // JSON-LD para FAQPage
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <div className="min-h-screen">
      {/* JSON-LD para reseñas y FAQ */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* 1. 🧱 Sección Principal / Hero (Carrusel principal) */}
      <section className="relative flex flex-col lg:flex-row items-center justify-center lg:justify-between min-h-[80vh] lg:h-[70vh] bg-gradient-to-b from-primary-350 to-primary-550">
        {/* Contenido de texto (derecha en web, arriba centrado en móvil) */}
        <div className="relative z-10 text-center lg:text-left w-full lg:w-1/2 max-w-4xl mx-auto lg:mx-0 order-1 lg:order-2 py-8 lg:py-0 px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-2 text-sm font-medium text-neutral-700 mb-4 animate-fade-in">
            <Leaf className="w-4 h-4 text-primary-600" />
            <span>Elaboración 100% Artesanal</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-neutral-900 mb-4 animate-fade-in">
            Fábrica de pastas artesanales en Rosario
          </h1>
          <p className="text-lg md:text-xl mb-8 text-neutral-700 animate-slide-up">
            En Paula Pastas llevamos la experiencia del restaurante a tu casa. Si buscas algo especial, rico y rápido
            sin complicarte la vida, esta es tu casa de pastas.
          </p>
          <div className="flex flex-col items-center lg:items-start gap-4 animate-scale-in">
            <Link
              href="/pastas"
              className="group inline-flex items-center justify-center px-6 py-3 border border-neutral-900 text-neutral-900 text-sm font-semibold rounded-lg hover:bg-neutral-900 hover:text-white transition-all duration-300 w-full sm:max-w-xs mx-auto lg:w-auto lg:mx-0"
            >
              Descubrí nuestras pastas
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex flex-row flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs text-neutral-900">
              <div className="flex items-center space-x-2">
                <Leaf className="w-4 h-4 text-neutral-900" />
                <span>Sin Conservantes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-neutral-900" />
                <span>Frescura garantizada</span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-full lg:w-1/2 aspect-video lg:h-full order-2 lg:order-1">
          <Image
            src={heroImage || "/placeholder.svg"} // Usando imagen dinámica
            alt="Pasta artesanal en Rosario, plato de ravioles con salsa"
            fill
            className="object-cover w-full h-full"
            priority
          />
        </div>
      </section>

      {/* 2. 🥟 Sección: “Pastas frescas recientemente elaboradas” */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Pastas frescas recientemente elaboradas
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Descubrí nuestras pastas más populares, elaboradas con ingredientes frescos y recetas tradicionales.
            </p>
          </div>

          <Suspense fallback={<div className="text-center">Cargando productos...</div>}>
            {productosDestacados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {productosDestacados.slice(0, 6).map((producto: any) => (
                  <ProductCard key={producto.id} producto={producto} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🍝</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Próximamente</h3>
                <p className="text-neutral-600">Estamos preparando deliciosos productos para esta categoría</p>
              </div>
            )}
          </Suspense>

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

      {/* 3. 🍝 Sección: “¿Qué pasta casera te gustaría comer hoy?” */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              ¿Qué pasta casera te gustaría comer hoy?
            </h2>
            <p className="text-lg text-neutral-600">Tenemos opciones para todos los gustos y necesidades</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {categoriasHome.map((categoria) => (
              <Link key={categoria.slug} href={`/pastas/${categoria.slug}`} className="group">
                <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift">
                  <div className="relative h-48">
                    <Image
                      src={categoria.imagen || "/placeholder.svg"} // Usando imagen dinámica
                      alt={`${categoria.nombre} caseras artesanales`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">{categoria.nombre}</h3>
                      <p className="text-neutral-200 text-sm">{categoria.descripcion}</p>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 🤔 Sección informativa: “¿Aún no sabes qué elegir?” */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            ¿Aún no sabes qué elegir?
          </h2>
          <p className="text-xl mb-8 text-neutral-700">
            En Paula Pastas, cada plato es una obra de arte culinaria, elaborada con pasión y los ingredientes más
            frescos. Nuestra tradición familiar se refleja en cada bocado, ofreciéndote una experiencia inigualable.
          </p>
          <Link
            href="/pastas"
            className="inline-flex items-center px-8 py-4 border border-neutral-900 text-neutral-900 font-semibold rounded-lg hover:bg-neutral-900 hover:text-white transition-colors w-full sm:max-w-xs mx-auto"
          >
            Conocé el menú completo
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* 5. 🍽️ Sección visual: “Platos que hablan por sí solos” */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Platos que hablan por sí solos
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Deslizá y mirá lo que podés tener en tu mesa esta semana.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {dishesGalleryImages.map((img, index) => (
              <div key={index} className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-lg hover-lift">
                <Image src={img.imageUrl || "/placeholder.svg"} alt={img.name} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ❤️ Sección: “¿Por qué nos eligen?” */}
      <section className="py-16 bg-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">¿Por qué nos eligen?</h2>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto mb-12">
            Nuestros clientes eligen Paula Pastas por la calidad, el sabor y la comodidad.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Calidad Inigualable</h3>
              <p className="text-neutral-600">
                Utilizamos solo ingredientes frescos y de primera calidad para cada preparación.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Frescura Diaria</h3>
              <p className="text-neutral-600">
                Elaboramos nuestras pastas todos los días para garantizar el máximo sabor y frescura.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Delivery Confiable</h3>
              <p className="text-neutral-600">
                Recibe tus pastas en la comodidad de tu hogar, con entregas rápidas y seguras en Rosario.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pastas"
              className="inline-flex items-center px-8 py-4 bg-primary-900 text-white font-semibold rounded-lg hover:bg-primary-800 transition-colors w-full sm:max-w-xs"
            >
              Ver pastas
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a
              href="https://wa.me/5493411234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#1DA851] transition-colors w-full sm:max-w-xs"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Hablemos por Wsp
            </a>
          </div>
        </div>
      </section>

      {/* 7. 🌟 [MODIFICADA] Sección: “Los que ya probaron” (Reseñas - Carrusel) */}
      <section className="py-16 bg-white">
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
                  <div
                    key={review.id}
                    className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4" // Adjust width for responsive cards
                  >
                    <div className="bg-neutral-50 rounded-lg p-6 shadow-sm h-full flex flex-col justify-between">
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

      {/* 8. 🧪 [NUEVA] – Sección “Calidad asegurada” */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          <figure className="relative w-full lg:w-1/2 aspect-video rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={qualityAssuredImage || "/placeholder.svg"} // Usando imagen dinámica
              alt="Elaboración artesanal de pastas Paula Pastas"
              fill
              className="object-cover"
            />
          </figure>
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Calidad asegurada</h2>
            <p className="text-lg text-neutral-700 leading-relaxed">
              Cuando decimos que nuestras pastas artesanales son otra cosa, lo sostenemos. Cada ingrediente es
              seleccionado con el mayor cuidado y cada paso de la elaboración se realiza con la pasión y el saber hacer
              que solo una tradición de años puede ofrecer.
            </p>
          </div>
        </div>
      </section>

      {/* 9. ❓ [NUEVA] – Sección “Preguntas frecuentes” (acordeón) */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Preguntas frecuentes</h2>
            <p className="text-lg text-neutral-600">
              Resolvemos tus dudas más comunes sobre nuestros productos y servicios.
            </p>
          </div>

          <div className="space-y-4">
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
        </div>
      </section>

      {/* 10. 🗣️ [NUEVA] – Sección “¿Tenés otra consulta?” */}
      <section className="py-16 bg-primary-50 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">¿Tenés otra consulta?</h2>
          <p className="text-xl mb-8 text-neutral-700">
            Te ayudamos por WhatsApp. Nuestro equipo está listo para responder todas tus preguntas.
          </p>
          <a
            href="https://wa.me/5493411234567" // Reemplaza con tu número de WhatsApp
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#1DA851] transition-colors"
            aria-label="Chatear por WhatsApp con Paula Pastas"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Hablemos por WhatsApp
          </a>
        </div>
      </section>

      {/* 11. 📬 [NUEVA] – Sección “Mantente informado” */}
      <section className="py-16 bg-primary-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Mantente informado</h2>
          <p className="text-lg text-neutral-700 mb-8">
            Suscribite a nuestro newsletter y recibí un 10% de descuento en tu primer pedido.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <label htmlFor="email-newsletter" className="sr-only">
              Email
            </label>
            <input
              type="email"
              id="email-newsletter"
              name="email"
              placeholder="Tu email"
              required
              className="flex-1 px-5 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-neutral-900"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-primary-900 text-white font-semibold rounded-lg hover:bg-primary-800 transition-colors"
            >
              Suscribirme
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
