import type { Metadata } from "next"
import { Suspense } from "react"
import { FirebaseService } from "@/lib/firebase-service"
import { STATIC_FAQS, STATIC_REVIEWS } from "@/lib/constants"

// Componentes del Home — Hero es estático, se renderiza INMEDIATAMENTE
import HeroSection from "@/components/home/HeroSection"
import CategoriesSection from "@/components/home/CategoriesSection"
import InfoSection from "@/components/home/InfoSection"
import ContactCTA from "@/components/home/ContactCTA"

import dynamic from 'next/dynamic'

// Secciones no críticas (Carga diferida / Lazy Load)
const FeaturedProducts = dynamic(() => import("@/components/home/FeaturedProducts"))
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

// Componente async para datos de Firebase — se stream con Suspense
async function HomeData() {
  let productosDestacados: any[] = []
  let reviewsDestacadas: any[] = []

  try {
    // 🔥 Paralelizar queries — antes eran secuenciales
    const [rawProducts, allReviews] = await Promise.all([
      FirebaseService.getProductosDestacados(),
      FirebaseService.getAllReviews(),
    ])

    productosDestacados = JSON.parse(JSON.stringify(rawProducts))
    reviewsDestacadas = allReviews.filter((review: any) => review.aprobada && review.destacada)
  } catch (error) {
    console.error("❌ Error fetching home data:", error)
  }

  const finalReviews = reviewsDestacadas.length > 0
    ? reviewsDestacadas.map((r: any) => ({
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
    review: finalReviews.map((review: any) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.name },
      reviewRating: { "@type": "Rating", ratingValue: review.rating },
      reviewBody: review.testimonial,
    })),
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: STATIC_FAQS.map((faq: any) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <FeaturedProducts productos={productosDestacados.slice(0, 6)} />

      <ReviewsCarousel reviews={finalReviews.slice(0, 6)} />
    </>
  )
}

// Fallback mientras carga Firebase data
function HomeDataFallback() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-primary-100 rounded w-64 mx-auto" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-primary-50 rounded-lg h-64" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* 🔥 Hero se renderiza INMEDIATAMENTE — sin esperar Firebase */}
      <HeroSection />

      {/* Firebase data se carga en paralelo via Suspense streaming */}
      <Suspense fallback={<HomeDataFallback />}>
        <HomeData />
      </Suspense>

      {/* Secciones estáticas que no necesitan Firebase */}
      <CategoriesSection />
      <InfoSection />

      {/* Secciones lazy-loaded */}
      <GallerySection />
      <WhyChooseUs />
      <QualitySection />
      <FaqAccordion faqs={STATIC_FAQS} />
      <ContactCTA />

      <section className="py-16 bg-primary-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
}
