import { useState, useEffect, useCallback } from 'react'

interface ImageCache {
  [key: string]: {
    loaded: boolean
    error: boolean
    timestamp: number
  }
}

// Cache global para imágenes
const imageCache: ImageCache = {}
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutos

export function useImageOptimization() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  // Función para precargar una imagen
  const preloadImage = useCallback((src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Verificar cache
      const cached = imageCache[src]
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        if (cached.loaded) {
          setLoadedImages(prev => new Set(prev).add(src))
          resolve(true)
          return
        }
        if (cached.error) {
          resolve(false)
          return
        }
      }

      const img = new Image()
      
      img.onload = () => {
        imageCache[src] = {
          loaded: true,
          error: false,
          timestamp: Date.now()
        }
        setLoadedImages(prev => new Set(prev).add(src))
        resolve(true)
      }
      
      img.onerror = () => {
        imageCache[src] = {
          loaded: false,
          error: true,
          timestamp: Date.now()
        }
        resolve(false)
      }
      
      img.src = src
    })
  }, [])

  // Función para precargar múltiples imágenes
  const preloadImages = useCallback(async (images: string[]): Promise<string[]> => {
    const validImages = images.filter(src => src && !src.includes('placeholder'))
    
    if (!validImages.length) return []

    const results = await Promise.allSettled(
      validImages.map(src => preloadImage(src))
    )

    const loadedImages = results
      .map((result, index) => result.status === 'fulfilled' && result.value ? validImages[index] : null)
      .filter(Boolean) as string[]

    return loadedImages
  }, [preloadImage])

  // Función para verificar si una imagen está cargada
  const isImageLoaded = useCallback((src: string): boolean => {
    return loadedImages.has(src) || (imageCache[src]?.loaded && Date.now() - imageCache[src].timestamp < CACHE_DURATION)
  }, [loadedImages])

  // Función para limpiar cache antiguo
  const cleanCache = useCallback(() => {
    const now = Date.now()
    Object.keys(imageCache).forEach(key => {
      if (now - imageCache[key].timestamp > CACHE_DURATION) {
        delete imageCache[key]
      }
    })
  }, [])

  // Limpiar cache periódicamente
  useEffect(() => {
    const interval = setInterval(cleanCache, CACHE_DURATION)
    return () => clearInterval(interval)
  }, [cleanCache])

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    loadedImages: Array.from(loadedImages),
    cleanCache
  }
}
