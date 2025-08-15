import type { Metadata } from "next"
import Link from "next/link"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import { HeroPlaceholder } from "@/components/ui/ImagePlaceholder"
import { ArrowRight, Leaf, Award, Factory, ChevronRight } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"

export const metadata: Metadata = {
  title: "Pastas sin TACC Artesanales en Rosario | Paula Pastas",
  description:
    "Si estás buscando pastas sin gluten con sabor casero y gourmet en Rosario, llegaste al lugar indicado. En Paula Pastas nos importa acompañar tu mesa.",
  keywords: "pastas sin tacc, sin gluten, celíacos, pastas artesanales, rosario, delivery",
  openGraph: {
    title: "Pastas sin TACC Artesanales | Paula Pastas",
    description: "Pastas sin gluten con sabor casero y gourmet en Rosario.",
    images: [
      {
        url: "/placeholder.svg?height=600&width=1200",
        width: 1200,
        height: 600,
        alt: "Pastas sin TACC",
      },
    ],
    type: "website",
    locale: "es_AR",
  },
  alternates: {
    canonical: "https://comidacasera.com/pastas/sin-tacc",
  },
}

const faqs = [
  {
    question: "¿Tienen pastas sin TACC en este momento?",
    answer: "Por ahora no, pero estamos desarrollándolas y serán aptas para celíacos.",
  },
  {
    question: "¿Cuándo estarán disponibles?",
    answer: "Esperamos lanzarlas pronto. Suscribite para enterarte primero.",
  },
  {
    question: "¿Qué debo tener en cuenta al comprar productos sin TACC?",
    answer: "Al elegir pastas sin TACC, es fundamental verificar que estén elaboradas en un entorno libre de contaminación cruzada y también es importante revisar la lista de ingredientes, ya que algunos productos pueden no contener gluten en su composición pero sí estar expuestos a trazas. En Paula Pastas, por el momento no elaboramos productos sin TACC, ya que trabajamos exclusivamente con sémola de trigo.",
  },
  {
    question: "¿Van a tener cocina o línea de producción separada para sin TACC?",
    answer: "¡Sí! Consideramos fundamental tener una línea de producción aislada para asegurar la integridad de nuestros productos sin TACC.",
  },
]

export default async function PastasSinTaccPage() {
  // Obtener banner dinámico
  const banner = await FirebaseService.getPageBannerBySlug("sin-tacc")

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

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
              <span className="text-neutral-900 font-medium">Pastas sin TACC</span>
            </nav>
          </div>
        </div>

        {/* 1. ✅ SECCIÓN HERO / BANNER PRINCIPAL */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-primary-50">
          <div className="absolute inset-0 z-0">
            <ImageWrapper
              src={banner?.imageUrl || "/placeholder.svg?height=800&width=1200"}
              alt={banner?.title || "Pastas sin TACC artesanales"}
              fill
              className="object-cover opacity-70"
              priority={true}
              fallback="/placeholder.svg?height=800&width=1200&text=Sin+TACC"
              placeholder={<HeroPlaceholder className="object-cover opacity-70" />}
            />
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-neutral-900 mb-4">
              {banner?.title || "Pastas sin TACC artesanales en Rosario"}
            </h1>
            <p className="text-xl md:text-2xl text-neutral-700 max-w-3xl mx-auto">
              {banner?.subtitle || "Si estás buscando pastas sin gluten con sabor casero y gourmet en Rosario, llegaste al lugar indicado. En Paula Pastas nos importa acompañar tu mesa."}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* 2. ✅ Sección informativa (sin título) */}
          <section className="bg-white rounded-2xl shadow-lg p-8 mb-16 text-center max-w-4xl mx-auto">
            <p className="text-lg text-neutral-700 leading-relaxed">
              Sabemos lo difícil que puede ser encontrar pastas sin TACC en Rosario que no sacrifiquen sabor ni textura.
              En Paula Pastas apostamos por una cocina artesanal que combina calidad, creatividad y tradición.
            </p>
            <p className="text-lg text-neutral-700 leading-relaxed mt-4">
              Aunque actualmente no contamos con opciones certificadas sin TACC, estamos desarrollando nuevas recetas
              aptas para celíacos. Nos inspira la idea de llevar la experiencia de un plato de restaurante a tu casa,
              sin importar tus restricciones alimenticias.
            </p>
          </section>

          {/* 3. ✅ Sección de suscripción y alternativas */}
          <section className="bg-primary-50 rounded-2xl p-8 mb-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Si estás buscando productos sin gluten
            </h2>
            <p className="text-lg text-neutral-700 mb-8">
              Estamos trabajando en una línea sin TACC segura y deliciosa. Si querés que te avisemos cuando esté lista,
              dejanos tu email.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
              <label htmlFor="email-sintacc" className="sr-only">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email-sintacc"
                name="email"
                placeholder="Correo electrónico"
                required
                className="flex-1 px-5 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-neutral-900"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-primary-900 text-white font-semibold rounded-lg hover:bg-primary-800 transition-colors"
              >
                Avisame cuando estén disponibles
              </button>
            </form>
            <p className="text-neutral-600 mb-6">
              Mientras tanto, te invitamos a conocer nuestras pastas artesanales con ingredientes seleccionados y
              sabores únicos, ideales para sorprender en cualquier ocasión.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-neutral-900 text-neutral-900 font-semibold rounded-lg hover:bg-neutral-900 hover:text-white transition-colors w-full sm:max-w-xs"
              >
                Ir al inicio
              </Link>
              <Link
                href="/pastas"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors w-full sm:max-w-xs"
              >
                Ver productos artesanales
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* 4. ✅ Sección de información extra (beneficios) */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Ingredientes naturales</h3>
                <p className="text-neutral-600">
                  Cada ingrediente especialmente seleccionado para alcanzar el máximo nivel gastronómico sin utilizar
                  conservantes ni saborizantes.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Fresco como recién hecho</h3>
                <p className="text-neutral-600">
                  Se congelan el mismo día de su elaboración para preservar lo artesanal.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Factory className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Fábrica local</h3>
                <p className="text-neutral-600">
                  Somos una casa de pastas rosarina que entrega en toda la ciudad, Funes, VGG, Fisherton, Pueblo Esther
                  y más.
                </p>
              </div>
            </div>
          </section>

          {/* 5. ✅ Preguntas frecuentes */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-lg text-neutral-600">
                Resolvemos tus dudas más comunes sobre nuestras pastas sin TACC.
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
        </div>
      </div>
    </>
  )
}
