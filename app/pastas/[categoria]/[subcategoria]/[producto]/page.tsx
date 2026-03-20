import type { Metadata } from "next"
import { FirebaseService } from "@/lib/firebase-service"
import { notFound } from "next/navigation"
import { getProductCanonicalUrl } from "@/lib/product-url"
import ProductoPageClient from "./ProductoPageClient"
import { cache } from "react"

// ✅ Definimos la interfaz con params como Promise para Next.js 15
interface ProductoPageProps {
  params: Promise<{
    categoria: string
    subcategoria: string
    producto: string
  }>
}

// ✅ Cache para evitar doble fetch
const getProducto = cache(async (slug: string) => {
  try {
    return await FirebaseService.getProducto(slug)
  } catch (error) {
    console.error("Error fetching producto:", error)
    return null
  }
})

// ✅ Corregido: generateMetadata ahora hace await de params
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

async function getProductosRelacionados(
  categoria: string,
  subcategoria: string,
  currentSlug: string
) {
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
    // Ajustado a "salsas" según tu lógica original
    const productos = await FirebaseService.getProductos("salsas")
    return productos.slice(0, 3)
  } catch (error) {
    console.error("Error fetching productos complementarios:", error)
    return []
  }
}

// ✅ Corregido: El componente principal ahora hace await de params
export default async function ProductoPage({ params }: ProductoPageProps) {
  const { categoria, subcategoria, producto: productoSlug } = await params

  const producto = await getProducto(productoSlug)

  if (!producto) {
    notFound()
  }

  const [productosRelacionados, productosComplementarios] =
    await Promise.all([
      getProductosRelacionados(categoria, subcategoria, productoSlug),
      getProductosComplementarios(),
    ])

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