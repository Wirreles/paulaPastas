"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Minus, Plus, MapPin, CheckCircle } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { ImageWrapper } from "@/components/ui/ImageWrapper"

export default function CartSidebar() {
  const { items, removeItem, updateItemQuantity, totalPrice, totalItems, isCartOpen, closeCart } = useCart()

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            Tu Carrito ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <ShoppingBag className="w-16 h-16 mb-4" />
            <p className="text-lg font-semibold">Tu carrito está vacío</p>
            <p className="text-sm">¡Agrega algunos productos para empezar!</p>
            <Button onClick={closeCart} className="mt-4">
              Explorar Productos
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                    <ImageWrapper
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      fallback="/placeholder.svg?height=80&width=80&text=Producto"
                    />
                  </div>
                  <div className="flex-1">
                    <Link href={`/pastas/${item.categoria}/${item.subcategoria}/${item.slug}`} onClick={closeCart}>
                      <h3 className="font-medium text-neutral-900 hover:text-primary-600 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-neutral-500">{formatPrice(item.price)} c/u</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => removeItem(item.productId)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen informativo adicional */}
            <div className="bg-primary-100 text-primary-800 p-4 rounded-lg mb-4 text-sm">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <MapPin className="w-4 h-4" />
                Zonas de entrega:
              </div>
              <p className="mb-1">
                Rosario y alrededores (para garantizar que el producto llegue fresco y en el tiempo perfecto).
              </p>
              <div className="flex items-center gap-2 font-semibold mt-3 mb-2">
                <CheckCircle className="w-4 h-4" />
                Nuestra promesa:
              </div>
              <p>Disfrutá la experiencia del ritual con todas tus compras.</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span>Subtotal:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <p className="text-sm text-neutral-500 mb-4">
                *El costo de envío se coordina por WhatsApp luego de la compra.
              </p>
              <Link href="/checkout" passHref>
                <Button className="w-full py-3 text-lg" onClick={closeCart}>
                  Continuar compra
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
