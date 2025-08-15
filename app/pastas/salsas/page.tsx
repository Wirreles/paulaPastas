import type { Metadata } from "next"
import Link from "next/link"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import { HeroPlaceholder } from "@/components/ui/ImagePlaceholder"
import { ChevronDown, MessageCircle, ArrowRight, ShoppingBag } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"

export const metadata: Metadata = {
  title: "Salsas Caseras Artesanales | Paula Pastas - Rosario",
  description: "Descubrí nuestras salsas caseras pensadas para potenciar el sabor de cada pasta. Hechas en casa, sin conservantes ni apuros. Salsas Pomodoro, Bolognesa, Pesto y más.",
  keywords: "salsas caseras, salsas artesanales, salsa pomodoro, salsa bolognesa, salsa pesto, rosario, paula pastas, delivery salsas",
  openGraph: {
    title: "Salsas Caseras Artesanales | Paula Pastas",
    description: "Salsas caseras elaboradas con ingredientes frescos y recetas tradicionales. Perfectas para acompañar tus pastas favoritas.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Salsas caseras artesanales Paula Pastas",
      },
    ],
    type: "website",
    locale: "es_AR",
  },
  alternates: {
    canonical: "https://paulapastas.com/pastas/salsas",
  },
}

export default async function SalsasPage() {
  // Obtener banner dinámico
  const banner = await FirebaseService.getPageBannerBySlug("salsas")

  // JSON-LD para datos estructurados
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Salsas Caseras Artesanales",
    description: "Salsas caseras elaboradas con ingredientes frescos y recetas tradicionales",
    url: "https://paulapastas.com/pastas/salsas",
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
          name: "Pastas",
          item: "https://paulapastas.com/pastas",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Salsas",
          item: "https://paulapastas.com/pastas/salsas",
        },
      ],
    },
  }

  // Datos estáticos de productos de salsa
  const salsas = [
    {
      id: "salsa-pomodoro",
      nombre: "Salsa Pomodoro",
      descripcion: "Hecha con tomate fresco y albahaca",
      precio: 2500,
      imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
      disponible: true
    },
    {
      id: "salsa-bolognesa",
      nombre: "Salsa Bolognesa",
      descripcion: "Carne molida con verduras y vino tinto",
      precio: 3200,
      imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop",
      disponible: true
    },
    {
      id: "salsa-pesto",
      nombre: "Salsa Pesto",
      descripcion: "Albahaca, piñones y queso parmesano",
      precio: 2800,
      imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
      disponible: true
    },
    {
      id: "salsa-cremosa",
      nombre: "Salsa Cremosa",
      descripcion: "Crema, champiñones y hierbas finas",
      precio: 3000,
      imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop",
      disponible: true
    }
  ]

  // Datos de FAQ
  const faqs = [
    {
      pregunta: "¿Cuánto rinden las salsas?",
      respuesta: "Cada salsa rinde aproximadamente 4-6 porciones, dependiendo de la cantidad que uses por plato. Son perfectas para acompañar nuestras pastas frescas."
    },
    {
      pregunta: "¿Cuánto duran en el freezer? ¿Y en la heladera?",
      respuesta: "Duran hasta 30 días en el freezer y 4 días en la heladera, siempre que se mantengan refrigeradas. Te recomendamos consumirlas dentro de estos plazos para mantener la mejor calidad."
    },
    {
      pregunta: "¿Vienen listas para usar o hay que calentarlas?",
      respuesta: "Vienen listas, solo necesitás calentarlas a baño maría o microondas antes de servir. No requieren preparación adicional, solo calentamiento."
    },
    {
      pregunta: "¿Qué zonas cubren con el delivery?",
      respuesta: "Realizamos envíos a Rosario, Funes, Fisherton, Villa Gobernador Gálvez, Alvear y zonas cercanas. Si tenés dudas sobre tu barrio, contactanos por WhatsApp."
    }
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
              <span className="text-neutral-900 font-medium">Salsas</span>
            </nav>
          </div>
        </div>

        {/* 1. Banner Principal */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <ImageWrapper
              src={banner?.imageUrl || "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=800&fit=crop"}
              alt={banner?.title || "Salsas caseras artesanales en frascos"}
              fill
              className="object-cover"
              priority={true}
              fallback="/placeholder.svg?height=800&width=1200&text=Salsas+Caseras"
              placeholder={<HeroPlaceholder className="object-cover" />}
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              {banner?.title || "Salsas caseras"}
            </h1>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-xl md:text-2xl text-neutral-100 leading-relaxed">
                {banner?.subtitle || "Descubrí nuestras salsas pensadas para potenciar el sabor de cada pasta. Hechas en casa, sin conservantes ni apuros."}
              </p>
            </div>
          </div>
        </section>

        {/* 2. Galería de Productos */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Nuestras Salsas
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Cada salsa está elaborada con ingredientes frescos y recetas tradicionales
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {salsas.map((salsa) => (
                <article key={salsa.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift group">
                  <div className="relative h-48">
                    <ImageWrapper
                      src={salsa.imagen}
                      alt={`${salsa.nombre} casera artesanal`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      fallback="/placeholder.svg?height=192&width=400&text=Salsa"
                      placeholder={<HeroPlaceholder className="object-cover group-hover:scale-105 transition-transform duration-300" />}
                    />
                    {!salsa.disponible && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">No Disponible</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {salsa.nombre}
                    </h3>
                    <p className="text-neutral-600 mb-4 line-clamp-2">
                      {salsa.descripcion}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary-600">
                        ${salsa.precio.toLocaleString()}
                      </span>
                    </div>

                    <button
                      className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center space-x-2"
                      disabled={!salsa.disponible}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>Agregar al carrito</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Sección Narrativa */}
        <section className="py-16 bg-primary-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="prose prose-lg mx-auto">
              <blockquote className="text-2xl md:text-3xl italic font-serif text-neutral-800 leading-relaxed">
                "Nuestras salsas no son un anexo, son parte del ritual.
                <br />
                Se elaboran el mismo día, con ingredientes reales, sin conservantes,
                <br />
                para que puedas comer como en tu restaurante favorito, sin salir de casa."
              </blockquote>
            </div>
          </div>
        </section>

        {/* 4. Preguntas Frecuentes */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Preguntas Frecuentes
              </h2>
              <p className="text-lg text-neutral-600">
                Resolvemos tus dudas sobre nuestras salsas caseras
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-neutral-50 rounded-lg shadow-sm p-6 cursor-pointer group"
                >
                  <summary className="flex justify-between items-center font-bold text-neutral-900 text-lg">
                    {faq.pregunta}
                    <ChevronDown className="w-5 h-5 text-primary-600 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="mt-4 text-neutral-700 leading-relaxed">
                    {faq.respuesta}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 5. CTA de contacto */}
        <section className="py-16 bg-neutral-50 text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
              ¿Tenés otra consulta?
            </h2>
            <p className="text-lg text-neutral-700 mb-8">
              Nuestro equipo está listo para responder todas tus preguntas sobre nuestras salsas
            </p>
            <a
              href="https://wa.me/5493411234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#1DA851] transition-colors"
              aria-label="Contactar por WhatsApp"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contactanos por WhatsApp
            </a>
          </div>
        </section>

        {/* 6. Newsletter */}
        <section className="py-16 bg-primary-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Mantenete informada
            </h2>
            <p className="text-lg text-neutral-700 mb-8">
              Suscribite y recibí un 10% de descuento en tu primer pedido.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <label htmlFor="email-newsletter-salsas" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="email-newsletter-salsas"
                name="email"
                placeholder="Tu email"
                required
                className="flex-1 px-5 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-neutral-900"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-primary-900 text-white font-semibold rounded-lg hover:bg-primary-800 transition-colors flex items-center justify-center"
              >
                Suscribirme
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </>
  )
} 