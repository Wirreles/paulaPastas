import type { Metadata } from "next"
import { FirebaseService } from "@/lib/firebase-service"
import { STATIC_FAQS, STATIC_REVIEWS } from "@/lib/constants"

// Impotar componentes del Home
import HeroSection from "@/components/home/HeroSection"
import FeaturedProducts from "@/components/home/FeaturedProducts"
import CategoriesSection from "@/components/home/CategoriesSection"
import InfoSection from "@/components/home/InfoSection"
import GallerySection from "@/components/home/GallerySection"
import WhyChooseUs from "@/components/home/WhyChooseUs"
import ReviewsCarousel from "@/components/home/ReviewsCarousel"
import QualitySection from "@/components/home/QualitySection"
import FaqAccordion from "@/components/home/FaqAccordion"
import ContactCTA from "@/components/home/ContactCTA"
import { NewsletterForm } from "@/components/ui/NewsletterForm"
import { ImagePreloader } from "@/components/ui/ImagePreloader"
import { ImageDebugInfo } from "@/components/ui/ImageDebugInfo"

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

export default async function HomePage() {
  // Fetch de datos en el Servidor
  let productosDestacados = []
  let reviewsDestacadas = []

  try {
    // Intentar cargar productos destacados
    productosDestacados = await FirebaseService.getProductosDestacados()

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

      <ImagePreloader images={imagesToPreload} priority={true} />

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
