import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import { ProductPlaceholder } from "@/components/ui/ImagePlaceholder"
import Link from "next/link"
import { ArrowLeft, Clock, Users, ShoppingBag, Star } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"

interface ProductoPageProps {
  params: {
    categoria: string
    subcategoria: string
    producto: string
  }
}

export async function generateMetadata({ params }: ProductoPageProps): Promise<Metadata> {
  const { categoria, subcategoria, producto: productoSlug } = params
  const producto = await getProducto(productoSlug)

  if (!producto) {
    return {
      title: "Producto no encontrado | Comida Casera",
      description: "El producto solicitado no existe.",
    }
  }

  return {
    title: producto.seoTitle || `${producto.nombre} | ${producto.categoria} | Comida Casera`,
    description: producto.seoDescription || producto.descripcion,
    keywords:
      producto.seoKeywords?.join(", ") ||
      `${producto.nombre.toLowerCase()}, ${categoria}, pastas caseras, artesanales, rosario, delivery`,
    openGraph: {
      title: `${producto.nombre} | Comida Casera`,
      description: producto.descripcion,
      images: [{ url: producto.imagen, width: 800, height: 600, alt: producto.nombre }],
      type: "website",
      locale: "es_AR",
    },
    alternates: {
      canonical: `https://comidacasera.com/categoria/${categoria}/${subcategoria}/${productoSlug}`,
    },
  }
}

async function getProducto(slug: string) {
  try {
    return await FirebaseService.getProducto(slug)
  } catch (error) {
    console.error("Error fetching producto:", error)
    return null
  }
}

async function getProductosRelacionados(categoria: string, subcategoria: string, currentSlug: string) {
  try {
    const productos = await FirebaseService.getProductos(categoria)
    return productos.filter((p) => p.subcategoria === subcategoria && p.slug !== currentSlug).slice(0, 3)
  } catch (error) {
    console.error("Error fetching productos relacionados:", error)
    return []
  }
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { categoria, subcategoria, producto: productoSlug } = params
  const producto = await getProducto(productoSlug)

  if (!producto) {
    notFound()
  }

  const productosRelacionados = await getProductosRelacionados(categoria, subcategoria, productoSlug)

  // JSON-LD para datos estructurados del producto
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion,
    image: producto.imagen,
    brand: {
      "@type": "Brand",
      name: "Comida Casera",
    },
    offers: {
      "@type": "Offer",
      price: producto.precio,
      priceCurrency: "ARS",
      availability: producto.disponible ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Comida Casera",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
    },
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
          name: subcategoria,
          item: `https://comidacasera.com/categoria/${categoria}/${subcategoria}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: producto.nombre,
          item: `https://comidacasera.com/categoria/${categoria}/${subcategoria}/${productoSlug}`,
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
              <Link href={`/categoria/${categoria}`} className="text-neutral-500 hover:text-primary-600">
                {categoria === "rellenas"
                  ? "Pastas Rellenas"
                  : categoria === "sin-relleno"
                    ? "Sin Relleno"
                    : "Sin TACC"}
              </Link>
              <span className="text-neutral-400">/</span>
              <Link
                href={`/categoria/${categoria}/${subcategoria}`}
                className="text-neutral-500 hover:text-primary-600"
              >
                {subcategoria}
              </Link>
              <span className="text-neutral-400">/</span>
              <span className="text-neutral-900 font-medium">{producto.nombre}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href={`/categoria/${categoria}/${subcategoria}`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a {subcategoria}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Imagen */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <ImageWrapper
                  src={producto.imagen || "/placeholder.svg"}
                  alt={`${producto.nombre} caseros artesanales`}
                  fill
                  className="object-cover"
                  priority={true}
                  fallback="/placeholder.svg?height=400&width=400&text=Producto"
                  placeholder={<ProductPlaceholder className="object-cover" />}
                />
              </div>
              {producto.destacado && (
                <div className="absolute top-4 left-4 bg-primary-600 text-white px-4 py-2 rounded-full font-semibold flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Destacado
                </div>
              )}
            </div>

            {/* Información */}
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                  {categoria.replace("-", " ")} • {subcategoria}
                </span>
                <h1 className="font-display text-4xl font-bold text-neutral-900 mt-2">{producto.nombre}</h1>
              </div>

              <p className="text-lg text-neutral-600 leading-relaxed">{producto.descripcion}</p>

              {/* Precio y detalles */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-primary-600">${producto.precio}</span>
                  {!producto.disponible && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      No disponible
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
                  {producto.porciones && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {producto.porciones} porciones
                    </div>
                  )}
                  {producto.tiempoPreparacion && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {producto.tiempoPreparacion}
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredientes */}
              {producto.ingredientes.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">Ingredientes</h2>
                  <div className="flex flex-wrap gap-2">
                    {producto.ingredientes.map((ingrediente, index) => (
                      <span key={index} className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-sm">
                        {ingrediente}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Información nutricional */}
              {producto.informacionNutricional && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">Información Nutricional</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {producto.informacionNutricional.calorias && (
                      <div>
                        <span className="text-neutral-600">Calorías:</span>
                        <span className="font-medium ml-2">{producto.informacionNutricional.calorias} kcal</span>
                      </div>
                    )}
                    {producto.informacionNutricional.proteinas && (
                      <div>
                        <span className="text-neutral-600">Proteínas:</span>
                        <span className="font-medium ml-2">{producto.informacionNutricional.proteinas}g</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botón de compra */}
              <button
                disabled={!producto.disponible}
                className="w-full bg-primary-600 text-white py-4 rounded-full font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {producto.disponible ? "Agregar al Carrito" : "No Disponible"}
              </button>
            </div>
          </div>

          {/* Productos relacionados */}
          {productosRelacionados.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-3xl font-bold text-neutral-900 mb-8">
                Otros {subcategoria} que te pueden gustar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {productosRelacionados.map((productoRel) => (
                  <Link
                    key={productoRel.id}
                    href={`/categoria/${categoria}/${subcategoria}/${productoRel.slug}`}
                    className="group"
                  >
                    <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift">
                      <div className="relative h-48">
                        <ImageWrapper
                          src={productoRel.imagen || "/placeholder.svg"}
                          alt={productoRel.nombre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {productoRel.nombre}
                        </h3>
                        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{productoRel.descripcion}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-primary-600">${productoRel.precio}</span>
                          <span className="text-primary-600 font-medium">Ver detalles →</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
