import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, MessageCircle, ArrowRight, Truck, Clock, MapPin, Package } from "lucide-react"

export const metadata: Metadata = {
  title: "Delivery de Pastas Artesanales | Paula Pastas - Bialet Massé y Punilla",
  description: "De nuestra cocina artesanal a tu mesa, sin demoras ni complicaciones. Enviamos nuestras pastas congeladas premium con cadena de frío segura y horarios flexibles en Bialet Massé, Carlos Paz, Cosquín y Valle de Punilla.",
  keywords: "delivery pastas, delivery bialet masse, pastas artesanales delivery, carlos paz, cosquin, santa maria de punilla, cordoba, valle de punilla, envío a domicilio, cadena de frío, paula pastas",
  openGraph: {
    title: "Delivery de Pastas Artesanales | Paula Pastas",
    description: "De nuestra cocina artesanal a tu mesa. Enviamos pastas congeladas premium con cadena de frío segura en Bialet Massé, Carlos Paz, Cosquín y Valle de Punilla.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Delivery de pastas artesanales Paula Pastas en Bialet Massé y Punilla",
      },
    ],
    type: "website",
    locale: "es_AR",
  },
  alternates: {
    canonical: "https://paulapastas.com/delivery",
  },
}

export default function DeliveryPage() {
  // JSON-LD para datos estructurados
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Delivery de Pastas Artesanales",
    description: "Servicio de delivery de pastas artesanales en Bialet Massé, Carlos Paz, Cosquín y Valle de Punilla",
    url: "https://paulapastas.com/delivery",
    provider: {
      "@type": "Organization",
      name: "Paula Pastas",
      telephone: "+54 9 341 355-7400",
      address: {
        "@type": "PostalAddress",
        streetAddress: "San Pablo s/n (entre Av. Cassaffousth y Tránsito Cáceres)",
        addressLocality: "Bialet Massé",
        addressRegion: "Córdoba",
        postalCode: "5158",
        addressCountry: "AR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -31.3194549769404,
        longitude: -64.50525418079864,
      },
    },
    areaServed: [
      "Bialet Massé",
      "Villa Carlos Paz",
      "Cosquín",
      "Santa María de Punilla",
      "Córdoba Capital",
      "Valle de Punilla"
    ],
    serviceType: "Food Delivery",
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
          name: "Delivery",
          item: "https://paulapastas.com/delivery",
        },
      ],
    },
  }

  // Datos de FAQ - Actualizados con el contenido del home
  const faqs = [
    {
      pregunta: "¿Dónde comprar pastas artesanales en Bialet Massé y Valle de Punilla? ¿Hacen envíos?",
      respuesta: "Realizamos envíos a Bialet Massé, Villa Carlos Paz, Cosquín, Santa María de Punilla, Córdoba Capital y todo el Valle de Punilla. Si tenés dudas sobre tu zona, consultanos por WhatsApp y te confirmamos la cobertura."
    },
    {
      pregunta: "¿Cómo se garantiza la cadena de frío en los envíos?",
      respuesta: "Todos nuestros productos congelados se despachan en cajas térmicas o conservadoras, garantizando el mantenimiento de la cadena de frío en todo momento. Las entregas se realizan siempre en menos de 60 minutos, asegurando que tus pastas lleguen en óptimas condiciones, sin riesgo de descongelamiento."
    },
    {
      pregunta: "¿Cómo funciona el sistema de delivery?",
      respuesta: "Dependiendo del volumen del pedido, el envío se realiza mediante cadetería tradicional (moto o auto). Trabajamos con Pedidos Ya y Uber, y próximamente incorporaremos nuestro servicio de delivery propio."
    },
    {
      pregunta: "¿Hay mínimo de compra para envío sin cargo?",
      respuesta: "Ofrecemos envío sin cargo en compras mayores a $90.000"
    },
    {
      pregunta: "¿Qué días entregan pedidos?",
      respuesta: "Realizamos entregas con cronograma coordinado según la localidad en Bialet Massé, Villa Carlos Paz, Cosquín, Santa María de Punilla y zonas del Valle de Punilla. Si necesitás una entrega para un día u horario específico, podés coordinarla con anticipación por WhatsApp."
    },
    {
      pregunta: "¿Qué métodos de pago aceptan?",
      respuesta: "Aceptamos pagos en efectivo, transferencia bancaria, débito, crédito."
    },
    {
      pregunta: "¿Cuánto cuesta el envío?",
      respuesta: "El costo de envío depende de la distancia y el tipo de transporte requerido."
    },
    {
      pregunta: "¿Hacen envíos a otras ciudades?",
      respuesta: "Por el momento concentramos nuestras entregas en Bialet Massé, Villa Carlos Paz, Cosquín, Santa María de Punilla y alrededores del Valle de Punilla para garantizar la máxima frescura y calidad de nuestras pastas congeladas."
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
              <span className="text-neutral-900 font-medium">Delivery</span>
            </nav>
          </div>
        </div>

        {/* 1. Banner Principal */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/banners/banner-delivery.webp"
              alt="Delivery de pastas artesanales en Bialet Massé y Punilla"
              fill
              className="object-cover"
              priority={true}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              Delivery de pastas artesanales en Bialet Massé y alrededores
            </h1>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl text-neutral-100 leading-relaxed mb-4">
                De nuestra cocina artesanal a tu mesa, sin demoras ni complicaciones.
              </p>
              <p className="text-lg md:text-xl text-neutral-200">
                Enviamos nuestras pastas congeladas premium con cadena de frío segura y horarios flexibles.
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/pack-raviolada"
                className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Ver combos disponibles
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Sección Informativa (Placeholder) */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-neutral-50 rounded-2xl p-12 border-2 border-dashed border-neutral-300">
              <div className="w-24 h-24 mx-auto bg-neutral-200 rounded-full flex items-center justify-center mb-6">
                <Truck className="w-12 h-12 text-neutral-500" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
                Próximamente: Cómo funciona el servicio
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Estamos preparando una sección explicativa que te mostrará paso a paso cómo funciona nuestro servicio de delivery, desde la preparación hasta la entrega en tu puerta.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 opacity-50">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-neutral-200 rounded-full flex items-center justify-center mb-3">
                    <Package className="w-6 h-6 text-neutral-500" />
                  </div>
                  <p className="text-sm text-neutral-600">Preparación</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-neutral-200 rounded-full flex items-center justify-center mb-3">
                    <Package className="w-6 h-6 text-neutral-500" />
                  </div>
                  <p className="text-sm text-neutral-600">Empaque</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-neutral-200 rounded-full flex items-center justify-center mb-3">
                    <Truck className="w-6 h-6 text-neutral-500" />
                  </div>
                  <p className="text-sm text-neutral-600">Envío</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-neutral-200 rounded-full flex items-center justify-center mb-3">
                    <MapPin className="w-6 h-6 text-neutral-500" />
                  </div>
                  <p className="text-sm text-neutral-600">Entrega</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Preguntas Frecuentes */}
        <section className="py-16 bg-neutral-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-lg text-neutral-600">
                Resolvemos las dudas más comunes sobre nuestro servicio de delivery y envíos
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-6 cursor-pointer group border border-neutral-200"
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

        {/* 4. CTA de contacto */}
        <section className="py-16 bg-white text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
              ¿Tenés otra consulta?
            </h2>
            <p className="text-lg text-neutral-700 mb-8">
              Nuestro equipo está listo para responder todas tus preguntas sobre nuestro servicio de delivery
            </p>
            <a
              href="https://wa.me/5493413557400"
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

        {/* 5. Newsletter (Deshabilitado temporalmente) */}
        {/* <section className="py-16 bg-primary-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Mantenete informada
            </h2>
            <p className="text-lg text-neutral-700 mb-8">
              Suscribite y recibí un 10% de descuento en tu primer pedido.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <label htmlFor="email-newsletter-delivery" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="email-newsletter-delivery"
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
            <p className="text-sm text-neutral-600 mt-4">
              Prometemos no enviarte spam, solo pastas y buenas noticias.
            </p>
          </div>
        </section> */}
      </div>
    </>
  )
} 