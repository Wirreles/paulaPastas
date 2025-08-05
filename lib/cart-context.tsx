"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Producto } from "./types"

// Definir la interfaz para un ítem del carrito
export interface CartItem {
  productId: string
  name: string
  quantity: number
  price: number
  imageUrl?: string
  slug: string
  categoria: string
  subcategoria: string
}

// Definir la interfaz para el contexto del carrito
interface CartContextType {
  items: CartItem[]
  addItem: (product: Producto, quantity: number) => void
  removeItem: (productId: string) => void
  updateItemQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  toggleCart: () => void
  closeCart: () => void
}

// Crear el contexto
const CartContext = createContext<CartContextType | undefined>(undefined)

// Proveedor del contexto del carrito
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false) // Para asegurar que localStorage se cargue

  // Cargar el carrito desde localStorage al inicio
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("comida-casera-cart")
      if (storedCart) {
        setItems(JSON.parse(storedCart))
      }
      setIsLoaded(true)
    }
  }, [])

  // Guardar el carrito en localStorage cada vez que cambian los ítems
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("comida-casera-cart", JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = useCallback((product: Producto, quantity: number) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id)
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        return [
          ...prevItems,
          {
            productId: product.id!,
            name: product.nombre,
            quantity,
            price: product.precio,
            imageUrl: product.imagen,
            slug: product.slug,
            categoria: product.categoria,
            subcategoria: product.subcategoria,
          },
        ]
      }
    })
    setIsCartOpen(true) // Abrir el carrito al añadir un producto
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId))
  }, [])

  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    setItems(
      (prevItems) =>
        prevItems
          .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item))
          .filter((item) => item.quantity > 0), // Eliminar si la cantidad llega a 0
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev)
  }, [])

  const closeCart = useCallback(() => {
    setIsCartOpen(false)
  }, [])

  const value = {
    items,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    toggleCart,
    closeCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Hook personalizado para usar el carrito
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
