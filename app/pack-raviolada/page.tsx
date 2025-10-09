"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, MessageCircle, ArrowRight, ShoppingBag, Minus, Plus, Package, Gift, Clock, Users, Eye, Star } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import { Producto } from "@/lib/types"
import { useCart } from "@/lib/cart-context"



export default function PackRavioladaPage() {
  // Datos estáticos del banner
  const bannerData = {
    imageUrl: "/banners/banner-pack.webp",
    title: "Nuestros combos artesanales",
    subtitle: "Proba más sabores, compartí más momentos. Packs ideales para cenas con amigos, degustaciones en pareja o para regalar.",
    description: "Banner principal de la página de Packs y Combos Artesanales"
  }

  const [packs, setPacks] = useState<Producto[]>([])
  const [isLoadingPacks, setIsLoadingPacks] = useState(true)
  
  // Estados para el carrito y cantidades (igual que en el home)
  const { addItem } = useCart()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  // useEffect para cargar los packs dinámicamente
  useEffect(() => {
    async function loadPacks() {
      try {
        setIsLoadingPacks(true)
        console.log("🔄 Cargando packs desde Firebase...")
        
        const packsData = await FirebaseService.getProductos('packs')
        console.log(`📦 Packs cargados: ${packsData.length}`)
        setPacks(packsData)
      } catch (error) {
        console.error("❌ Error cargando packs:", error)
        setPacks([])
      } finally {
        setIsLoadingPacks(false)
      }
    }
    
    loadPacks()
  }, [])

  // Funciones del carrito (igual que en el home)
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
    name: "Packs y Combos Artesanales",
    description: "Packs ideales para cenas con amigos, degustaciones en pareja o para regalar",
    url: "https://paulapastas.com/pack-raviolada",
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
          name: "Packs",
          item: "https://paulapastas.com/pack-raviolada",
        },
      ],
    },
  }

  // Datos estáticos de packs - ELIMINADO, ahora se cargan dinámicamente desde Firebase
  // const packs = [...] // Removido

  // Beneficios de los packs
  const beneficios = [
    {
      icon: Package,
      titulo: "Menor precio por unidad",
      descripcion: "Ahorrá dinero comprando en pack. Cada unidad sale más económica que comprando por separado."
    },
    {
      icon: Clock,
      titulo: "Ideal para planear comidas",
      descripcion: "Sin decidir en el momento. Tené todo listo para cuando quieras cocinar sin complicaciones."
    },
    {
      icon: Gift,
      titulo: "Perfecto para regalar",
      descripcion: "Pensados para regalar a amantes de la pasta artesanal. Un regalo que siempre sorprende."
    },
    {
      icon: Users,
      titulo: "Siempre listos para sorprender",
      descripcion: "Se conservan congelados – siempre listos para sorprender a familia y amigos."
    }
  ]

  // Datos de FAQ
  const faqs = [
    {
      pregunta: "¿Cuántas porciones rinde cada combo?",
      respuesta: "Cada pack está diseñado para diferentes cantidades de personas. El Pack Clásico rinde 4-6 porciones, el Romántico para 2 personas, el Familiar para 6-8 personas y el Gourmet para 4 personas."
    },
    {
      pregunta: "¿Hacen envíos a mi zona?",
      respuesta: "Realizamos envíos a Rosario, Funes, Fisherton, Villa Gobernador Gálvez, Alvear y zonas cercanas. Si tenés dudas sobre tu barrio, contactanos por WhatsApp."
    },
    {
      pregunta: "¿Cuánto duran los packs en el freezer?",
      respuesta: "Todos nuestros packs duran hasta 30 días en el freezer manteniendo su calidad y sabor. Te recomendamos consumirlos dentro de este plazo."
    },
    {
      pregunta: "¿Puedo personalizar un pack?",
      respuesta: "¡Por supuesto! Podés crear tu pack personalizado eligiendo tus pastas y salsas favoritas. Contactanos por WhatsApp para armar tu combo ideal."
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
              <span className="text-neutral-900 font-medium">Packs</span>
            </nav>
          </div>
        </div>

        {/* 1. Banner Principal - Ahora estático */}
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
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              {bannerData.title}
            </h1>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl text-neutral-100 leading-relaxed mb-4">
                {bannerData.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* 2. Sección de Productos */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Nuestros Packs
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Combinaciones perfectas para diferentes ocasiones y cantidades de personas
              </p>
            </div>

            {isLoadingPacks ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">⏳</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Cargando packs...</h3>
                <p className="text-neutral-600">Esperá un momento mientras cargamos nuestros packs destacados</p>
              </div>
            ) : packs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packs.map((pack) => {
                  console.log("🔍 Renderizando pack:", pack)
                  const productUrl = `/packs/${pack.slug}`
                  const quantity = getQuantity(pack.id)
                  
                  return (
                    <article key={pack.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover-lift group flex flex-col h-full">
                      {/* Imagen más grande */}
                      <div className="relative h-64">
                        <Link href={productUrl}>
                          <Image
                            src={pack.imagen}
                            alt={`${pack.nombre} caseros artesanales`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </Link>
                        {pack.destacado && (
                          <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Destacado
                          </div>
                        )}
                        {!pack.disponible && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">No Disponible</span>
                          </div>
                        )}
                        {/* Badge de descuento */}
                        {(pack as any).precioOriginal && (pack as any).precioOriginal > pack.precio && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {Math.round((((pack as any).precioOriginal - pack.precio) / (pack as any).precioOriginal) * 100)}% OFF
                          </div>
                        )}
                      </div>

                      {/* Contenido de la card con flex-grow para ocupar el espacio disponible */}
                      <div className="p-4 flex flex-col flex-grow">
                        <Link href={productUrl}>
                          <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                            {pack.nombre}
                          </h3>
                        </Link>

                        <p className="text-neutral-600 mb-4 text-sm line-clamp-4 flex-grow">{pack.descripcionAcortada || pack.descripcion}</p>

                        {/* Precio dinámico y selector de cantidad en la misma línea */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-xl font-bold text-primary-600">{formatPrice(pack.precio * quantity)}</span>
                            {pack.porciones && (
                              <span className="text-sm text-neutral-500 ml-2">{pack.porciones} personas</span>
                            )}
                          </div>

                          {/* Selector de cantidad */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(pack.id, -1)}
                              className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
                              disabled={quantity <= 1}
                            >
                              <Minus className="w-4 h-4 text-neutral-700" />
                            </button>
                            <span className="text-lg font-semibold text-neutral-900 w-8 text-center">{quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(pack.id, 1)}
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
                            onClick={() => handleAddToCart(pack)}
                            className="flex-1 bg-primary-600 text-white text-center px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            disabled={!pack.disponible}
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
                <p className="text-neutral-600">Estamos preparando deliciosos packs para esta categoría</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. Sección Explicativa */}
        <section className="py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                ¿Por qué elegir nuestros combos?
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Descubrí las ventajas de nuestros packs artesanales
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {beneficios.map((beneficio, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover-lift">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <beneficio.icon className="w-6 h-6 text-primary-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-3">
                        {beneficio.titulo}
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        {beneficio.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Preguntas Frecuentes */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-lg text-neutral-600">
                Resolvemos las dudas más comunes sobre nuestros combos y el proceso de compra
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
              Nuestro equipo está listo para ayudarte a elegir el pack perfecto para tu ocasión
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
              <label htmlFor="email-newsletter-packs" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="email-newsletter-packs"
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