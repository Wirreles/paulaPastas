/**
 * Utilidades para optimización de imágenes
 * Reduce el consumo de Image Optimization de Vercel
 */

// Utilidades para manejo de imágenes

export interface ImageConfig {
  src: string
  alt: string
  fallback?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  quality?: number
  sizes?: string
}

// Dominios que SÍ queremos optimizar con next/image
export const OPTIMIZABLE_DOMAINS = [
  'images.unsplash.com',
  'assets.elgourmet.com'
]

// Dominios que NO queremos optimizar (usar <img> directamente)
export const NON_OPTIMIZABLE_DOMAINS = [
  'firebasestorage.googleapis.com'
]

/**
 * Determina si una imagen debe usar next/image o <img> HTML
 */
export function shouldUseNextImage(url: string): boolean {
  if (!url || url.trim() === '') return false
  
  // URLs locales siempre usar <img>
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return false
  }
  
  // Placeholders usar <img>
  if (url.includes('placeholder.svg')) {
    return false
  }
  
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname
    
    // Si está en la lista de NO optimizables, usar <img>
    if (NON_OPTIMIZABLE_DOMAINS.includes(hostname)) {
      return false
    }
    
    // Si está en la lista de optimizables, usar next/image
    if (OPTIMIZABLE_DOMAINS.includes(hostname)) {
      return true
    }
    
    // Para cualquier otro dominio, usar <img> por defecto
    return false
  } catch {
    // Si no es una URL válida, usar <img>
    return false
  }
}

/**
 * Valida y limpia una URL de imagen
 */
export function validateImageUrl(url: string | undefined, fallback: string = '/placeholder.svg'): string {
  if (!url || url.trim() === '') {
    return fallback
  }
  
  // Si es un placeholder, devolver directamente
  if (url.includes('placeholder.svg')) {
    return url
  }
  
  try {
    new URL(url)
    return url
  } catch {
    return fallback
  }
}

/**
 * Obtiene la configuración optimizada para una imagen
 */
export function getOptimizedImageConfig(
  src: string | undefined,
  alt: string,
  options: Partial<ImageConfig> = {}
): ImageConfig {
  const validatedSrc = validateImageUrl(src, options.fallback || '/placeholder.svg')
  const useNextImage = shouldUseNextImage(validatedSrc)
  
  return {
    src: validatedSrc,
    alt,
    fallback: options.fallback || '/placeholder.svg',
    priority: options.priority || false,
    loading: options.loading || 'lazy',
    quality: useNextImage ? (options.quality || 75) : undefined,
    sizes: useNextImage ? (options.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw') : undefined
  }
}

/**
 * Genera un placeholder SVG simple
 */
export function generatePlaceholder(width: number, height: number, text: string = 'Image'): string {
  return `/placeholder.svg?width=${width}&height=${height}&text=${encodeURIComponent(text)}`
}
