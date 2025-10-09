import type { MetadataRoute } from "next"
import { FirebaseService } from "@/lib/firebase-service"

// Función para convertir cualquier fecha a formato ISO 8601 válido
function formatDateForSitemap(date: any): Date {
  if (!date) return new Date()
  
  try {
    // Si es un Timestamp de Firebase, convertir a Date
    if (date && typeof date === 'object' && 'toDate' in date) {
      return date.toDate()
    }
    // Si ya es un Date, devolverlo
    if (date instanceof Date) {
      return date
    }
    // Si es string, intentar parsearlo
    if (typeof date === 'string') {
      return new Date(date)
    }
    // Si es un número (timestamp), convertir
    if (typeof date === 'number') {
      return new Date(date)
    }
  } catch (error) {
    console.warn('Error converting date for sitemap:', error)
  }
  
  // Fallback a fecha actual
  return new Date()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://paulapastas.com"

  // URLs estáticas
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pack-raviolada`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/delivery`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/pastas`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pastas/rellenas`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pastas/sin-relleno`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pastas/sin-tacc`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pastas/salsas`, // Nueva URL para salsas
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/salsas`, // Página principal de salsas
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/packs`, // Página principal de packs
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    // Subcategorías
    {
      url: `${baseUrl}/pastas/rellenas/lasagna`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pastas/rellenas/ravioles`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pastas/rellenas/sorrentinos`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pastas/sin-relleno/noquis`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pastas/sin-relleno/fideos`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pastas/sin-relleno/ravioles-fritos`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pastas/salsas/salsas-clasicas`, // Nueva URL para subcategoría de salsas
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pastas/salsas/salsas-gourmet`, // Nueva URL para subcategoría de salsas
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    // Zonas
    {
      url: `${baseUrl}/zona/vgg`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/zona/rosario-centro`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/zona/zona-sur`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/zona/zona-oeste`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ]

  // URLs dinámicas de productos
  try {
    const productos = await FirebaseService.getProductos()
    const productUrls = productos.map((producto) => ({
      url: `${baseUrl}/pastas/${producto.categoria}/${producto.subcategoria || "productos"}/${producto.slug}`,
      lastModified: formatDateForSitemap(producto.fechaActualizacion),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

    return [...staticUrls, ...productUrls]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return staticUrls
  }
}
