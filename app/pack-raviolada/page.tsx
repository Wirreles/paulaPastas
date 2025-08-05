import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, MessageCircle, ArrowRight, ShoppingBag, Minus, Plus, Package, Gift, Clock, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Packs y Combos Artesanales | Paula Pastas - Rosario",
  description: "Proba más sabores, compartí más momentos. Packs ideales para cenas con amigos, degustaciones en pareja o para regalar. Combos artesanales con menor precio por unidad.",
  keywords: "packs pastas, combos artesanales, raviolada, cenas compartidas, regalos gastronómicos, paula pastas, rosario, delivery packs",
  openGraph: {
    title: "Packs y Combos Artesanales | Paula Pastas",
    description: "Packs ideales para cenas con amigos, degustaciones en pareja o para regalar. Menor precio por unidad y siempre listos para sorprender.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Packs y combos artesanales Paula Pastas",
      },
    ],
    type: "website",
    locale: "es_AR",
  },
  alternates: {
    canonical: "https://paulapastas.com/pack-raviolada",
  },
}

export default function PackRavioladaPage() {
  // JSON-LD para datos estructurados
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Packs y Combos Artesanales",
    description: "Packs ideales para cenas con amigos, degustaciones en pareja o para regalar",
    url: "https://paulapastas.com/pack-raviolada",
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
      ],
    },
  }

  // Datos estáticos de packs
  const packs = [
    {
      id: "pack-raviolada-clasica",
      nombre: "Pack Raviolada Clásica",
      descripcion: "Ravioles de osobuco, sorrentinos de jamón y queso, salsa pomodoro y bolognesa",
      precio: 8500,
      precioOriginal: 10000,
      imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
      disponible: true,
      porciones: "4-6 personas"
    },
    {
      id: "pack-romantico",
      nombre: "Pack Romántico",
      descripcion: "Sorrentinos de langostinos, ravioles de ricotta, salsa cremosa y pesto",
      precio: 7200,
      precioOriginal: 9000,
      imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop",
      disponible: true,
      porciones: "2 personas"
    },
    {
      id: "pack-familiar",
      nombre: "Pack Familiar",
      descripcion: "Lasaña, ñoquis, ravioles variados, salsas surtidas y pan casero",
      precio: 12000,
      precioOriginal: 15000,
      imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
      disponible: true,
      porciones: "6-8 personas"
    },
    {
      id: "pack-gourmet",
      nombre: "Pack Gourmet",
      descripcion: "Sorrentinos de cordero, ravioles de hongos, salsas gourmet y vino tinto",
      precio: 9500,
      precioOriginal: 12000,
      imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop",
      disponible: true,
      porciones: "4 personas"
    }
  ]

  // Beneficios de los packs
  const beneficios = [
    {
      icon: Package,
      titulo: "Menor precio por unidad",
      descripcion: "Ahorrá dinero comprando en pack. Cada unidad sale más económica que comprando por separado."
    },
    {
      icon: Clock,
      titulo: "Ideal para planear comidas",
      descripcion: "Sin decidir en el momento. Tené todo listo para cuando quieras cocinar sin complicaciones."
    },
    {
      icon: Gift,
      titulo: "Perfecto para regalar",
      descripcion: "Pensados para regalar a amantes de la pasta artesanal. Un regalo que siempre sorprende."
    },
    {
      icon: Users,
      titulo: "Siempre listos para sorprender",
      descripcion: "Se conservan congelados – siempre listos para sorprender a familia y amigos."
    }
  ]

  // Datos de FAQ
  const faqs = [
    {
      pregunta: "¿Cuántas porciones rinde cada combo?",
      respuesta: "Cada pack está diseñado para diferentes cantidades de personas. El Pack Clásico rinde 4-6 porciones, el Romántico para 2 personas, el Familiar para 6-8 personas y el Gourmet para 4 personas."
    },
    {
      pregunta: "¿Hacen envíos a mi zona?",
      respuesta: "Realizamos envíos a Rosario, Funes, Fisherton, Villa Gobernador Gálvez, Alvear y zonas cercanas. Si tenés dudas sobre tu barrio, contactanos por WhatsApp."
    },
    {
      pregunta: "¿Cuánto duran los packs en el freezer?",
      respuesta: "Todos nuestros packs duran hasta 30 días en el freezer manteniendo su calidad y sabor. Te recomendamos consumirlos dentro de este plazo."
    },
    {
      pregunta: "¿Puedo personalizar un pack?",
      respuesta: "¡Por supuesto! Podés crear tu pack personalizado eligiendo tus pastas y salsas favoritas. Contactanos por WhatsApp para armar tu combo ideal."
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
              <span className="text-neutral-900 font-medium">Packs</span>
            </nav>
          </div>
        </div>

        {/* 1. Banner Principal */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=800&fit=crop"
              alt="Packs y combos artesanales de pastas"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              Nuestros combos artesanales
            </h1>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl text-neutral-100 leading-relaxed mb-4">
                Proba más sabores, compartí más momentos.
              </p>
              <p className="text-lg md:text-xl text-neutral-200">
                Packs ideales para cenas con amigos, degustaciones en pareja o para regalar.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Sección de Productos */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Nuestros Packs
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Combinaciones perfectas para diferentes ocasiones y cantidades de personas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {packs.map((pack) => (
                <article key={pack.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift group border border-neutral-200">
                  <div className="relative h-64">
                    <Image
                      src={pack.imagen}
                      alt={`${pack.nombre} artesanal`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!pack.disponible && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">No Disponible</span>
                      </div>
                    )}
                    {pack.precioOriginal > pack.precio && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {Math.round(((pack.precioOriginal - pack.precio) / pack.precioOriginal) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {pack.nombre}
                    </h3>
                    <p className="text-neutral-600 mb-4 line-clamp-2">
                      {pack.descripcion}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-3xl font-bold text-primary-600">
                          ${pack.precio.toLocaleString()}
                        </span>
                        {pack.precioOriginal > pack.precio && (
                          <span className="text-lg text-neutral-400 line-through ml-2">
                            ${pack.precioOriginal.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                        {pack.porciones}
                      </span>
                    </div>

                    {/* Control de cantidad */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <button className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors">
                        <Minus className="w-4 h-4 text-neutral-700" />
                      </button>
                      <span className="text-lg font-semibold text-neutral-900 w-8 text-center">1</span>
                      <button className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors">
                        <Plus className="w-4 h-4 text-neutral-700" />
                      </button>
                    </div>

                    <button
                      className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center space-x-2"
                      disabled={!pack.disponible}
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

        {/* 3. Sección Explicativa */}
        <section className="py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                ¿Por qué elegir nuestros combos?
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Descubrí las ventajas de nuestros packs artesanales
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {beneficios.map((beneficio, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover-lift">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <beneficio.icon className="w-6 h-6 text-primary-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-3">
                        {beneficio.titulo}
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        {beneficio.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Preguntas Frecuentes */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-lg text-neutral-600">
                Resolvemos las dudas más comunes sobre nuestros combos y el proceso de compra
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
              Nuestro equipo está listo para ayudarte a elegir el pack perfecto para tu ocasión
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
              <label htmlFor="email-newsletter-packs" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="email-newsletter-packs"
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