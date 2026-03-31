import type { Metadata } from "next"
import { cache } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"

import { FirebaseService } from "@/lib/firebase-service"
import { getProductCanonicalUrl, getCategoryUrl, getSubcategoryUrl } from "@/lib/product-url"
import ProductCard from "@/components/ProductCard"

// Componentes de Cliente (Islands)
import ProductCarousel from "./ProductCarousel"
import AddToCart from "./AddToCart"
import ReviewsLoader from "./ReviewsLoader";

interface ProductoPageProps {
  params: Promise<{
    categoria: string
    subcategoria: string
    producto: string
  }>
}

// Cacheamos la petición para que generateMetadata y el componente usen la misma instancia
const getProducto = cache(async (slug: string) => {
  try {
    return await FirebaseService.getProducto(slug)
  } catch (error) {
    console.error("Error fetching producto:", error)
    return null
  }
})

export async function generateMetadata({ params }: ProductoPageProps): Promise<Metadata> {
  const { categoria, subcategoria, producto: productoSlug } = await params
  const producto = await getProducto(productoSlug)

  if (!producto) {
    return {
      title: "Producto no encontrado | Paula Pastas",
      description: "El producto solicitado no existe.",
    }
  }

  return {
    title: producto.seoTitle || `${producto.nombre} | ${subcategoria} | Paula Pastas`,
    description: producto.seoDescription || producto.descripcion,
    keywords:
      producto.seoKeywords?.join(", ") ||
      `${producto.nombre.toLowerCase()}, ${subcategoria}, ${categoria}, pastas caseras, artesanales, rosario, delivery`,
    openGraph: {
      title: `${producto.nombre} | Paula Pastas`,
      description: producto.descripcion,
      images: producto.imagen
        ? [{ url: producto.imagen, width: 800, height: 600, alt: producto.nombre }]
        : [],
      type: "website",
      locale: "es_AR",
    },
    alternates: {
      canonical: getProductCanonicalUrl(producto),
    },
  }
}

async function getProductosRelacionados(categoria: string, subcategoria: string, currentSlug: string) {
  try {
    const productos = await FirebaseService.getProductos(categoria)
    return productos
      .filter((p) => p.subcategoria === subcategoria && p.slug !== currentSlug)
      .slice(0, 3)
  } catch (error) {
    console.error("Error fetching productos relacionados:", error)
    return []
  }
}

