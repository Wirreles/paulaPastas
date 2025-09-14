import type { Metadata } from "next"
import { FirebaseService } from "@/lib/firebase-service"
import { notFound } from "next/navigation"
import ProductoPageClient from "./ProductoPageClient"

interface PackPageProps {
  params: {
    pack: string
  }
}

export async function generateMetadata({ params }: PackPageProps): Promise<Metadata> {
  const { pack: packSlug } = params
  const producto = await getProducto(packSlug)

  if (!producto) {
    return {
      title: "Pack no encontrado | Paula Pastas",
      description: "El pack solicitado no existe.",
    }
  }

  return {
    title: producto.seoTitle || `${producto.nombre} | Pack | Paula Pastas`,
    description: producto.seoDescription || producto.descripcion,
    keywords:
      producto.seoKeywords?.join(", ") ||
      `${producto.nombre.toLowerCase()}, pack, combos, pastas caseras, artesanales, rosario, delivery`,
    openGraph: {
      title: `${producto.nombre} | Paula Pastas`,
      description: producto.descripcion,
      images: [{ url: producto.imagen, width: 800, height: 600, alt: producto.nombre }],
      type: "website",
      locale: "es_AR",
    },
    alternates: {
      canonical: `https://paulapastas.com/packs/${packSlug}`,
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

async function getProductosRelacionados(currentSlug: string) {
  try {
    const productos = await FirebaseService.getProductos("packs")
    return productos.filter((p) => p.slug !== currentSlug).slice(0, 3)
  } catch (error) {
    console.error("Error fetching productos relacionados:", error)
    return []
  }
}

async function getProductosComplementarios(): Promise<any[]> {
  try {
    // Las salsas son complementarias para los packs
    const salsas = await FirebaseService.getProductos("salsas")
    return salsas.slice(0, 3)
  } catch (error) {
    console.error("Error fetching productos complementarios:", error)
    return []
  }
}

export default async function PackPage({ params }: PackPageProps) {
  const { pack: packSlug } = params
  const producto = await getProducto(packSlug)

  if (!producto) {
    notFound()
  }

  const productosRelacionados = await getProductosRelacionados(packSlug)
  const productosComplementarios = await getProductosComplementarios()

  return (
    <ProductoPageClient
      categoria="packs"
      subcategoria="pack"
      productoSlug={packSlug}
      producto={producto}
      productosRelacionados={productosRelacionados}
      productosComplementarios={productosComplementarios}
    />
  )
}
