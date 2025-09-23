"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import { HeroPlaceholder, ProductPlaceholder } from "@/components/ui/ImagePlaceholder"
import { ChevronDown, MessageCircle, ArrowRight, ShoppingBag, Minus, Plus, Eye, Star } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import { PageBanner, Producto } from "@/lib/types"
import { useCart } from "@/lib/cart-context"

export default function SalsasPage() {
  const [banner, setBanner] = useState<PageBanner | null>(null)
  const [isLoadingBanner, setIsLoadingBanner] = useState(true)
  const [salsas, setSalsas] = useState<Producto[]>([])
  const [isLoadingSalsas, setIsLoadingSalsas] = useState(true)
  
  // Estados para el carrito y cantidades (igual que en el home y packs)
  const { addItem } = useCart()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  // useEffect para cargar el banner dinámicamente
  useEffect(() => {
    async function loadBanner() {
      try {
        setIsLoadingBanner(true)
        console.log("🔄 Cargando banner para salsas...")
        
        const bannerData = await FirebaseService.getPageBannerBySlug("salsas")
        if (bannerData) {
          console.log("✅ Banner encontrado:", bannerData)
          setBanner(bannerData)
        } else {
          console.log("⚠️ No se encontró banner específico, usando fallback")
          // Banner fallback con datos estáticos
          setBanner({
            id: "fallback",
            name: "Banner Salsas",
            description: "Banner principal de la página de Salsas",
            imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=800&fit=crop",
            title: "Salsas caseras",
            subtitle: "Descubrí nuestras salsas pensadas para potenciar el sabor de cada pasta. Hechas en casa, sin conservantes ni apuros.",
            pageType: "especial",
            slug: "salsas",
            order: 1
          })
        }
      } catch (error) {
        console.error("❌ Error cargando banner:", error)
        // En caso de error, usar banner fallback
        setBanner({
          id: "fallback",
          name: "Banner Salsas",
          description: "Banner principal de la página de Salsas",
          imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=800&fit=crop",
          title: "Salsas caseras",
          subtitle: "Descubrí nuestras salsas pensadas para potenciar el sabor de cada pasta. Hechas en casa, sin conservantes ni apuros.",
          pageType: "especial",
          slug: "salsas",
          order: 1
        })
      } finally {
        setIsLoadingBanner(false)
      }
    }
    
    loadBanner()
  }, [])

  // useEffect para cargar las salsas dinámicamente
  useEffect(() => {
    async function loadSalsas() {
      try {
        setIsLoadingSalsas(true)
        console.log("🔄 Cargando salsas desde Firebase...")
        
        const salsasData = await FirebaseService.getProductos('salsas')
        console.log(`📦 Salsas cargadas: ${salsasData.length}`)
        setSalsas(salsasData)
      } catch (error) {
        console.error("❌ Error cargando salsas:", error)
        setSalsas([])
      } finally {
        setIsLoadingSalsas(false)
      }
    }
    
    loadSalsas()
  }, [])

  // Funciones del carrito (igual que en el home y packs)
  const getQuantity = (productId: string) => quantities[productId] || 1

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }))
  }

  const handleAddToCart = (producto: Producto) => {
    const quantity = getQuantity(producto.id)
    if (quantity > 0) {
      addItem(producto, quantity)
      // Reset cantidad después de agregar
      setQuantities(prev => ({ ...prev, [producto.id]: 1 }))
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // JSON-LD para datos estructurados
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Salsas Caseras Artesanales",
    description: "Salsas caseras elaboradas con ingredientes frescos y recetas tradicionales",
    url: "https://paulapastas.com/pastas/salsas",
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
          name: "Salsas",
          item: "https://paulapastas.com/pastas/salsas",
        },
      ],
    },
  }

  // Datos estáticos de productos de salsa - ELIMINADO, ahora se cargan dinámicamente desde Firebase
  // const salsas = [...] // Removido

  // Datos de FAQ
  const faqs = [
    {
      pregunta: "¿Cuánto rinden las salsas?",
      respuesta: "Cada salsa rinde aproximadamente 4-6 porciones, dependiendo de la cantidad que uses por plato. Son perfectas para acompañar nuestras pastas frescas."
    },
    {
      pregunta: "¿Cuánto duran en el freezer? ¿Y en la heladera?",
      respuesta: "Duran hasta 30 días en el freezer y 4 días en la heladera, siempre que se mantengan refrigeradas. Te recomendamos consumirlas dentro de estos plazos para mantener la mejor calidad."
    },
    {
      pregunta: "¿Vienen listas para usar o hay que calentarlas?",
      respuesta: "Vienen listas, solo necesitás calentarlas a baño maría o microondas antes de servir. No requieren preparación adicional, solo calentamiento."
    },
    {
      pregunta: "¿Qué zonas cubren con el delivery?",
      respuesta: "Realizamos envíos a Rosario, Funes, Fisherton, Villa Gobernador Gálvez, Alvear y zonas cercanas. Si tenés dudas sobre tu barrio, contactanos por WhatsApp."
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
              <Link href="/pastas" className="text-neutral-500 hover:text-primary-600">
                Pastas
              </Link>
              <span className="text-neutral-400">/</span>
              <span className="text-neutral-900 font-medium">Salsas</span>
            </nav>
          </div>
        </div>

        {/* 1. Banner Principal */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          {isLoadingBanner ? (
            // Loading state
            <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-neutral-600">Cargando banner...</p>
              </div>
            </div>
          ) : banner ? (
            // Banner dinámico
            <>
              <div className="absolute inset-0 z-0">
                <ImageWrapper
                  src={banner.imageUrl}
                  alt={banner.description}
                  fill
                  className="object-cover"
                  priority={true}
                  fallback="/placeholder.svg?height=800&width=1200&text=Salsas+Caseras"
                  placeholder={<HeroPlaceholder className="object-cover" />}
                />
                <div className="absolute inset-0 bg-black/50" />
              </div>

              <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
                <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
                  {banner.title}
                </h1>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
                  <p className="text-xl md:text-2xl text-neutral-100 leading-relaxed">
                    {banner.subtitle}
                  </p>
                </div>
              </div>
            </>
          ) : (
            // Fallback si no hay banner
            <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center">
              <div className="text-center">
                <p className="text-neutral-600">Banner no disponible</p>
              </div>
            </div>
          )}
        </section>

        {/* 2. Galería de Productos */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Nuestras Salsas
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Cada salsa está elaborada con ingredientes frescos y recetas tradicionales
              </p>
            </div>

            {isLoadingSalsas ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">⏳</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Cargando salsas...</h3>
                <p className="text-neutral-600">Esperá un momento mientras cargamos nuestras salsas destacadas</p>
              </div>
            ) : salsas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {salsas.map((salsa) => {
                  console.log("🔍 Renderizando salsa:", salsa)
                  const productUrl = `/salsas/${salsa.slug}`
                  const quantity = getQuantity(salsa.id)
                  
                  return (
                    <article key={salsa.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover-lift group flex flex-col h-full">
                      {/* Imagen más grande */}
                      <div className="relative h-64">
                        <Link href={productUrl}>
                          <ImageWrapper
                            src={salsa.imagen}
                            alt={`${salsa.nombre} caseros artesanales`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            fallback="/placeholder.svg?height=300&width=400&text=Salsa"
                            placeholder={<ProductPlaceholder className="object-cover group-hover:scale-105 transition-transform duration-300" />}
                            lazyThreshold={0.1} // Cargar más temprano
                            loading="lazy"
                          />
                        </Link>
                        {salsa.destacado && (
                          <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Destacado
                          </div>
                        )}
                        {!salsa.disponible && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">No Disponible</span>
                          </div>
                        )}
                        {/* Badge de descuento */}
                        {(salsa as any).precioOriginal && (salsa as any).precioOriginal > salsa.precio && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {Math.round((((salsa as any).precioOriginal - salsa.precio) / (salsa as any).precioOriginal) * 100)}% OFF
                          </div>
                        )}
                      </div>

                      {/* Contenido de la card con flex-grow para ocupar el espacio disponible */}
                      <div className="p-4 flex flex-col flex-grow">
                        <Link href={productUrl}>
                          <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                            {salsa.nombre}
                          </h3>
                        </Link>

                        <p className="text-neutral-600 mb-4 text-sm line-clamp-4 flex-grow">{salsa.descripcionAcortada || salsa.descripcion}</p>

                        {/* Precio dinámico y selector de cantidad en la misma línea */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-xl font-bold text-primary-600">{formatPrice(salsa.precio * quantity)}</span>
                            {salsa.porciones && (
                              <span className="text-sm text-neutral-500 ml-2">{salsa.porciones} personas</span>
                            )}
                          </div>

                          {/* Selector de cantidad */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(salsa.id, -1)}
                              className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
                              disabled={quantity <= 1}
                            >
                              <Minus className="w-4 h-4 text-neutral-700" />
                            </button>
                            <span className="text-lg font-semibold text-neutral-900 w-8 text-center">{quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(salsa.id, 1)}
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
                            onClick={() => handleAddToCart(salsa)}
                            className="flex-1 bg-primary-600 text-white text-center px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            disabled={!salsa.disponible}
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
                <p className="text-neutral-600">Estamos preparando deliciosas salsas para esta categoría</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. Sección Narrativa */}
        <section className="py-16 bg-primary-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="prose prose-lg mx-auto">
              <blockquote className="text-2xl md:text-3xl italic font-serif text-neutral-800 leading-relaxed">
                "Nuestras salsas no son un anexo, son parte del ritual.
                <br />
                Se elaboran el mismo día, con ingredientes reales, sin conservantes,
                <br />
                para que puedas comer como en tu restaurante favorito, sin salir de casa."
              </blockquote>
            </div>
          </div>
        </section>

        {/* 4. Preguntas Frecuentes */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Preguntas Frecuentes
              </h2>
              <p className="text-lg text-neutral-600">
                Resolvemos tus dudas sobre nuestras salsas caseras
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-neutral-50 rounded-lg shadow-sm p-6 cursor-pointer group"
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

        {/* 5. CTA de contacto */}
        <section className="py-16 bg-neutral-50 text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
              ¿Tenés otra consulta?
            </h2>
            <p className="text-lg text-neutral-700 mb-8">
              Nuestro equipo está listo para responder todas tus preguntas sobre nuestras salsas
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

        {/* 6. Newsletter */}
        <section className="py-16 bg-primary-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Mantenete informada
            </h2>
            <p className="text-lg text-neutral-700 mb-8">
              Suscribite y recibí un 10% de descuento en tu primer pedido.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <label htmlFor="email-newsletter-salsas" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="email-newsletter-salsas"
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
          </div>
        </section>
      </div>
    </>
  )
} 