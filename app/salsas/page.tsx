import type { Metadata } from "next"
import { FirebaseService } from "@/lib/firebase-service"
import ProductCard from "@/components/ProductCard"
import SalsasHero from "@/components/landing/SalsasHero"
import SalsasNarrative from "@/components/landing/SalsasNarrative"
import SalsasFAQ from "@/components/landing/SalsasFAQ"
import WhatsAppCTA from "@/components/landing/WhatsAppCTA"
import NewsletterForm from "@/components/landing/NewsletterForm"

export const metadata: Metadata = {
  title: "Salsas Caseras Artesanales | Comida Casera",
  description:
    "Descubre nuestras salsas caseras, hechas con ingredientes frescos y sin conservantes. Perfectas para acompañar tus pastas.",
  keywords: ["salsas caseras", "salsas artesanales", "salsas para pasta", "comida casera", "rosario"],
}

export default async function SalsasPage() {
  const salsas = await FirebaseService.getProductos("salsas")

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sección 1: Banner Principal */}
      <SalsasHero />

      {/* Sección 2: Listado de productos */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-neutral-900 mb-12">Nuestras Salsas</h2>
          {salsas.length === 0 ? (
            <p className="text-center text-neutral-600 text-lg">
              No hay salsas disponibles en este momento. ¡Vuelve pronto!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {salsas.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sección 3: Texto narrativo */}
      <SalsasNarrative />

      {/* Sección 4: Preguntas Frecuentes (FAQ) */}
      <SalsasFAQ />

      {/* Sección 5: Contacto rápido (CTA WhatsApp) */}
      <WhatsAppCTA />

      {/* Sección 6: Suscripción al newsletter */}
      <NewsletterForm />
    </div>
  )
}
