import type { Metadata } from "next"
import { FirebaseService } from "@/lib/firebase-service"
import { notFound } from "next/navigation"
import ProductoPageClient from "./ProductoPageClient"

interface SalsaPageProps {
  params: {
    salsa: string
  }
}

export async function generateMetadata({ params }: SalsaPageProps): Promise<Metadata> {
  const { salsa: salsaSlug } = params
  const producto = await getProducto(salsaSlug)

  if (!producto) {
    return {
      title: "Salsa no encontrada | Paula Pastas",
      description: "La salsa solicitada no existe.",
    }
  }

  return {
    title: producto.seoTitle || `${producto.nombre} | Salsa | Paula Pastas`,
    description: producto.seoDescription || producto.descripcion,
    keywords:
      producto.seoKeywords?.join(", ") ||
      `${producto.nombre.toLowerCase()}, salsa, salsas caseras, pastas caseras, artesanales, rosario, delivery`,
    openGraph: {
      title: `${producto.nombre} | Paula Pastas`,
      description: producto.descripcion,
      images: [{ url: producto.imagen, width: 800, height: 600, alt: producto.nombre }],
      type: "website",
      locale: "es_AR",
    },
    alternates: {
      canonical: `https://paulapastas.com/salsas/${salsaSlug}`,
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
    const productos = await FirebaseService.getProductos("salsas")
    return productos.filter((p) => p.slug !== currentSlug).slice(0, 3)
  } catch (error) {
    console.error("Error fetching productos relacionados:", error)
    return []
  }
}

async function getProductosComplementarios(): Promise<any[]> {
  try {
    // Los packs son complementarios para las salsas
    const packs = await FirebaseService.getProductos("packs")
    return packs.slice(0, 3)
  } catch (error) {
    console.error("Error fetching productos complementarios:", error)
    return []
  }
}

export default async function SalsaPage({ params }: SalsaPageProps) {
  const { salsa: salsaSlug } = params
  const producto = await getProducto(salsaSlug)

  if (!producto) {
    notFound()
  }

  const productosRelacionados = await getProductosRelacionados(salsaSlug)
  const productosComplementarios = await getProductosComplementarios()

  return (
    <ProductoPageClient
      categoria="salsas"
      subcategoria="salsa"
      productoSlug={salsaSlug}
      producto={producto}
      productosRelacionados={productosRelacionados}
      productosComplementarios={productosComplementarios}
    />
  )
}
