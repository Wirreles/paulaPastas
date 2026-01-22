"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Star, Minus, Plus, Eye, ArrowRight } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/utils"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import { ProductPlaceholder } from "@/components/ui/ImagePlaceholder"

interface FeaturedProductsProps {
    productos: any[]
}

export default function FeaturedProducts({ productos }: FeaturedProductsProps) {
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
    const { addItem } = useCart()

    const getQuantity = useCallback((productId: string) => {
        return quantities[productId] || 1
    }, [quantities])

    const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max(1, newQuantity)
        }))
    }, [])

    const handleAddToCart = useCallback((producto: any) => {
        const quantity = getQuantity(producto.id)
        if (quantity > 0) {
            addItem(producto, quantity)
            setQuantities(prev => ({ ...prev, [producto.id]: 1 }))
        }
    }, [addItem, getQuantity])

    return (
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

                {productos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {productos.map((producto: any) => {
                            const productUrl = `/pastas/${producto.categoria}/${producto.subcategoria}/${producto.slug}`
                            const quantity = getQuantity(producto.id)

                            return (
                                <article key={producto.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover-lift group flex flex-col h-full">
                                    <div className="relative h-64">
                                        <Link href={productUrl}>
                                            <ImageWrapper
                                                src={producto.imagen}
                                                alt={`${producto.nombre} caseros artesanales`}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                fallback="/placeholder.svg?height=300&width=400&text=Producto"
                                                placeholder={<ProductPlaceholder className="object-cover group-hover:scale-105 transition-transform duration-300" />}
                                                lazyThreshold={0.1}
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

                                    <div className="p-4 flex flex-col flex-grow">
                                        <Link href={productUrl}>
                                            <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                                                {producto.nombre}
                                            </h3>
                                        </Link>

                                        <p className="text-neutral-600 mb-4 text-sm line-clamp-4 flex-grow">{producto.descripcionAcortada}</p>

                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <span className="text-xl font-bold text-primary-600">{formatPrice(producto.precio * quantity)}</span>
                                                {producto.porciones && (
                                                    <span className="text-sm text-neutral-500 ml-2">{producto.porciones} porciones</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleQuantityChange(producto.id, -1)}
                                                    className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
                                                    disabled={quantity <= 1}
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
    )
}
