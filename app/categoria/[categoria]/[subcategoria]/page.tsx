import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import { HeroPlaceholder } from "@/components/ui/ImagePlaceholder"
import { ArrowLeft } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import ProductCard from "@/components/ProductCard"

interface SubcategoriaPageProps {
  params: {
    categoria: string
    subcategoria: string
  }
}

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
      descripción:
        "Ñoquis tradicionales elaborados con papas frescas y la receta secreta de la nonna. Suaves, esponjosos y llenos de sabor.",
      imagen: "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=1200&h=600&fit=crop",
    },
    fideos: {
      nombre: "Fideos Frescos",
      descripcion:
        "Fideos elaborados diariamente con harina 00 y huevos de granja. La base perfecta para cualquier salsa.",
      imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&h=600&fit=crop",
    },
  },
}

export async function generateMetadata({ params }: SubcategoriaPageProps): Promise<Metadata> {
  const { categoria, subcategoria } = params
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
      canonical: `https://comidacasera.com/categoria/${categoria}/${subcategoria}`,
    },
  }
}

async function getProductosPorSubcategoria(categoria: string, subcategoria: string) {
  try {
    const productos = await FirebaseService.getProductos(categoria)
    return productos.filter((p) => p.subcategoria === subcategoria)
  } catch (error) {
    console.error("Error fetching productos:", error)
    return []
  }
}

export default async function SubcategoriaPage({ params }: SubcategoriaPageProps) {
  const { categoria, subcategoria } = params
  const data = subcategoriaData[categoria as keyof typeof subcategoriaData]?.[subcategoria as keyof any]

  if (!data) {
    notFound()
  }

  const productos = await getProductosPorSubcategoria(categoria, subcategoria)

  // JSON-LD para datos estructurados
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: data.nombre,
    description: data.descripcion,
    url: `https://comidacasera.com/categoria/${categoria}/${subcategoria}`,
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
          name: categoria === "rellenas" ? "Pastas Rellenas" : categoria === "sin-relleno" ? "Sin Relleno" : "Sin TACC",
          item: `https://comidacasera.com/categoria/${categoria}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: data.nombre,
          item: `https://comidacasera.com/categoria/${categoria}/${subcategoria}`,
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
              <Link href={`/categoria/${categoria}`} className="text-neutral-500 hover:text-primary-600">
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
            <ImageWrapper
              src={data.imagen || "/placeholder.svg"}
              alt={`${data.nombre} caseros artesanales`}
              fill
              className="object-cover"
              priority={true}
              fallback="/placeholder.svg?height=500&width=1200&text=Subcategoria"
              placeholder={<HeroPlaceholder className="object-cover" />}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">{data.nombre}</h1>
            <p className="text-lg md:text-xl text-neutral-200 max-w-3xl mx-auto">{data.descripcion}</p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href={`/categoria/${categoria}`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a{" "}
              {categoria === "rellenas" ? "Pastas Rellenas" : categoria === "sin-relleno" ? "Sin Relleno" : "Sin TACC"}
            </Link>
          </div>

          {/* Productos */}
          <section>
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
                    <ProductCard
                      key={producto.id}
                      producto={producto}
                      baseUrl={`/categoria/${categoria}/${subcategoria}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🍝</span>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">Próximamente</h3>
                  <p className="text-neutral-600">Estamos preparando deliciosos {data.nombre.toLowerCase()} para vos</p>
                </div>
              )}
            </Suspense>
          </section>
        </div>
      </div>
    </>
  )
}
