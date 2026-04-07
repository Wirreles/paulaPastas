import type { Metadata } from "next"
import { cache, Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ChevronRight } from "lucide-react"
import dynamic from "next/dynamic"
import { FirebaseService } from "@/lib/firebase-service"
import { getProductCanonicalUrl, getCategoryUrl, getSubcategoryUrl } from "@/lib/product-url"
import ProductCard from "@/components/ProductCard"
import StickyAddToCart from "./StickyAddToCart"
// Componentes de Cliente (Islands)
const ProductCarousel = dynamic(() => import("./ProductCarousel"), {
  loading: () => (
    <div className="w-full aspect-square bg-neutral-100 rounded-2xl animate-pulse" />
  ),
})

const AddToCart = dynamic(() => import("./AddToCart"))
import ReviewsLoader from "./ReviewsLoader";
import ProductImageLCP from "./ProductImageLCP"
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

// --- Componentes de Servidor Asíncronos para Streaming ---

async function RelacionadosSection({ categoria, subcategoria, currentSlug }: { categoria: string, subcategoria: string, currentSlug: string }) {
  try {
    const productos = await FirebaseService.getProductos(categoria)

    const filtrados = productos
      .filter((p) => p.subcategoria === subcategoria && p.slug !== currentSlug)
      .slice(0, 3)

    if (filtrados.length === 0) return null

    return (
      <section className="mt-16">
        <h3 className="font-display text-3xl font-bold text-neutral-900 mb-8 text-center">
          Otros {subcategoria} que te pueden gustar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtrados.map((rel) => <ProductCard key={rel.id} producto={rel} />)}
        </div>
      </section>
    )
  } catch (error) {
    console.error("Error en RelacionadosSection:", error)
    return null
  }
}

async function ComplementariosSection() {
  try {
    const productos = await FirebaseService.getProductos("salsas")
    const filtrados = productos.slice(0, 3)

    if (filtrados.length === 0) return null

    return (
      <section className="mt-16">
        <p className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-8 text-center">Complementalo con</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtrados.map((comp) => (
            comp.id && <ProductCard key={comp.id} producto={comp} baseUrl={`/${comp.categoria}/${comp.subcategoria}`} />
          ))}
        </div>
      </section>
    )
  } catch (error) {
    console.error("Error en ComplementariosSection:", error)
    return null
  }
}

// --- Metadata ---

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
    keywords: producto.seoKeywords?.join(", ") || `${producto.nombre.toLowerCase()}, ${subcategoria}, ${categoria}, rosario`,
    openGraph: {
      title: `${producto.nombre} | Paula Pastas`,
      description: producto.descripcion,
      images: producto.imagen ? [{ url: producto.imagen, width: 800, height: 600, alt: producto.nombre }] : [],
      type: "website",
      locale: "es_AR",
    },
    alternates: {
      canonical: getProductCanonicalUrl(producto),
    },
  }
}

