/**
 * Utilidades para optimización de imágenes
 * Reduce el consumo de Image Optimization de Vercel
 */

// Función para validar URLs de imágenes
export function isValidImageUrl(url: string | undefined): boolean {
  if (!url || url === '') return false
  
  try {
    const parsedUrl = new URL(url)
    return ['http:', 'https:'].includes(parsedUrl.protocol)
  } catch {
    return false
  }
}

// Función para determinar si una imagen es de Firebase Storage
export function isFirebaseImage(url: string): boolean {
  return url.includes('firebasestorage.googleapis.com')
}

// Función para determinar si una imagen debe ser optimizada por Vercel
export function shouldOptimizeImage(url: string): boolean {
  // Solo optimizar imágenes de dominios específicos, NO Firebase
  const optimizableDomains = [
    'images.unsplash.com',
    'tudominio.com', // Agregar tu dominio si quieres optimización
  ]
  
  try {
    const parsedUrl = new URL(url)
    return optimizableDomains.some(domain => parsedUrl.hostname === domain)
  } catch {
    return false
  }
}

// Función para generar fallbacks optimizados
export function getOptimizedFallback(
  text: string, 
  width: number = 400, 
  height: number = 300
): string {
  const encodedText = encodeURIComponent(text)
  return `/placeholder.svg?width=${width}&height=${height}&text=${encodedText}`
}

// Función para obtener dimensiones de imagen basadas en el contexto
export function getImageDimensions(context: 'hero' | 'product' | 'category' | 'gallery' | 'banner') {
  const dimensions = {
    hero: { width: 1200, height: 800 },
    product: { width: 400, height: 300 },
    category: { width: 400, height: 300 },
    gallery: { width: 400, height: 300 },
    banner: { width: 600, height: 400 }
  }
  
  return dimensions[context] || dimensions.product
}

// Función para generar alt text descriptivo
export function generateAltText(
  baseText: string, 
  context?: string, 
  additionalInfo?: string
): string {
  let altText = baseText
  
  if (context) {
    altText += ` ${context}`
  }
  
  if (additionalInfo) {
    altText += ` - ${additionalInfo}`
  }
  
  return altText
}

// Función para pre-cargar imágenes críticas
export function preloadCriticalImages(urls: string[]): void {
  urls.forEach(url => {
    if (isValidImageUrl(url)) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    }
  })
}

// Función para generar srcset para imágenes responsivas
export function generateSrcSet(
  baseUrl: string, 
  widths: number[] = [400, 800, 1200]
): string {
  return widths
    .map(width => `${baseUrl}?w=${width} ${width}w`)
    .join(', ')
}

// Función para comprimir URLs de Firebase Storage (si es necesario)
export function optimizeFirebaseUrl(url: string): string {
  if (!isFirebaseImage(url)) return url
  
  // Firebase Storage permite parámetros de optimización
  // Agregar parámetros para reducir el tamaño si es necesario
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}alt=media`
}
