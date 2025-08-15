"use client"

import { useEffect } from 'react'

interface ImagePreloaderProps {
  images: string[]
  priority?: boolean
}

export function ImagePreloader({ images, priority = false }: ImagePreloaderProps) {
  useEffect(() => {
    if (!images.length) return

    const preloadImages = async () => {
      const imagePromises = images.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(src)
          img.onerror = () => reject(src)
          img.src = src
        })
      })

      try {
        await Promise.all(imagePromises)
        console.log('🖼️ Imágenes precargadas exitosamente')
      } catch (error) {
        console.warn('⚠️ Error precargando algunas imágenes:', error)
      }
    }

    if (priority) {
      // Precargar inmediatamente si es priority
      preloadImages()
    } else {
      // Precargar después de que la página se haya cargado
      const timer = setTimeout(preloadImages, 1000)
      return () => clearTimeout(timer)
    }
  }, [images, priority])

  return null // Componente invisible
}
