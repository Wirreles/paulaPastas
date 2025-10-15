"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useCanonical } from "@/hooks/use-canonical"

const categorias = [
  {
    nombre: "Pastas Rellenas",
    slug: "rellenas",
    descripcion: "Ravioles, sorrentinos y lasagna con rellenos tradicionales",
    imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=600&h=400&fit=crop",
    subcategorias: ["Lasagna", "Ravioles", "Sorrentinos"],
  },
  {
    nombre: "Pastas Sin Relleno",
    slug: "sin-relleno",
    descripcion: "Fideos frescos y ñoquis elaborados diariamente",
    imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=400&fit=crop",
    subcategorias: ["Ñoquis", "Fideos"],
  },
  {
    nombre: "Pastas Sin TACC",
    slug: "sin-tacc",
    descripcion: "Pastas libres de gluten para celíacos",
    imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=600&h=400&fit=crop",
    subcategorias: ["Aptas para celíacos"],
  },
]

export default function PastasPage() {
  // Configurar URL canónica
  useCanonical("https://paulapastas.com/pastas")

  // Datos estáticos del banner
  const bannerData = {
    imageUrl: "/banners/banner-pastas.webp",
    title: "Nuestras Pastas",
    subtitle: "Elaboradas diariamente con ingredientes frescos y recetas tradicionales familiares. Cada pasta es un bocado de amor y tradición.",
    description: "Banner principal de la página de Pastas"
  }

  // JSON-LD para datos estructurados
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Pastas Artesanales",
    description: "Pastas caseras elaboradas con ingredientes frescos y recetas tradicionales",
    url: "https://paulapastas.com/pastas",
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
      ],
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
              <span className="text-neutral-900 font-medium">Pastas</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={bannerData.imageUrl}
              alt={bannerData.description}
              fill
              className="object-cover"
              priority={true}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              {bannerData.title}
            </h1>
            <p className="text-xl md:text-2xl text-neutral-200 max-w-3xl mx-auto">
              {bannerData.subtitle}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Categorías */}
          <section>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Explorá Nuestras Categorías
              </h2>
              <p className="text-lg text-neutral-600">Tenemos opciones para todos los gustos y necesidades</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categorias.map((categoria) => (
                <Link key={categoria.slug} href={`/pastas/${categoria.slug}`} className="group">
                  <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift">
                    <div className="relative h-64">
                      <Image
                        src={categoria.imagen || "/placeholder.svg"}
                        alt={`${categoria.nombre} caseras artesanales`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{categoria.nombre}</h3>
                        <p className="text-neutral-200 text-sm">{categoria.descripcion}</p>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {categoria.subcategorias.map((sub, index) => (
                          <span key={index} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                            {sub}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
                        Explorar {categoria.nombre}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-16 text-center">
            <div className="bg-primary-50 rounded-2xl p-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
                ¿No sabés qué elegir?
              </h2>
              <p className="text-lg text-neutral-600 mb-6">
                Contactanos y te ayudamos a encontrar la pasta perfecta para tu ocasión
              </p>
              <Link
                href="/delivery"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors"
              >
                Hacer Pedido
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
