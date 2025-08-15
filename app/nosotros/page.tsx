import type { Metadata } from "next"
import Link from "next/link"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import { HeroPlaceholder } from "@/components/ui/ImagePlaceholder"
import { Heart, Clock, MapPin, Star, Instagram, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Sobre Nosotros - Paula Pastas | Artesanía, Sabor y Memoria en Rosario",
  description: "Conocé la historia de Paula Pastas. Nacimos en Rosario con una idea simple: que una buena pasta puede transformar un día cualquiera en un momento especial. Recetas familiares, ingredientes nobles y espíritu artesanal.",
  keywords: "paula pastas, sobre nosotros, historia, rosario, pastas artesanales, recetas familiares, cocina casera, delivery rosario",
  openGraph: {
    title: "Sobre Nosotros - Paula Pastas | Artesanía y Sabor en Rosario",
    description: "Descubrí la historia detrás de Paula Pastas. Recetas familiares, ingredientes nobles y el espíritu artesanal que hace únicas nuestras pastas en Rosario.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Paula Pastas - Sobre Nosotros",
      },
    ],
    type: "website",
    locale: "es_AR",
  },
  alternates: {
    canonical: "https://paulapastas.com/nosotros",
  },
}

export default function NosotrosPage() {
  // JSON-LD para datos estructurados
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Paula Pastas",
    description: "Pastas artesanales elaboradas con recetas familiares e ingredientes nobles en Rosario",
    url: "https://paulapastas.com",
    logo: "https://paulapastas.com/pplog2.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Rosario",
      addressRegion: "Santa Fe",
      addressCountry: "AR",
    },
    areaServed: [
      "Villa Gobernador Gálvez",
      "Funes", 
      "Alvear",
      "Fisherton",
      "Zona Sur de Rosario"
    ],
    foundingDate: "2020",
    founder: {
      "@type": "Person",
      name: "Paula",
    },
    sameAs: [
      "https://instagram.com/paulapastas"
    ]
  }

  const valores = [
    {
      icon: Heart,
      titulo: "Sabores honestos",
      descripcion: "Solo usamos ingredientes reales, sin atajos. Pastas que te hablan al alma."
    },
    {
      icon: Clock,
      titulo: "Hecho como antes, pensado como hoy",
      descripcion: "Artesanía que respeta los tiempos y técnicas, con un toque contemporáneo."
    },
    {
      icon: MapPin,
      titulo: "Cerca tuyo",
      descripcion: "Somos una marca local con mirada de autor. Rosario es nuestra cocina."
    },
    {
      icon: Star,
      titulo: "Cada bocado tiene intención",
      descripcion: "Queremos que cenes como en tu restaurante favorito, sin salir de casa."
    }
  ]

  const zonasCobertura = [
    "Villa Gobernador Gálvez",
    "Funes", 
    "Alvear",
    "Fisherton",
    "Zona Sur de Rosario",
    "Centro de Rosario",
    "Zona Oeste"
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
              <span className="text-neutral-900 font-medium">Sobre Nosotros</span>
            </nav>
          </div>
        </div>

        {/* 1. Hero Section */}
        <section className="relative py-20 lg:py-32 bg-gradient-to-b from-primary-50 to-primary-100">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=800&fit=crop')] bg-cover bg-center opacity-10"></div>
          <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-8 leading-tight">
              Somos Paula Pastas
            </h1>
            <p className="text-xl md:text-2xl text-primary-700 font-medium">
              Artesanía, sabor y memoria en cada bocado
            </p>
          </div>
        </section>

        {/* 2. Párrafo de apertura */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                  El alma del proyecto
                </h2>
                <div className="prose prose-lg text-neutral-700 leading-relaxed">
                  <p className="text-xl mb-6">
                    Nacimos con una idea simple: que una buena pasta puede transformar un día cualquiera en un momento especial.
                  </p>
                  <p className="text-lg mb-6">
                    En Paula Pastas combinamos recetas familiares, ingredientes nobles y un espíritu inquieto que busca reinventar lo clásico sin perder la raíz artesanal.
                  </p>
                  <p className="text-lg font-medium text-primary-700">
                    Desde Rosario, para tu mesa.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                  <ImageWrapper
                    src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=600&fit=crop"
                    alt="Cocina casera con manos trabajando masa fresca"
                    fill
                    className="object-cover"
                    fallback="/placeholder.svg?height=600&width=600&text=Cocina"
                    placeholder={<HeroPlaceholder className="object-cover" />}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Nuestra filosofía / valores */}
        <section className="py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Nuestra filosofía
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Los valores que guían cada decisión en nuestra cocina
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {valores.map((valor, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover-lift">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <valor.icon className="w-6 h-6 text-primary-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-3">
                        {valor.titulo}
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        {valor.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Mini historia / inspiración personal */}
        <section className="py-16 bg-primary-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto bg-primary-200 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-primary-700" />
              </div>
            </div>
            <div className="prose prose-lg mx-auto text-neutral-700">
              <p className="text-xl italic mb-6 font-serif">
                El proyecto nació en casa, entre ravioladas en familia y sobremesas con pan casero.
              </p>
              <p className="text-lg mb-6">
                El nombre "Paula" honra a una mujer fuerte que cocinaba con amor y elegancia.
              </p>
              <p className="text-lg font-medium text-primary-700">
                Hoy seguimos ese legado.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Propuesta de valor */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                  Lo que ofrecemos
                </h2>
                <div className="space-y-6">
                  <p className="text-lg text-neutral-700">
                    Ravioles, sorrentinos, lasagna y más. Congelados sin perder textura. Listos en minutos.
                  </p>
                  <p className="text-lg text-neutral-700">
                    Sabores únicos como ossobuco al malbec o cordero campestre.
                  </p>
                  <p className="text-xl font-semibold text-primary-700">
                    ¿El resultado? Una experiencia gourmet sin esfuerzo.
                  </p>
                  
                  <div className="mt-8 space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      <span className="text-neutral-700">Ingredientes frescos y nobles</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      <span className="text-neutral-700">Recetas familiares tradicionales</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      <span className="text-neutral-700">Elaboración artesanal diaria</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      <span className="text-neutral-700">Delivery rápido y confiable</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                  <ImageWrapper
                    src="https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=600&h=450&fit=crop"
                    alt="Plato de pasta artesanal emplatado"
                    fill
                    className="object-cover"
                    fallback="/placeholder.svg?height=450&width=600&text=Pasta"
                    placeholder={<HeroPlaceholder className="object-cover" />}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Presencia local y compromiso */}
        <section className="py-16 bg-neutral-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Presencia local y compromiso
              </h2>
              <p className="text-lg text-neutral-600">
                Desde nuestra cocina en Rosario llegamos a cada rincón de la ciudad y alrededores
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-bold text-neutral-900 mb-4">Zonas de cobertura:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {zonasCobertura.map((zona, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                        <span className="text-neutral-700">{zona}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-lg text-neutral-700 leading-relaxed">
                  Nos mueve el deseo de que más personas vivan el ritual de una buena comida, sin complicaciones.
                </p>
                <p className="text-lg text-neutral-700 leading-relaxed mt-4">
                  Cada entrega es una oportunidad de llevar un poco de nuestra pasión culinaria a tu mesa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Call To Action final */}
        <section className="py-16 bg-primary-100">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
              ¿Querés conocernos más?
            </h2>
            <p className="text-lg text-neutral-700 mb-8 max-w-2xl mx-auto">
              Explorá nuestras pastas o seguinos en Instagram para ver cómo se viven los "momentos Paula" en otras mesas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pastas"
                className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Ver Productos
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="https://instagram.com/paulapastas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-[#E4405F] text-white font-semibold rounded-lg hover:bg-[#C13584] transition-colors"
              >
                <Instagram className="w-5 h-5 mr-2" />
                Seguinos en Instagram
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
} 