async function getProductosComplementarios() {
  try {
    const productos = await FirebaseService.getProductos("salsas")
    return productos.slice(0, 3)
  } catch (error) {
    console.error("Error fetching productos complementarios:", error)
    return []
  }
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { categoria, subcategoria, producto: productoSlug } = await params
  const producto = await getProducto(productoSlug)

  if (!producto) {
    notFound()
  }

  const [productosRelacionados, productosComplementarios] = await Promise.all([
    getProductosRelacionados(categoria, subcategoria, productoSlug),
    getProductosComplementarios(),
  ])

  // Lógica de nombres y URLs
  const CATEGORY_NAMES: Record<string, string> = {
    "rellenas": "Pastas Rellenas",
    "sin-relleno": "Sin Relleno",
    "sin-tacc": "Sin TACC",
    "salsas": "Salsas",
  }
  const categoriaNombre = CATEGORY_NAMES[categoria] || categoria
  const subcatUrl = getSubcategoryUrl(categoria, subcategoria)
  const productImages = producto.imagenes && producto.imagenes.length > 0
    ? producto.imagenes
    : [producto.imagen].filter(Boolean)
  const backUrl = subcatUrl || getCategoryUrl(categoria)
  const canonicalUrl = getProductCanonicalUrl(producto)

  // --- Generación de JSON-LD (SEO) ---
  const hasFaqs = producto.preguntasFrecuentes && producto.preguntasFrecuentes.length > 0
  const faqJsonLd = hasFaqs ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: producto.preguntasFrecuentes?.map((faq) => ({
      "@type": "Question",
      name: faq.pregunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.respuesta,
      },
    })),
  } : null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion,
    image: productImages[0],
    brand: { "@type": "Brand", name: "Paula Pastas" },
    offers: {
      "@type": "Offer",
      price: producto.precio,
      priceCurrency: "ARS",
      availability: producto.disponible ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: canonicalUrl,
      seller: { "@type": "Organization", name: "Paula Pastas" },
    }
  }

  const breadcrumbItems: any[] = [
    { "@type": "ListItem", position: 1, name: "Pastas", item: "https://paulapastas.com/pastas" },
    { "@type": "ListItem", position: 2, name: categoriaNombre, item: `https://paulapastas.com${getCategoryUrl(categoria)}` }
  ]

  if (subcatUrl) {
    breadcrumbItems.push({ "@type": "ListItem", position: 3, name: subcategoria, item: `https://paulapastas.com${subcatUrl}` })
    breadcrumbItems.push({ "@type": "ListItem", position: 4, name: producto.nombre, item: canonicalUrl })
  } else {
    breadcrumbItems.push({ "@type": "ListItem", position: 3, name: producto.nombre, item: canonicalUrl })
  }

  const schemas = [jsonLd, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbItems }]
  if (faqJsonLd) schemas.push(faqJsonLd as any)

  return (
    <>
      <link rel="preload" href={productImages[0]} as="image" fetchPriority="high" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      <div className="min-h-screen bg-neutral-50 pb-28 sm:pb-0">
        {/* --- Breadcrumb UI --- */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <Link href="/" className="text-neutral-500 hover:text-primary-600">Inicio</Link>
              <span className="text-neutral-400">/</span>
              <Link href="/pastas" className="text-neutral-500 hover:text-primary-600">Pastas</Link>
              <span className="text-neutral-400">/</span>
              <Link href={getCategoryUrl(categoria)} className="text-neutral-500 hover:text-primary-600">{categoriaNombre}</Link>
              {subcatUrl && (
                <>
                  <span className="text-neutral-400">/</span>
                  <Link href={subcatUrl} className="text-neutral-500 hover:text-primary-600">{subcategoria}</Link>
                </>
              )}
              <span className="text-neutral-400">/</span>
              <span className="text-neutral-900 font-medium">{producto.nombre}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link href={backUrl} className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a {subcatUrl ? subcategoria : categoriaNombre}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="relative">
              <ProductCarousel images={productImages} producto={producto} />
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                  {categoria.replace("-", " ")} • {subcategoria}
                </span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mt-2">
                  {producto.nombre}
                </h1>
              </div>

              <p className="text-lg text-neutral-600 leading-relaxed whitespace-pre-line">
                {producto.descripcion}
              </p>

              <AddToCart producto={producto} />
            </div>
          </div>

          {/* Ingredientes y Envío */}
          <section className={`mt-16 grid gap-8 ${producto.ingredientes?.length ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {producto.ingredientes?.length ? (
              <details className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer group">
                <summary className="flex justify-between items-center font-bold text-neutral-900 text-xl list-none">
                  Ingredientes
                  <ChevronRight className="w-6 h-6 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                </summary>
                <div className="mt-4 text-neutral-700 leading-relaxed">
                  <ul className="list-disc list-inside space-y-1">
                    {producto.ingredientes.map((ing, idx) => <li key={idx}>{ing}</li>)}
                  </ul>
                </div>
              </details>
            ) : null}

            <details className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-bold text-neutral-900 text-xl list-none">
                Envío y Conservación
                <ChevronRight className="w-6 h-6 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
              </summary>
              <div className="mt-4 text-neutral-700 leading-relaxed">
                <p className="mb-2">Realizamos envíos a Rosario y zonas cercanas.</p>
                <p>Se entregan congeladas: 2-3 días en heladera o 2 meses en freezer.</p>
              </div>
            </details>
          </section>

          {/* Historia del Plato */}
          <details className="mt-16 bg-white rounded-2xl shadow-lg p-8 cursor-pointer group">
            <summary className="flex justify-between items-center font-bold text-neutral-900 text-xl list-none">
              <span>{producto.historiaPlato?.titulo || "Un plato con historia"}</span>
              <ChevronRight className="w-6 h-6 text-primary-600 transition-transform duration-300 group-open:rotate-90 flex-shrink-0" />
            </summary>
            <div className="mt-4 text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
              {producto.historiaPlato?.texto || "Cocinamos a fuego lento para un sabor auténtico."}
            </div>
          </details>

          {/* Cómo Preparar */}
          {producto.comoPreparar && (
            <details className="mt-16 bg-primary-50 rounded-2xl shadow-lg p-8 cursor-pointer group">
              <summary className="flex justify-between items-center font-bold text-neutral-900 text-xl list-none">
                <span>{producto.comoPreparar.titulo}</span>
                <ChevronRight className="w-6 h-6 text-primary-600 transition-transform duration-300 group-open:rotate-90 flex-shrink-0" />
              </summary>
              <div className="mt-4 text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
                {producto.comoPreparar.texto}
              </div>
            </details>
          )}

          {/* Productos Complementarios */}
          {productosComplementarios.length > 0 && (
            <section className="mt-16">
              <p className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-8 text-center">Complementalo con</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {productosComplementarios.map((comp) => (
                  comp.id && <ProductCard key={comp.id} producto={comp} baseUrl={`/${comp.categoria}/${comp.subcategoria}`} />
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          <section className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-8 text-center">Preguntas frecuentes</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {producto.preguntasFrecuentes?.length ? (
                producto.preguntasFrecuentes.map((faq, idx) => (
                  <details key={idx} className="bg-neutral-50 rounded-lg p-5 cursor-pointer group">
                    <summary className="flex justify-between items-center font-bold text-neutral-900 text-lg list-none">
                      {faq.pregunta}
                      <ChevronRight className="w-5 h-5 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                    </summary>
                    <div className="mt-4 text-neutral-700 leading-relaxed whitespace-pre-line">{faq.respuesta}</div>
                  </details>
                ))
              ) : (
                <p className="text-center text-neutral-500 italic">No hay preguntas frecuentes disponibles.</p>
              )}
            </div>
          </section>

          {/* Sección de Reviews */}
          <ReviewsLoader
            productoId={producto.id!}
            productoNombre={producto.nombre!}
          />

          {/* Productos Relacionados */}
          {productosRelacionados.length > 0 && (
            <section className="mt-16">
              <h3 className="font-display text-3xl font-bold text-neutral-900 mb-8 text-center">
                Otros {subcategoria} que te pueden gustar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {productosRelacionados.map((rel) => <ProductCard key={rel.id} producto={rel} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}