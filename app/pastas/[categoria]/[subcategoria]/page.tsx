import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ChevronRight, MessageCircle } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import ProductCard from "@/components/ProductCard"

interface SubcategoriaPageProps {
  params: {
    categoria: string
    subcategoria: string
  }
}

// FAQs específicas para ravioles
const raviolesFaqs = [
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
      "Nuestros ravioles son aptos para: hervido, frito, salteado, horno o en air fryer. Con cada compra incluimos nuestro manual de consejos del chef, para que los disfrutes al máximo con cualquier técnica.",
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

const subcategoriaData = {
  rellenas: {
    lasana: {
      nombre: "Lasañas Caseras",
      descripcion:
        "Lasañas artesanales con capas perfectas de pasta fresca, rellenos caseros y quesos de primera calidad. Listas para hornear en tu casa.",
      imagen: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=1200&h=600&fit=crop",
    },
    ravioles: {
      nombre: "Ravioles Artesanales",
      descripcion:
        "Ravioles elaborados con masa fresca y rellenos tradicionales. Cada pieza es trabajada a mano siguiendo recetas familiares de generaciones.",
      imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=600&fit=crop",
    },
    sorrentinos: {
      nombre: "Sorrentinos Caseros",
      descripcion:
        "Sorrentinos grandes con rellenos abundantes y sabrosos. Perfectos para compartir en familia con tus salsas favoritas.",
      imagen: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1200&h=600&fit=crop",
    },
  },
  "sin-relleno": {
    noquis: {
      nombre: "Ñoquis de Papa",
      descripcion:
        "Ñoquis tradicionales elaborados con papas frescas y la receta secreta de la nonna. Suaves, esponjosos y llenos de sabor.",
      imagen: "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=1200&h=600&fit=crop",
    },
    fideos: {
      nombre: "Fideos Frescos",
      descripcion:
        "Fideos elaborados diariamente con harina 00 y huevos de granja. La base perfecta para cualquier salsa.",
      imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&h=600&fit=crop",
    },
    "ravioles-fritos": {
      nombre: "Ravioles Fritos", // Nuevo
      descripcion:
        "Crocantes por fuera, cremosos por dentro. Perfectos para picadas, encuentros o para darte un gusto diferente.", // Nuevo
      imagen: "/placeholder.svg?height=1200&width=600", // Nuevo
    },
  },
}

export async function generateMetadata({ params }: SubcategoriaPageProps): Promise<Metadata> {
  const { categoria, subcategoria } = await params
  const data = subcategoriaData[categoria as keyof typeof subcategoriaData]?.[subcategoria as keyof any]

  if (!data) {
    return {
      title: "Subcategoría no encontrada | Comida Casera",
      description: "La subcategoría solicitada no existe.",
    }
  }

  return {
    title: `${data.nombre} en Rosario | Delivery | Comida Casera`,
    description: data.descripcion,
    keywords: `${data.nombre.toLowerCase()}, ${categoria}, pastas caseras, artesanales, rosario, delivery`,
    openGraph: {
      title: `${data.nombre} | Comida Casera`,
      description: data.descripcion,
      images: [{ url: data.imagen, width: 1200, height: 600, alt: data.nombre }],
      type: "website",
      locale: "es_AR",
    },
    alternates: {
      canonical: `https://comidacasera.com/pastas/${categoria}/${subcategoria}`,
    },
  }
}

async function getProductosPorSubcategoria(categoria: string, subcategoria: string) {
  try {
    console.log(`🔍 Página solicitando productos para: ${categoria}/${subcategoria}`)
    const productos = await FirebaseService.getProductosPorSubcategoria(categoria, subcategoria)
    console.log(`📊 Página recibió ${productos.length} productos`)
    return productos
  } catch (error) {
    console.error("❌ Error en página al obtener productos:", error)
    return []
  }
}

async function getBannerForSubcategoria(categoria: string, subcategoria: string) {
  try {
    const banner = await FirebaseService.getPageBannerBySlug(`${categoria}/${subcategoria}`)
    return banner
  } catch (error) {
    console.error("Error fetching banner:", error)
    return null
  }
}

export default async function SubcategoriaPage({ params }: SubcategoriaPageProps) {
  const { categoria, subcategoria } = await params
  const data = subcategoriaData[categoria as keyof typeof subcategoriaData]?.[subcategoria as keyof any]

  if (!data) {
    notFound()
  }

  const productos = await getProductosPorSubcategoria(categoria, subcategoria)
  const banner = await getBannerForSubcategoria(categoria, subcategoria)

  // JSON-LD para datos estructurados
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: data.nombre,
    description: data.descripcion,
    url: `https://comidacasera.com/pastas/${categoria}/${subcategoria}`,
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
          name: data.nombre,
          item: `https://comidacasera.com/pastas/${categoria}/${subcategoria}`,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: productos.length,
      itemListElement: productos.map((producto, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: producto.nombre,
          description: producto.descripcion,
          image: producto.imagen,
          offers: {
            "@type": "Offer",
            price: producto.precio,
            priceCurrency: "ARS",
            availability: producto.disponible ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
        },
      })),
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
              <span className="text-neutral-900 font-medium">{data.nombre}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={banner?.imageUrl || data.imagen || "/placeholder.svg"}
              alt={banner?.title || `${data.nombre} caseros artesanales`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {banner?.title || data.nombre}
            </h1>
            <p className="text-lg md:text-xl text-neutral-200 max-w-3xl mx-auto">
              {banner?.subtitle || data.descripcion}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href={`/pastas/${categoria}`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a{" "}
              {categoria === "rellenas" ? "Pastas Rellenas" : categoria === "sin-relleno" ? "Sin Relleno" : "Sin TACC"}
            </Link>
          </div>

          {/* Productos */}
          <section>
            <h2 className="font-display text-2xl font-bold text-neutral-900 mb-8">Nuestros {data.nombre}</h2>

            <Suspense
              fallback={
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-neutral-600">Cargando productos...</p>
                </div>
              }
            >
              {productos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {productos.map((producto) => (
                    <ProductCard key={producto.id} producto={producto} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🍝</span>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">Próximamente</h3>
                  <p className="text-neutral-600">Estamos preparando deliciosos {data.nombre.toLowerCase()} para vos</p>
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm text-neutral-600">
                    <p className="font-medium">Debug Info:</p>
                    <p>Categoría: {categoria}</p>
                    <p>Subcategoría: {subcategoria}</p>
                    <p>Productos encontrados: {productos.length}</p>
                    <p>Revisa la consola del navegador para más detalles</p>
                  </div>
                </div>
              )}
            </Suspense>
          </section>

          {/* NUEVA SECCIÓN: "¿Por qué nuestros ravioles son diferentes?" - Solo para ravioles */}
          {subcategoria === "ravioles" && (
            <section className="mt-16 bg-primary-50 rounded-2xl shadow-lg p-8 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
                ¿Por qué nuestros ravioles son diferentes?
              </h2>
              <p className="text-lg text-neutral-600 mb-8">
                Descubrí lo que hace únicos a nuestros ravioles artesanales.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Calidad artesanal
                    </h3>
                    <p className="text-neutral-700 leading-relaxed">
                      Porque no se trata solo de pasta. Cocinamos a fuego lento los rellenos como si fueran el plato principal: ossobuco braseado, carré glaseado, espinaca cremosa con crocante de nuez.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Elaboración tradicional
                    </h3>
                    <p className="text-neutral-700 leading-relaxed">
                      Cada raviol está elaborado artesanalmente en Rosario, con sémola seleccionada y sin conservantes. Y lo mejor: en menos de 10 minutos, tenes un plato que podrías servir en un restaurante... pero en tu casa.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* NUEVA SECCIÓN: Preguntas Frecuentes - Solo para ravioles */}
          {subcategoria === "ravioles" && (
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
                {raviolesFaqs.map((faq, index) => (
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
          )}

          {/* NUEVA SECCIÓN: "¿Tenés otra consulta?" - Solo para ravioles */}
          {subcategoria === "ravioles" && (
            <section className="mt-16 bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">¿Tenés otra consulta?</h2>
                <p className="text-lg text-neutral-600 mb-8 max-w-xl mx-auto leading-relaxed">
                  Te ayudamos por WhatsApp. Nuestro equipo está listo para responder todas tus preguntas sobre nuestros ravioles artesanales.
                </p>
                <a
                  href="https://wa.me/5493411234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#1DA851] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  aria-label="Chatear por WhatsApp con Paula Pastas"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Hablemos por WhatsApp
                </a>
              </div>
            </section>
          )}

          {/* NUEVA SECCIÓN: "Mantente informado" - Solo para ravioles */}
          {subcategoria === "ravioles" && (
            <section className="mt-16 bg-primary-50 rounded-2xl shadow-lg p-8 text-center">
              <div className="max-w-3xl mx-auto">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">Mantente informado</h2>
                <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Suscribite a nuestro newsletter y recibí un 10% de descuento en tu primer pedido de ravioles artesanales.
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
                    className="flex-1 px-5 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-neutral-900 transition-all duration-200 shadow-sm"
                  />
                  <button
                    type="submit"
                    className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Suscribirme
                  </button>
                </form>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
