import type { Metadata } from "next"
import { FirebaseService } from "@/lib/firebase-service"
import { STATIC_FAQS, STATIC_REVIEWS } from "@/lib/constants"

// Renderizado dinámico en cada request para que los productos destacados
// siempre reflejen el estado actual (sin cache estático de Next.js en build/deploy)

// Impotar componentes del Home
import HeroSection from "@/components/home/HeroSection"
import FeaturedProducts from "@/components/home/FeaturedProducts"
import CategoriesSection from "@/components/home/CategoriesSection"
import InfoSection from "@/components/home/InfoSection"
import ContactCTA from "@/components/home/ContactCTA"
import { ImageDebugInfo } from "@/components/ui/ImageDebugInfo"

import dynamic from 'next/dynamic'

// Secciones no críticas (Carga diferida / Lazy Load)
const GallerySection = dynamic(() => import("@/components/home/GallerySection"))
const WhyChooseUs = dynamic(() => import("@/components/home/WhyChooseUs"))
const ReviewsCarousel = dynamic(() => import("@/components/home/ReviewsCarousel"))
const QualitySection = dynamic(() => import("@/components/home/QualitySection"))
const FaqAccordion = dynamic(() => import("@/components/home/FaqAccordion"))
const NewsletterForm = dynamic(() => import("@/components/ui/NewsletterForm").then(mod => mod.NewsletterForm))

// Metadatos SEO (Reemplaza next/head)
export const metadata: Metadata = {
  title: "Paula Pastas - Pastas Artesanales en Rosario | Delivery Premium",
  description: "Las mejores pastas artesanales de Rosario. Ravioles, sorrentinos, lasagna y más. Delivery rápido con cadena de frío. ¡Pedí online ahora!",
  keywords: ["pastas artesanales", "rosario", "delivery", "ravioles", "sorrentinos", "lasagna", "pastas caseras", "paula pastas"],
  openGraph: {
    title: "Paula Pastas - Pastas Artesanales en Rosario",
    description: "Las mejores pastas artesanales de Rosario. Delivery rápido con cadena de frío. ¡Pedí online ahora!",
    url: "https://paulapastas.com",
    type: "website",
    images: [
      {
        url: "https://paulapastas.com/home-sections/hero-main-image.webp",
        width: 1200,
        height: 630,
        alt: "Paula Pastas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paula Pastas - Pastas Artesanales en Rosario",
    description: "Las mejores pastas artesanales de Rosario. Delivery rápido con cadena de frío.",
    images: ["https://paulapastas.com/home-sections/hero-main-image.webp"],
  },
}

// Serializa un objeto de Firestore a plain object eliminando Timestamps y valores no serializables.
// Next.js 15 lanza error al pasar objetos con toJSON() (como Timestamp) a Client Components.
function serializeProducto(p: any) {
  return {
    id: p.id ?? null,
    nombre: p.nombre ?? "",
    slug: p.slug ?? "",
    descripcion: p.descripcion ?? "",
    descripcionAcortada: p.descripcionAcortada ?? "",
    precio: p.precio ?? 0,
    categoria: p.categoria ?? "",
    subcategoria: p.subcategoria ?? "",
    imagen: p.imagen ?? "",
    ingredientes: p.ingredientes ?? [],
    disponible: p.disponible ?? true,
    destacado: p.destacado ?? false,
    porciones: p.porciones ?? null,
    orden: p.orden ?? null,
    comoPreparar: p.comoPreparar ?? null,
    historiaPlato: p.historiaPlato ?? null,
    preguntasFrecuentes: p.preguntasFrecuentes ?? [],
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    seoKeywords: p.seoKeywords ?? [],
    // fechaCreacion y fechaActualizacion son Timestamps de Firestore (tienen toJSON())
    // Next.js 15 no puede serializarlos para pasarlos a Client Components → se omiten
  }
}

export default async function HomePage() {
  // Fetch de datos en el Servidor
  let productosDestacados: any[] = []
  let reviewsDestacadas = []

  try {
    const raw = await FirebaseService.getProductosDestacados()
    // JSON.parse/stringify: convierte cualquier objeto no serializable (Timestamps de Firestore,
    // class instances, etc.) a plain objects. Next.js 15 requiere plain objects para pasar
    // datos de Server Components a Client Components.
    productosDestacados = JSON.parse(JSON.stringify(raw))

    // Intentar cargar reseñas destacadas
    const allReviews = await FirebaseService.getAllReviews()
    reviewsDestacadas = allReviews.filter(review => review.aprobada && review.destacada)
  } catch (error) {
    console.error("❌ Error fetching home data:", error)
    // Fallback simple si falla Firebase
  }

  // Si no hay reseñas en Firebase, usar las estáticas (serializables)
  const finalReviews = reviewsDestacadas.length > 0
    ? reviewsDestacadas.map(r => ({
      id: r.id || "0",
      name: r.name || r.userName || "Cliente",
      rating: r.rating || 5,
      testimonial: r.testimonial || ""
    }))
    : STATIC_REVIEWS

  // JSON-LD para SEO estructurado
  const reviewsJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Paula Pastas",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "250",
    },
    review: finalReviews.map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.name },
      reviewRating: { "@type": "Rating", ratingValue: review.rating },
      reviewBody: review.testimonial,
    })),
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: STATIC_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }

  // Hero image para el preloader
  const heroImage = "/home-sections/hero-main-image.webp"
  const imagesToPreload = [heroImage]

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />


      {/* Secciones del Home */}
      <HeroSection />

      <FeaturedProducts productos={productosDestacados.slice(0, 6)} />

      <CategoriesSection />

      <InfoSection />

      <GallerySection />

      <WhyChooseUs />

      <ReviewsCarousel reviews={finalReviews.slice(0, 6)} />

      <QualitySection />

      <FaqAccordion faqs={STATIC_FAQS} />

      <ContactCTA />

      <section className="py-16 bg-primary-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterForm />
        </div>
      </section>

      {/* Debug Info solo en Dev */}
      {process.env.NODE_ENV === 'development' && (
        <ImageDebugInfo src={heroImage} alt="Hero" componentName="Home Hero" />
      )}
    </div>
  )
}