// --- Página Principal ---

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { categoria, subcategoria, producto: productoSlug } = await params
  const producto = await getProducto(productoSlug)
  if (!producto) {
    notFound()
  }
  const reviewSummary = await FirebaseService.getReviewSummary(producto.id!)
  const faqsValidas = producto.preguntasFrecuentes?.filter(
    (faq) => faq.pregunta?.trim() && faq.respuesta?.trim()
  )
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

  // SEO Schemas
  const hasFaqs = producto.preguntasFrecuentes && producto.preguntasFrecuentes.length > 0
  const faqJsonLd = hasFaqs ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: producto.preguntasFrecuentes?.map((faq) => ({
      "@type": "Question",
      name: faq.pregunta,
      acceptedAnswer: { "@type": "Answer", text: faq.respuesta },
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

  const schemas = [jsonLd, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbItems }]
  if (faqJsonLd) schemas.push(faqJsonLd as any)

  return (
    <>
      {/* <link rel="preload" href={productImages[0]} as="image" fetchPriority="high" />  */}
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
            <div className="space-y-4">

              {/* 🔥 IMAGEN PRINCIPAL (LCP REAL - SERVER COMPONENT) */}
              <ProductImageLCP
                src={productImages[0]}
                alt={`${producto.nombre} - vista principal`}
              />

              {/* 🎯 CARRUSEL (CLIENT, NO BLOQUEA LCP) */}
              {productImages.length > 1 && (
                <ProductCarousel
                  images={productImages}
                  producto={producto}
                />
              )}

            </div>

            <div className="space-y-6">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mt-2 leading-tight">
                  {producto.nombre}
                </h1>

                {/* ⭐ Rating mejorado */}
                <div className="flex items-center gap-3 mt-3">

                  {/* Estrellas */}
                  <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full shadow-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-base ${i < Math.round(reviewSummary.avgRating)
                          ? "text-yellow-500"
                          : "text-neutral-300"
                          }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Puntaje + cantidad */}
                  <div className="flex items-center gap-2 text-base md:text-lg">
                    {reviewSummary.total > 0 ? (
                      <>
                        <span className="font-bold text-neutral-900">
                          {reviewSummary.avgRating.toFixed(1)}
                        </span>
                        <span className="text-neutral-400 font-medium">·</span>
                        <span className="text-neutral-700 font-semibold">
                          {reviewSummary.total} opiniones
                        </span>
                      </>
                    ) : (
                      <span className="text-neutral-500 italic font-medium">
                        Sin opiniones todavía
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-lg text-neutral-600 leading-relaxed whitespace-pre-line">
                {producto.descripcion}
              </p>

              <AddToCart producto={producto} />
            </div>
          </div>

          {/* Información Estática (No bloqueada) */}
          <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Ingredientes */}
            {producto.ingredientes?.length ? (
              <details className="bg-white rounded-2xl shadow-md p-5 group transition-all">
                <summary className="flex justify-between items-center font-semibold text-neutral-900 text-lg cursor-pointer">
                  Ingredientes
                  <ChevronRight className="w-5 h-5 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                </summary>

                <div className="mt-4 text-neutral-700 leading-relaxed text-sm md:text-base">
                  <ul className="list-disc list-inside space-y-1">
                    {producto.ingredientes.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </div>
              </details>
            ) : null}

            {/* Cómo se prepara */}
            {producto.comoPreparar?.texto && (
              <details className="bg-white rounded-2xl shadow-md p-5 group transition-all">
                <summary className="flex justify-between items-center font-semibold text-neutral-900 text-lg cursor-pointer">
                  {producto.comoPreparar.titulo || "Cómo se prepara"}
                  <ChevronRight className="w-5 h-5 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                </summary>

                <div className="mt-4 text-neutral-700 leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {producto.comoPreparar.texto}
                </div>
              </details>
            )}

            {/* Historia del plato */}
            {producto.historiaPlato?.texto && (
              <details className="bg-white rounded-2xl shadow-md p-5 group transition-all md:col-span-2">
                <summary className="flex justify-between items-center font-semibold text-neutral-900 text-lg cursor-pointer">
                  {producto.historiaPlato.titulo || "Historia del plato"}
                  <ChevronRight className="w-5 h-5 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                </summary>

                <div className="mt-4 text-neutral-700 leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {producto.historiaPlato.texto}
                </div>
              </details>
            )}

            {/* Envío y conservación (siempre visible) */}
            <details className="bg-white rounded-2xl shadow-md p-5 group transition-all md:col-span-2">
              <summary className="flex justify-between items-center font-semibold text-neutral-900 text-lg cursor-pointer">
                Envío y conservación
                <ChevronRight className="w-5 h-5 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
              </summary>

              <div className="mt-4 text-neutral-700 leading-relaxed text-sm md:text-base">
                <p className="mb-2">Realizamos envíos a Rosario y zonas cercanas.</p>
                <p>Se entregan congeladas: 2-3 días en heladera o 2 meses en freezer.</p>
              </div>
            </details>
          </section>

          {/* --- Secciones con Streaming (Suspense) --- */}

          <Suspense fallback={<div className="h-96 w-full animate-pulse bg-neutral-100 rounded-2xl mt-16" />}>
            <ComplementariosSection />
          </Suspense>

          {/* FAQs y Reviews */}
          {faqsValidas && faqsValidas.length > 0 && (
            <section className="mt-16 bg-white rounded-2xl shadow-lg p-8">
              <h2 className="font-display text-3xl font-bold text-neutral-900 mb-8 text-center">
                Preguntas frecuentes
              </h2>

              <div className="space-y-4 max-w-3xl mx-auto">
                {faqsValidas.map((faq, idx) => (
                  <details key={idx} className="bg-neutral-50 rounded-lg p-5 cursor-pointer group">
                    <summary className="flex justify-between items-center font-bold text-neutral-900 text-lg list-none">
                      {faq.pregunta}
                      <ChevronRight className="w-5 h-5 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                    </summary>

                    <div className="mt-4 text-neutral-700 leading-relaxed whitespace-pre-line">
                      {faq.respuesta}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          <ReviewsLoader
            productoId={producto.id!}
            productoNombre={producto.nombre!}
          />

          <Suspense fallback={<div className="h-96 w-full animate-pulse bg-neutral-100 rounded-2xl mt-16" />}>
            <RelacionadosSection
              categoria={categoria}
              subcategoria={subcategoria}
              currentSlug={productoSlug}
            />
          </Suspense>
        </div>
      </div>
      <StickyAddToCart producto={producto} />
    </>
  )
}