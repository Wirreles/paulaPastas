"use client" // Necesario para el carrusel y el acordeón interactivo

import { Suspense, useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, Star, Clock, Truck, Leaf, Award, MessageCircle, ChevronLeft, ChevronRight, Minus, Plus, Eye, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/utils"
import { useHomeData } from "@/hooks/use-home-data"
import { HeroImage, ProductImage, ImageWrapper } from "@/components/ui/ImageWrapper"
import { ImageDebugInfo } from "@/components/ui/ImageDebugInfo"
import { HeroPlaceholder, ProductPlaceholder, CategoryPlaceholder } from "@/components/ui/ImagePlaceholder"
import { ImagePreloader } from "@/components/ui/ImagePreloader"
import { NewsletterForm } from "@/components/ui/NewsletterForm"

// Datos estáticos para evitar consultas innecesarias
const STATIC_REVIEWS = [
  {
    id: 1,
    name: "María G.",
    rating: 5,
    testimonial: "Las mejores pastas caseras que he probado en Rosario. ¡Frescas y deliciosas!",
  },
  {
    id: 2,
    name: "Juan P.",
    rating: 5,
    testimonial: "El delivery es súper rápido y las porciones son generosas. ¡Mis favoritas!",
  },
  {
    id: 3,
    name: "Ana L.",
    rating: 4,
    testimonial: "Excelente opción para una cena rápida y sabrosa. Los ravioles de osobuco son un must.",
  },
  {
    id: 4,
    name: "Carlos R.",
    rating: 5,
    testimonial: "Siempre pido para eventos familiares, ¡nunca fallan! Calidad y sabor garantizados.",
  },
  {
    id: 5,
    name: "Sofía M.",
    rating: 5,
    testimonial: "La lasaña es espectacular, como hecha en casa. ¡Totalmente recomendada!",
  },
  {
    id: 6,
    name: "Pedro D.",
    rating: 4,
    testimonial: "Los ñoquis son muy ricos y la atención al cliente es excelente. Volveré a pedir.",
  },
]

const STATIC_FAQS = [
  {
    question: "¿Dónde comprar pastas artesanales en Rosario? ¿Hacen envíos?",
    answer:
      "Realizamos envíos a Rosario, Funes, Fisherton, Villa Gobernador Gálvez, Alvear y zonas cercanas. Si tenés dudas sobre tu barrio, consultanos por WhatsApp y te confirmamos la cobertura.",
  },
  {
    question: "¿Qué tipos de pastas ofrecen?",
    answer:
      "Ofrecemos pastas artesanales congeladas elaboradas 100% con sémola de trigo, sin colorantes, conservantes ni aditivos: ravioles y sorrentinos clásicos y gourmet (ossobuco, cordero, carré), lasaña tradicional italiana, ya armada y lista para hornear, salsa Bolognesa para acompañar y próximamente tendremos nuevos productos. Además, todos los 29 preparamos un especial de ñoquis para celebrar la tradición. Toda nuestra pasta llega congelada, conservando su frescura y calidad, y se cocina en pocos minutos para disfrutar en casa del auténtico sabor artesanal.",
  },
  {
    question: "¿Qué recomiendan para alguien que compra por primera vez?",
    answer:
      "Si es tu primera vez con Paula Pastas, te invitamos a descubrir nuestras dos colecciones. Pensadas y creadas para que vivas una experiencia única y variada. La Colección Verde ofrece sabores suaves y frescos: espinaca cremosa con crocante de nuez, carne y espinaca a la italiana, y ossobuco braseado al Malbec. La Colección Fuego trae sabores intensos y gourmets: cordero campestre Blanc, carré glaseado con crema de cebollas y ossobuco braseado al Malbec.",
  },
  {
    question: "¿Cuál es el sabor más pedido por los clientes?",
    answer:
      "El sabor más pedido por los clientes es siempre, pero siempre el Ossobuco Malbec. Enamora cada paladar que conoce, y ¡siempre vuelven a pedirlo! Creemos que su larga cocción y el sabor profundo de nuestro caldo casero pueden tener algo que ver en el asunto…",
  },
  {
    question: "¿Usan conservantes o aditivos?",
    answer:
      "Nuestras pastas no tienen ningún tipo de conservante, aditivo, colorante o agregado. Son hechas con productos naturales, de origen vegetal y animal.",
  },
  {
    question: "¿Las pastas son aptas para vegetarianos?",
    answer:
      "¡Sí! Tenemos pasta apta para vegetarianos. Nuestro relleno de Espinaca Cremosa con Crocante de nuez, tanto en ravioles como en sorrentinos se encuentra disponible. Estamos trabajando para ampliar nuestra carta de sabores y tener más opciones disponibles próximamente. En los 29 de ñoquis también hay opciones disponibles.",
  },
  {
    question: "¿Cuánto duran en el freezer? ¿Y en la heladera?",
    answer:
      "Nuestra pasta dura 2 meses en el freezer. Luego de la cocción pueden durar de 2 a 3 días en la heladera (en un recipiente hermético), aunque Paula Pastas recomienda ingerir siempre dentro de las 48 hs para conservar nuestras delicias intactas.",
  },
  {
    question: "¿Qué diferencia hay entre la pasta fresca y la normal?",
    answer:
      "La pasta fresca se elabora con harina blanca 00 y huevo, lo que le confiere textura tierna y capacidad para absorber salsas y rellenos cremosos. Su elasticidad y humedad permiten una cocción rápida, normalmente es utilizada para preparaciones como ravioles. Por otro lado, la pasta seca se fabrica con sémola de trigo duro y agua, sometida a un proceso de secado que reduce su humedad al mínimo, otorgándole una textura firme y mayor resistencia a la cocción prolongada. Esta versión es utilizada en platos como espaguetis o tallarines que requieren tiempos más largos de cocción, y salsas que se adhieran bien a la pasta. En Paula Pastas, hacemos una pasta fresca especial, ya que trabajamos con masas al huevo y 100% sémola de grano duro, con una humedad que varía en base al producto al que se destine nuestra masa, para mantener la textura, elasticidad y sabor artesanal que caracteriza a la cocina italiana tradicional en cada uno de sus platos.",
  },
  {
    question: "¿Puedo pagar con Mercado Pago?",
    answer:
      "¡Sí! Podés pagar desde Mercado Pago, con la forma de pago que elijas.",
  },
]



export default function HomePage() {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(1)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())
  const { addItem } = useCart()
  
  // Usar el hook optimizado para datos del home
  const {
    productosDestacados,
    homeSections,
    reviewsDestacadas,
    isLoadingProducts,
    isLoadingReviews,
  } = useHomeData()
  
  // Memoizar funciones para evitar re-renders innecesarios
  const getQuantity = useCallback((productId: string) => {
    return quantities[productId] || 0
  }, [quantities])

  const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, newQuantity)
    }))
  }, [])

  const handleAddToCart = useCallback((producto: any) => {
    const quantity = getQuantity(producto.id)
    if (quantity > 0) {
      addItem(producto, quantity)
      setQuantities(prev => ({ ...prev, [producto.id]: 0 }))
    }
  }, [addItem, getQuantity])

  // Efecto optimizado para responsive
  useEffect(() => {
    const calculateItemsPerPage = () => {
      const width = window.innerWidth
      if (width >= 1024) setItemsPerPage(3)
      else if (width >= 768) setItemsPerPage(2)
      else setItemsPerPage(1)
    }

    calculateItemsPerPage()
    
    const handleResize = () => {
      calculateItemsPerPage()
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Memoizar datos calculados
  const productosLimitados = useMemo(() => {
    return productosDestacados.slice(0, 6)
  }, [productosDestacados])

  const reviewsLimitadas = useMemo(() => {
    return reviewsDestacadas.slice(0, 6)
  }, [reviewsDestacadas])

  const currentReviews = useMemo(() => {
    const start = currentReviewIndex
    const end = start + itemsPerPage
    return reviewsLimitadas.slice(start, end)
  }, [currentReviewIndex, itemsPerPage, reviewsLimitadas])

  const totalReviewPages = useMemo(() => {
    return Math.ceil(reviewsLimitadas.length / itemsPerPage)
  }, [reviewsLimitadas.length, itemsPerPage])

  // Funciones memoizadas para navegación
  const nextReviews = useCallback(() => {
    setCurrentReviewIndex(prev => 
      prev + itemsPerPage >= reviewsLimitadas.length ? 0 : prev + itemsPerPage
    )
  }, [itemsPerPage, reviewsLimitadas.length])

  const prevReviews = useCallback(() => {
    setCurrentReviewIndex(prev => 
      prev - itemsPerPage < 0 ? Math.max(0, reviewsLimitadas.length - itemsPerPage) : prev - itemsPerPage
    )
  }, [itemsPerPage, reviewsLimitadas.length])

  const toggleReviewExpansion = useCallback((reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }, [])

    // Funciones para controlar la expansión de reseñas
  const isReviewExpanded = useCallback((reviewId: string) => expandedReviews.has(reviewId), [expandedReviews])

  // Obtener imágenes dinámicas optimizadas
  const heroImage =
    homeSections.find((s) => s.id === "hero-main-image")?.imageUrl ||
    "/placeholder.svg?height=800&width=1200&text=Hero Image"
  
  const dishesGalleryImages = homeSections
    .filter((s) => s.sectionId === "dishes-gallery")
    .sort((a, b) => a.order - b.order)
  
  const qualityAssuredImage =
    homeSections.find((s) => s.id === "quality-assured-image")?.imageUrl ||
    "/placeholder.svg?height=400&width=600&text=Quality Assured Image"

  // Imágenes para precargar (solo las más importantes)
  const imagesToPreload = useMemo(() => {
    const images = []
    
    // Hero image siempre es prioritaria
    if (heroImage && !heroImage.includes('placeholder')) {
      images.push(heroImage)
    }
    
    // Primeras 3 imágenes de productos destacados
    productosDestacados.slice(0, 3).forEach(producto => {
      if (producto.imagen && !producto.imagen.includes('placeholder')) {
        images.push(producto.imagen)
      }
    })
    
    return images
  }, [heroImage, productosDestacados])

  // Mapear las categorías del home a partir de los datos dinámicos
  const categoriasHome = [
    {
      nombre: "Sorrentinos",
      slug: "rellenas/sorrentinos", // Ajustado para la ruta correcta
      descripcion: "Grandes y sabrosos",
      imagen:
        homeSections.find((s) => s.id === "home-category-sorrentinos")?.imageUrl ||
        "/placeholder.svg?height=300&width=400&text=Sorrentinos",
    },
    {
      nombre: "Ñoquis",
      slug: "sin-relleno/noquis", // Ajustado para la ruta correcta
      descripcion: "Suaves y esponjosos",
      imagen:
        homeSections.find((s) => s.id === "home-category-noquis")?.imageUrl ||
        "/placeholder.svg?height=300&width=400&text=Ñoquis",
    },
    {
      nombre: "Ravioles",
      slug: "rellenas/ravioles", // Ajustado para la ruta correcta
      descripcion: "Rellenos tradicionales",
      imagen:
        homeSections.find((s) => s.id === "home-category-ravioles")?.imageUrl ||
        "/placeholder.svg?height=300&width=400&text=Ravioles",
    },
    {
      nombre: "Lasañas",
      slug: "rellenas/lasana", // Ajustado para la ruta correcta
      descripcion: "Capas de sabor",
      imagen:
        homeSections.find((s) => s.id === "home-category-lasana")?.imageUrl ||
        "/placeholder.svg?height=300&width=400&text=Lasañas",
    },
    {
      nombre: "Fideos",
      slug: "sin-relleno/fideos", // Ajustado para la ruta correcta
      descripcion: "Clásicos y versátiles",
      imagen:
        homeSections.find((s) => s.id === "home-category-fideos")?.imageUrl ||
        "/placeholder.svg?height=300&width=400&text=Fideos",
    },
  ]

  // JSON-LD para reseñas (ejemplo básico)
  const reviewsJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Paula Pastas",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9", // Valor promedio de tus reseñas
      reviewCount: "250", // Número total de reseñas
    },
    review: STATIC_REVIEWS.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.name,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
      },
      reviewBody: review.testimonial,
    })),
  }

  // JSON-LD para FAQPage
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: STATIC_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  // Debug: Log antes del render
  console.log("🔍 Antes del render - productosDestacados:", productosDestacados)

  return (
    <div className="min-h-screen">
      {/* Preloader de imágenes importantes */}
      <ImagePreloader images={imagesToPreload} priority={true} />
      
      {/* JSON-LD para reseñas y FAQ */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* 1. 🧱 Sección Principal / Hero (Carrusel principal) */}
      <section className="relative flex flex-col lg:flex-row items-center justify-center lg:justify-between min-h-[80vh] lg:h-[70vh] bg-gradient-to-b from-primary-350 to-primary-550">
        {/* Contenido de texto (derecha en web, arriba centrado en móvil) */}
        <div className="relative z-10 text-center lg:text-left w-full lg:w-1/2 max-w-4xl mx-auto lg:mx-0 order-1 lg:order-2 py-8 lg:py-0 px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-2 text-sm font-medium text-neutral-700 mb-4 animate-fade-in">
            <Leaf className="w-4 h-4 text-primary-600" />
            <span>Elaboración 100% Artesanal</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-neutral-900 mb-4 animate-fade-in">
            Fábrica de pastas artesanales en Rosario
          </h1>
          <p className="text-lg md:text-xl mb-8 text-neutral-700 animate-slide-up">
            En Paula Pastas llevamos la experiencia del restaurante a tu casa. Si buscas algo especial, rico y rápido
            sin complicarte la vida, esta es tu casa de pastas.
          </p>
          <div className="flex flex-col items-center lg:items-start gap-4 animate-scale-in">
            <Link
              href="/pastas"
              className="group inline-flex items-center justify-center px-6 py-3 border border-neutral-900 text-neutral-900 text-sm font-semibold rounded-lg hover:bg-neutral-900 hover:text-white transition-all duration-300 w-full sm:max-w-xs mx-auto lg:w-auto lg:mx-0"
            >
              Descubrí nuestras pastas
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex flex-row flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs text-neutral-900">
              <div className="flex items-center space-x-2">
                <Leaf className="w-4 h-4 text-neutral-900" />
                <span>Sin Conservantes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-neutral-900" />
                <span>Frescura garantizada</span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-full lg:w-1/2 aspect-video lg:h-full order-2 lg:order-1">
          <ImageWrapper
            src={heroImage}
            alt="Pasta artesanal en Rosario, plato de ravioles con salsa"
            fill
            className="object-cover w-full h-full"
            fallback="/placeholder.svg?height=800&width=1200&text=Hero+Image"
            priority={true}
            loading="eager"
            placeholder={<HeroPlaceholder className="object-cover w-full h-full" />}
          />
        </div>
      </section>

      {/* 2. 🥟 Sección: “Pastas frescas recientemente elaboradas” */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Pastas frescas recientemente elaboradas
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Descubrí nuestras pastas más populares, elaboradas con ingredientes frescos y recetas tradicionales.
            </p>
          </div>

          {isLoadingProducts ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⏳</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Cargando productos...</h3>
              <p className="text-neutral-600">Esperá un momento mientras cargamos nuestros productos destacados</p>
            </div>
          ) : productosDestacados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {productosLimitados.map((producto: any) => {
                  console.log("🔍 Renderizando producto:", producto)
                  const productUrl = `/pastas/${producto.categoria}/${producto.subcategoria}/${producto.slug}`
                  const quantity = getQuantity(producto.id)
                  
                  return (
                    <article key={producto.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover-lift group flex flex-col h-full">
                      {/* Imagen más grande */}
                      <div className="relative h-64">
                                                 <Link href={productUrl}>
                           <ImageWrapper
                             src={producto.imagen}
                             alt={`${producto.nombre} caseros artesanales`}
                             fill
                             className="object-cover group-hover:scale-105 transition-transform duration-300"
                             fallback="/placeholder.svg?height=300&width=400&text=Producto"
                             placeholder={<ProductPlaceholder className="object-cover group-hover:scale-105 transition-transform duration-300" />}
                             lazyThreshold={0.1} // Cargar más temprano
                             loading="lazy"
                           />
                         </Link>
                        {producto.destacado && (
                          <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Destacado
                          </div>
                        )}
                        {!producto.disponible && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">No Disponible</span>
                          </div>
                        )}
                      </div>

                      {/* Contenido de la card con flex-grow para ocupar el espacio disponible */}
                      <div className="p-4 flex flex-col flex-grow">
                        <Link href={productUrl}>
                          <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                            {producto.nombre}
                          </h3>
                        </Link>

                        <p className="text-neutral-600 mb-4 text-sm line-clamp-4 flex-grow">{producto.descripcionAcortada}</p>

                        {/* Precio dinámico y selector de cantidad en la misma línea */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-xl font-bold text-primary-600">{formatPrice(producto.precio * quantity)}</span>
                            {producto.porciones && (
                              <span className="text-sm text-neutral-500 ml-2">{producto.porciones} porciones</span>
                            )}
                          </div>

                          {/* Selector de cantidad */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(producto.id, -1)}
                              className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
                              disabled={quantity <= 0}
                            >
                              <Minus className="w-4 h-4 text-neutral-700" />
                            </button>
                            <span className="text-lg font-semibold text-neutral-900 w-8 text-center">{quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(producto.id, 1)}
                              className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-neutral-700" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Botones siempre al fondo de la card */}
                      <div className="p-4 pt-0 mt-auto">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(producto)}
                            className="flex-1 bg-primary-600 text-white text-center px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            disabled={!producto.disponible}
                          >
                            Agregar al carro
                          </button>
                          <Link
                            href={productUrl}
                            className="bg-neutral-900 text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
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

          <div className="text-center mt-12">
            <Link
              href="/pastas"
              className="inline-flex items-center px-6 py-3 border border-neutral-900 text-neutral-900 font-semibold rounded-lg hover:bg-neutral-900 hover:text-white transition-colors w-full sm:max-w-xs mx-auto"
            >
              Ver Todas las Pastas
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. 🍝 Sección: “¿Qué pasta casera te gustaría comer hoy?” */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              ¿Qué pasta casera te gustaría comer hoy?
            </h2>
            <p className="text-lg text-neutral-600">Tenemos opciones para todos los gustos y necesidades</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {categoriasHome.map((categoria) => (
              <Link key={categoria.slug} href={`/pastas/${categoria.slug}`} className="group">
                <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift">
                  <div className="relative h-48">
                    <ImageWrapper
                      src={categoria.imagen}
                      alt={`${categoria.nombre} caseras artesanales`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      fallback="/placeholder.svg?height=300&width=400&text=Categoria"
                      placeholder={<CategoryPlaceholder className="object-cover group-hover:scale-105 transition-transform duration-300" />}
                      lazyThreshold={0.3} // Cargar cuando 30% sea visible
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">{categoria.nombre}</h3>
                      <p className="text-neutral-200 text-sm">{categoria.descripcion}</p>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 🤔 Sección informativa: “¿Aún no sabes qué elegir?” */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            ¿Aún no sabes qué elegir?
          </h2>
          <p className="text-xl mb-8 text-neutral-700">
            En Paula Pastas, cada plato es una obra de arte culinaria, elaborada con pasión y los ingredientes más
            frescos. Nuestra tradición familiar se refleja en cada bocado, ofreciéndote una experiencia inigualable.
          </p>
          <Link
            href="/pastas"
            className="inline-flex items-center px-8 py-4 border border-neutral-900 text-neutral-900 font-semibold rounded-lg hover:bg-neutral-900 hover:text-white transition-colors w-full sm:max-w-xs mx-auto"
          >
            Conocé el menú completo
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* 5. 🍽️ Sección visual: “Platos que hablan por sí solos” */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Platos que hablan por sí solos
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Deslizá y mirá lo que podés tener en tu mesa esta semana.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {dishesGalleryImages.map((img, index) => (
              <div key={index} className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-lg hover-lift">
                <ImageWrapper 
                  src={img.imageUrl} 
                  alt={img.name || `Plato ${index + 1}`} 
                  fill 
                  className="object-cover"
                  fallback="/placeholder.svg?height=300&width=400&text=Plato"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ❤️ Sección: “¿Por qué nos eligen?” */}
      <section className="py-16 bg-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">¿Por qué nos eligen?</h2>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto mb-12">
            Nuestros clientes eligen Paula Pastas por la calidad, el sabor y la comodidad.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Calidad Inigualable</h3>
              <p className="text-neutral-600">
                Utilizamos solo ingredientes frescos y de primera calidad para cada preparación.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Frescura Diaria</h3>
              <p className="text-neutral-600">
                Elaboramos nuestras pastas todos los días para garantizar el máximo sabor y frescura.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Delivery Confiable</h3>
              <p className="text-neutral-600">
                Recibe tus pastas en la comodidad de tu hogar, con entregas rápidas y seguras en Rosario.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pastas"
              className="inline-flex items-center px-8 py-4 bg-primary-900 text-white font-semibold rounded-lg hover:bg-primary-800 transition-colors w-full sm:max-w-xs"
            >
              Ver pastas
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a
              href="https://wa.me/5493411234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#1DA851] transition-colors w-full sm:max-w-xs"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Hablemos por Wsp
            </a>
          </div>
        </div>
      </section>

      {/* 7. 🌟 [MODIFICADA] Sección: “Los que ya probaron” (Reseñas - Carrusel) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Los que ya probaron</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              La opinión de nuestros clientes es lo más importante.
            </p>
          </div>

          {isLoadingReviews ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Cargando reseñas...</h3>
              <p className="text-neutral-600">Esperá un momento mientras cargamos las opiniones de nuestros clientes</p>
            </div>
          ) : reviewsDestacadas.length > 0 ? (
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentReviewIndex * (100 / itemsPerPage)}%)`,
                  }}
                >
                  {currentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4" // Adjust width for responsive cards
                    >
                      <div 
                        className={`bg-neutral-50 rounded-lg p-6 shadow-sm flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${
                          isReviewExpanded(review.id || "") 
                            ? "h-auto min-h-[200px] shadow-lg border-2 border-primary-200" 
                            : "h-[200px]"
                        }`}
                      >
                        <div className="flex justify-center mb-2">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          ))}
                          {[...Array(5 - review.rating)].map((_, i) => (
                            <Star key={i + review.rating} className="w-5 h-5 text-neutral-300" />
                          ))}
                        </div>
                        
                        <div className={`flex flex-col ${
                          !isReviewExpanded(review.id || "") ? "flex-1" : ""
                        }`}>
                          <div className={`review-text-container ${
                            !isReviewExpanded(review.id || "") ? "flex-1 overflow-hidden" : ""
                          }`}>
                            <p className={`text-neutral-700 italic mb-2 text-wrap-safe leading-relaxed ${
                              !isReviewExpanded(review.id || "") ? "line-clamp-2" : ""
                            }`}>
                              "{review.testimonial}"
                            </p>
                          </div>
                          
                          {/* Botón "Ver más" solo si el texto es largo */}
                          {review.testimonial.length > 60 && (
                            <button
                              onClick={() => toggleReviewExpansion(review.id || "")}
                              className={`text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 transition-colors ${
                                isReviewExpanded(review.id || "") ? "font-semibold" : ""
                              }`}
                            >
                              {isReviewExpanded(review.id || "") ? "Ver menos" : "Ver más"}
                            </button>
                          )}
                        </div>
                        
                        <p className="font-semibold text-neutral-900 mt-auto" aria-label={`Reseña de ${review.userName || review.name}`}>
                          - {review.userName || review.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevReviews}
              className="absolute top-1/2 left-0 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-neutral-100 transition-colors z-10 hidden md:block"
              aria-label="Reseña anterior"
            >
              <ChevronLeft className="w-6 h-6 text-neutral-700" />
            </button>
            <button
              onClick={nextReviews}
              className="absolute top-1/2 right-0 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-neutral-100 transition-colors z-10 hidden md:block"
              aria-label="Siguiente reseña"
            >
              <ChevronRight className="w-6 h-6 text-neutral-700" />
            </button>
          </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Sin reseñas destacadas</h3>
              <p className="text-neutral-600">Aún no tenemos reseñas destacadas. ¡Sé el primero en compartir tu experiencia!</p>
            </div>
          )}
        </div>
      </section>

      {/* 8. 🧪 [NUEVA] – Sección “Calidad asegurada” */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          <figure className="relative w-full lg:w-1/2 aspect-video rounded-2xl overflow-hidden shadow-lg">
            <ImageWrapper
              src={qualityAssuredImage}
              alt="Elaboración artesanal de pastas Paula Pastas"
              fill
              className="object-cover"
              fallback="/placeholder.svg?height=400&width=600&text=Calidad+Asegurada"
            />
          </figure>
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Calidad asegurada</h2>
            <p className="text-lg text-neutral-700 leading-relaxed">
              Cuando decimos que nuestras pastas artesanales son otra cosa, lo sostenemos. Cada ingrediente es
              seleccionado con el mayor cuidado y cada paso de la elaboración se realiza con la pasión y el saber hacer
              que solo una tradición de años puede ofrecer.
            </p>
          </div>
        </div>
      </section>

      {/* 9. ❓ [NUEVA] – Sección “Preguntas frecuentes” (acordeón) */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Preguntas frecuentes</h2>
            <p className="text-lg text-neutral-600">
              Resolvemos tus dudas más comunes sobre nuestros productos y servicios.
            </p>
          </div>

          <div className="space-y-4">
            {STATIC_FAQS.map((faq, index) => (
              <details
                key={index}
                className="bg-neutral-50 rounded-lg shadow-sm p-5 cursor-pointer group"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                <summary className="flex justify-between items-center font-bold text-neutral-900 text-lg">
                  {faq.question}
                  <ChevronRight className="w-5 h-5 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                </summary>
                <div className="mt-4 text-neutral-700 leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10. 🗣️ [NUEVA] – Sección “¿Tenés otra consulta?” */}
      <section className="py-16 bg-primary-50 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">¿Tenés otra consulta?</h2>
          <p className="text-xl mb-8 text-neutral-700">
            Te ayudamos por WhatsApp. Nuestro equipo está listo para responder todas tus preguntas.
          </p>
          <a
            href="https://wa.me/5493411234567" // Reemplaza con tu número de WhatsApp
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#1DA851] transition-colors"
            aria-label="Chatear por WhatsApp con Paula Pastas"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Hablemos por WhatsApp
          </a>
        </div>
      </section>

      {/* 11. 📬 [NUEVA] – Sección "Mantente informado" */}
      <section className="py-16 bg-primary-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterForm />
        </div>
      </section>

      {/* Componente de Debug para Imágenes (solo en desarrollo) */}
      <ImageDebugInfo 
        src={heroImage}
        alt="Imagen principal del home"
        componentName="Home Hero"
      />
    </div>
  )
}
