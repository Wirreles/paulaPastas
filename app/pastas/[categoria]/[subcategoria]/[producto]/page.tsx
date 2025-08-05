import type { Metadata } from "next"
import { FirebaseService } from "@/lib/firebase-service"
import { notFound } from "next/navigation"
import ProductoPageClient from "./ProductoPageClient"

interface ProductoPageProps {
  params: {
    categoria: string
    subcategoria: string
    producto: string
  }
}

// generateMetadata debe ser una función asíncrona en un Server Component
// Para que funcione con 'use client', la metadata se manejaría de otra forma
// o se mantendría esta página como Server Component y los interactivos como Client Components.
// Por ahora, la mantendremos como Server Component y los hooks/estados en los componentes hijos.
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
    title: producto.seoTitle || `${producto.nombre} | ${subcategoria} | Comida Casera`,
    description: producto.seoDescription || producto.descripcion,
    keywords:
      producto.seoKeywords?.join(", ") ||
      `${producto.nombre.toLowerCase()}, ${subcategoria}, ${categoria}, pastas caseras, artesanales, rosario, delivery`,
    openGraph: {
      title: `${producto.nombre} | Comida Casera`,
      description: producto.descripcion,
      images: [{ url: producto.imagen, width: 800, height: 600, alt: producto.nombre }],
      type: "website",
      locale: "es_AR",
    },
    alternates: {
      canonical: `https://comidacasera.com/pastas/${categoria}/${subcategoria}/${productoSlug}`,
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

async function getProductosComplementarios(): Promise<any[]> {
  try {
    // Por ahora, asumimos que las salsas son complementarias
    const salsas = await FirebaseService.getProductos("salsas")
    return salsas.slice(0, 3) // Mostrar hasta 3 salsas
  } catch (error) {
    console.error("Error fetching productos complementarios:", error)
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
  const productosComplementarios = await getProductosComplementarios()

  return (
    <ProductoPageClient
      categoria={categoria}
      subcategoria={subcategoria}
      productoSlug={productoSlug}
      producto={producto}
      productosRelacionados={productosRelacionados}
      productosComplementarios={productosComplementarios}
    />
  )
}
