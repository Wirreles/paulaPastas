import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { FirebaseService } from "@/lib/firebase-service"
import { ArrowRight } from "lucide-react"

interface CategoriaPageProps {
  params: {
    categoria: string
  }
}

const categoriaData = {
  rellenas: {
    nombre: "Pastas Rellenas",
    descripcion:
      "Descubrí nuestras exquisitas pastas rellenas artesanales. Ravioles, sorrentinos y lasagna elaboradas con ingredientes frescos y recetas tradicionales familiares.",
    imagen: "/banners/banner-rellenas.webp",
    subcategorias: [
      {
        nombre: "Lasagna",
        slug: "lasagna",
        descripcion: "Lasagna caseras con capas perfectas de pasta, relleno y queso",
        imagen: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop",
      },
      {
        nombre: "Ravioles",
        slug: "ravioles",
        descripcion: "Ravioles artesanales con masa fresca y rellenos tradicionales",
        imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
      },
      {
        nombre: "Sorrentinos",
        slug: "sorrentinos",
        descripcion: "Sorrentinos grandes con los mejores rellenos caseros",
        imagen: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      },
    ],
  },
  "sin-relleno": {
    nombre: "Pastas Sin Relleno",
    descripcion:
      "Fideos frescos y ñoquis elaborados diariamente con harina de primera calidad y huevos de granja. La base perfecta para tus salsas favoritas.",
    imagen: "/banners/banner-sinrelleno.webp",
    subcategorias: [
      {
        nombre: "Ñoquis",
        slug: "noquis",
        descripcion: "Ñoquis de papa tradicionales hechos con la receta de la nonna",
        imagen: "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400&h=300&fit=crop",
      },
      {
        nombre: "Fideos",
        slug: "fideos",
        descripcion: "Fideos frescos elaborados con harina 00 y huevos",
        imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop",
      },
      {
        nombre: "Ravioles Fritos", // Nuevo
        slug: "ravioles-fritos", // Nuevo
        descripcion: "Crocantes por fuera, cremosos por dentro. ¡Una delicia!", // Nuevo
        imagen: "/placeholder.svg?height=400&width=300", // Nuevo
      },
    ],
  },
  "sin-tacc": {
    nombre: "Pastas Sin TACC",
    descripcion:
      "Pastas libres de gluten elaboradas con harinas certificadas sin TACC. Perfectas para celíacos sin renunciar al sabor tradicional.",
    imagen: "/banners/banner-sintac.webp",
    subcategorias: [],
  },
}

export async function generateMetadata({ params }: CategoriaPageProps): Promise<Metadata> {
  const { categoria } = await params
  const data = categoriaData[categoria as keyof typeof categoriaData]

  if (!data) {
    return {
      title: "Categoría no encontrada | Comida Casera",
      description: "La categoría solicitada no existe.",
    }
  }

  return {
    title: `${data.nombre} Artesanales en Rosario | Comida Casera`,
    description: data.descripcion,
    keywords: `${data.nombre.toLowerCase()}, pastas caseras, artesanales, rosario, delivery`,
    openGraph: {
      title: `${data.nombre} Artesanales | Comida Casera`,
      description: data.descripcion,
      images: [{ url: data.imagen, width: 1200, height: 600, alt: data.nombre }],
      type: "website",
      locale: "es_AR",
    },
    alternates: {
      canonical: `https://paulapastas.com/pastas/${categoria}`,
    },
  }
}

async function getProductosPorCategoria(categoria: string) {
  try {
    const productos = await FirebaseService.getProductos(categoria)
    console.log(`FirebaseService.getProductos(${categoria}): Encontrados ${productos.length} productos`)
    return productos
  } catch (error) {
    console.error("Error fetching productos:", error)
    return []
  }
}


export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const { categoria } = await params
  const data = categoriaData[categoria as keyof typeof categoriaData]

  if (!data) {
    notFound()
  }

  const productos = await getProductosPorCategoria(categoria)

  // JSON-LD para datos estructurados
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: data.nombre,
    description: data.descripcion,
    url: `https://paulapastas.com/pastas/${categoria}`,
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
        {
          "@type": "ListItem",
          position: 3,
          name: data.nombre,
          item: `https://paulapastas.com/pastas/${categoria}`,
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
              <span className="text-neutral-900 font-medium">{data.nombre}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={data.imagen || "/placeholder.svg"}
              alt={`${data.nombre} caseras artesanales`}
              fill
              className="object-cover"
              priority={true}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              {data.nombre}
            </h1>
            <p className="text-xl md:text-2xl text-neutral-200 max-w-3xl mx-auto">
              {data.descripcion}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Subcategorías */}
          {data.subcategorias.length > 0 && (
            <section className="mb-16">
              <h2 className="font-display text-3xl font-bold text-neutral-900 mb-8 text-center">
                {categoria === "rellenas"
                  ? "Descubrí nuestras pastas rellenas"
                  : categoria === "sin-relleno"
                    ? "Descubrí nuestras pastas sin relleno"
                    : "Explorá por Tipo"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.subcategorias.map((subcategoria) => (
                  <Link key={subcategoria.slug} href={`/pastas/${categoria}/${subcategoria.slug}`} className="group">
                    <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift">
                      <div className="relative h-48">
                        <Image
                          src={subcategoria.imagen || "/placeholder.svg"}
                          alt={`${subcategoria.nombre} caseros artesanales`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {subcategoria.nombre}
                        </h3>
                        <p className="text-neutral-600 mb-4">{subcategoria.descripcion}</p>
                        <div className="flex items-center text-primary-600 font-medium">
                          Ver {subcategoria.nombre}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {categoria === "sin-relleno" && (
            <section className="py-16 bg-primary-50 rounded-2xl text-center mb-16">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                  Un bocado que cuenta una historia.
                </h2>
                <p className="text-lg text-neutral-700 leading-relaxed">
                  En Paula Pastas no rellenamos por rellenar. Braseamos carnes durante horas, elegimos verduras de
                  estación, combinamos sabores como quien prepara un regalo. Porque para nosotros, una pasta rellena es
                  mucho más que una receta: es una forma de llevarte a casa esa sensación de restaurante que tanto te
                  gusta, pero sin moverte del living. Cada pieza es elaborada con sémola seleccionada y sellada con
                  precisión artesanal, para que al cocinarlas mantengan su textura, sabor y magia.
                </p>
              </div>
            </section>
          )}

          {/* Productos Destacados */}
          {/*
          <section>
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-8 text-center">Productos Destacados</h2>

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
                  {productos.slice(0, 6).map((producto) => (
                    <ProductCard key={producto.id} producto={producto} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🍝</span>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">Próximamente</h3>
                  <p className="text-neutral-600">Estamos preparando deliciosos productos para esta categoría</p>
                </div>
              )}
            </Suspense>

            {productos.length > 6 && (
              <div className="text-center mt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {data.subcategorias.map((subcategoria) => (
                    <Link
                      key={subcategoria.slug}
                      href={`/pastas/${categoria}/${subcategoria.slug}`}
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors"
                    >
                      Ver Todos los {subcategoria.nombre}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
          */}
        </div>
      </div>
    </>
  )
}
