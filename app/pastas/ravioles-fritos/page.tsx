import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle, ShoppingBag } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import ProductCard from "@/components/ProductCard"

export const metadata: Metadata = {
  title: "Ravioles Fritos en Rosario | Una Experiencia Única | Paula Pastas",
  description:
    "Descubrí los ravioles fritos de Paula Pastas: crocantes por fuera, cremosos por dentro. Perfectos para picadas y encuentros. ¡Delivery en Rosario!",
  keywords: "ravioles fritos, pasta frita, picadas, entradas, delivery rosario, paula pastas",
  openGraph: {
    title: "Ravioles Fritos en Rosario | Paula Pastas",
    description: "Crocantes y deliciosos ravioles fritos para tus picadas y eventos.",
    images: [
      {
        url: "/placeholder.svg?height=600&width=1200",
        width: 1200,
        height: 600,
        alt: "Ravioles fritos dorados y crocantes",
      },
    ],
    type: "website",
    locale: "es_AR",
  },
  alternates: {
    canonical: "https://comidacasera.com/pastas/ravioles-fritos",
  },
}

async function getProductosRaviolesFritos() {
  try {
    // Asumiendo que 'ravioles-fritos' es una subcategoría de 'sin-relleno'
    return await FirebaseService.getProductosPorSubcategoria("sin-relleno", "ravioles-fritos")
  } catch (error) {
    console.error("Error fetching productos de ravioles fritos:", error)
    return []
  }
}

export default async function RaviolesFritosPage() {
  const productosRaviolesFritos = await getProductosRaviolesFritos()
  
  // Obtener banner dinámico
  const banner = await FirebaseService.getPageBannerBySlug("sin-relleno/ravioles-fritos")

  // JSON-LD para datos estructurados
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product", // O CollectionPage si se listan varios productos
    name: "Ravioles Fritos",
    description:
      "Del freezer directo a la sartén. Crocantes por fuera, cremosos por dentro. Perfectos para picadas, encuentros o para darte un gusto diferente.",
    image: "/placeholder.svg?height=800&width=1200",
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      // Aquí podrías poner un rango de precios si hay varios productos, o el precio del producto principal
      // price: "2000",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "50",
    },
  }

  const faqs = [
    {
      question: "¿Se comen fríos o calientes?",
      answer:
        "Lo ideal es comerlos calientes o tibios, recién fritos o después de unos minutos reposando. También pueden servirse a temperatura ambiente, como parte de una tabla de picada, sin problema. No se recomiendan fríos de heladera, ya que pierden textura crocante y cremosidad interna.",
    },
    {
      question: "¿Con qué salsas combinan mejor?",
      answer:
        "Funcionan mejor con salsas de acompañamiento tipo finger food. Algunas recomendaciones gourmet: Crema de ajo asado: Cremosa y suave, realza el sabor del relleno sin taparlo. Ideal con ossobuco o espinaca. Dip de queso azul o roquefort: Para paladares más intensos. Combina increíble con hongos o carnes. Crema de limón y albahaca: Fresca, ligera, muy buena con rellenos vegetarianos o de ricota.",
    },
  ]

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
              <span className="text-neutral-900 font-medium">Ravioles Fritos</span>
            </nav>
          </div>
        </div>

        {/* 1. 🧱 SECCIÓN HERO / BANNER PRINCIPAL */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={banner?.imageUrl || "/placeholder.svg?height=800&width=1200"}
              alt={banner?.title || "Ravioles fritos dorados y crocantes"}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-4">
              {banner?.title || "Ravioles fritos en Rosario"}
            </h1>
            <p className="text-xl md:text-2xl text-neutral-200 mb-6">
              {banner?.subtitle || "Una experiencia que tenes que probar."}
            </p>
            <p className="text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto">
              Del freezer directo a la sartén. Crocantes por fuera, cremosos por dentro. Perfectos para picadas,
              encuentros o para darte un gusto diferente.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* 2. SECCIÓN INFORMATIVA - ¿QUÉ SON LOS RAVIOLES FRITOS? */}
          <section className="bg-white rounded-2xl shadow-lg p-8 mb-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              ¿Qué son los ravioles fritos?
            </h2>
            <p className="text-lg text-neutral-600 mb-6 max-w-3xl mx-auto">
              Puede que pienses en los ravioles como un plato con salsa… pero hoy te invitamos a descubrir una versión
              que conquista: ravioles fritos.
            </p>
            <p className="text-neutral-700 leading-relaxed max-w-4xl mx-auto">
              Los cocinás directo en aceite caliente (sin hervir), hasta que quedan dorados y crujientes por fuera, con
              el relleno suave y sabroso por dentro. Una combinación ideal para picadas, entradas, eventos o simplemente
              para disfrutar de una nueva forma de comer pastas.
            </p>
          </section>

          {/* 3. GALERÍA DE IMÁGENES */}
          <section className="mb-16">
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-8 text-center">Galería de Imágenes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-lg hover-lift">
                <Image
                  src="/placeholder.svg?height=300&width=400"
                  alt="Ravioles fritos servidos en un plato"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-lg hover-lift">
                <Image
                  src="/placeholder.svg?height=300&width=400"
                  alt="Ravioles fritos cocinándose en una sartén"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-lg hover-lift">
                <Image
                  src="/placeholder.svg?height=300&width=400"
                  alt="Ravioles fritos como aperitivo en una picada"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-lg hover-lift">
                <Image
                  src="/placeholder.svg?height=300&width=400"
                  alt="Primer plano de ravioles fritos con textura crocante"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </section>

          {/* 4. SECCIÓN DESTACADOS - LOS MÁS PEDIDOS */}
          <section className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">Los ravioles fritos más pedidos</h2>
              <p className="text-lg text-neutral-600">
                Descubrí nuestros sabores más pedidos y dejate tentar con los lanzamientos de la semana.
              </p>
            </div>

            <Suspense
              fallback={
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-neutral-600">Cargando productos...</p>
                </div>
              }
            >
              {productosRaviolesFritos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {productosRaviolesFritos.map((producto) => (
                    <ProductCard key={producto.id} producto={producto} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🍝</span>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">Próximamente</h3>
                  <p className="text-neutral-600">Estamos preparando deliciosos ravioles fritos para vos</p>
                </div>
              )}
            </Suspense>

            <div className="text-center mt-12">
              <Link
                href="/pastas"
                className="inline-flex items-center px-6 py-3 border border-neutral-900 text-neutral-900 font-semibold rounded-lg hover:bg-neutral-900 hover:text-white transition-colors w-full sm:max-w-xs mx-auto"
              >
                Conocé el menú completo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* 5. SECCIÓN DIFERENCIAL - ¿POR QUÉ ELEGIRNOS? */}
          <section className="bg-primary-50 rounded-2xl shadow-lg p-8 mb-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
              ¿Por qué elegir nuestros ravioles fritos?
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <p className="text-lg text-neutral-700">
                  <span className="font-semibold">Masa firme de sémola</span> que resiste la fritura sin romperse.
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <p className="text-lg text-neutral-700">
                  <span className="font-semibold">Rellenos sabrosos</span> que se funden en boca.
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <p className="text-lg text-neutral-700">
                  Se cocinan en <span className="font-semibold">6 minutos, sin hervir.</span>
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <p className="text-lg text-neutral-700">
                  Ideal para <span className="font-semibold">picadas gourmet sin complicaciones.</span>
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <p className="text-lg text-neutral-700">
                  Se conservan <span className="font-semibold">congelados hasta 6 meses.</span>
                </p>
              </li>
            </ul>
          </section>

          {/* 6. SECCIÓN GUÍA DE PREPARACIÓN */}
          <section className="bg-white rounded-2xl shadow-lg p-8 mb-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-8">¿Cómo prepararlos?</h2>
            <p className="text-lg text-neutral-700 leading-relaxed max-w-4xl mx-auto mb-8">
              El ritual comienza. Elegí tu música preferida mientras el agua hierve con una pizca generosa de sal. Dejas
              tu salsa preferida descongelando en una sartén. Cuando el agua burbujea, agregá suavemente los ravioles
              directamente desde el freezer, sin descongelar. En unos 3-5 minutos, verás como suben a la superficie. Que
              floten es su forma de decirte que están listos. Escurrilos con suavidad, elegí tu plato más lindo y
              servilos con tu salsa favorita. <span className="font-semibold">Consejo de chef:</span> cuando empieza a
              flotar el primero, podés apagar la cocina y dejarlo tapado hasta que suban todos para asegurarte que no se
              pasen!
            </p>
            <Link
              href="/pastas"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Quiero probarlos
            </Link>
          </section>

          {/* 7. SECCIÓN FAQ / INFORMACIÓN ADICIONAL */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-lg text-neutral-600">
                Resolvemos tus dudas más comunes sobre nuestros ravioles fritos.
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
                    <ArrowRight className="w-5 h-5 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                  </summary>
                  <div className="mt-4 text-neutral-700 leading-relaxed">{faq.answer}</div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
