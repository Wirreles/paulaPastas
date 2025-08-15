"use client"

import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"

interface ImageWrapperProps {
  src: string | undefined
  alt: string
  fallback?: string
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  width?: number
  height?: number
  fill?: boolean
  // Props adicionales para img
  loading?: "lazy" | "eager"
  onLoad?: () => void
  onError?: () => void
  // Nuevas props para lazy loading
  lazyThreshold?: number // Porcentaje de visibilidad para cargar (0-1)
  placeholder?: React.ReactNode // Placeholder mientras no es visible
}

export function ImageWrapper({ 
  src, 
  alt, 
  fallback = "/placeholder.svg", 
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  width,
  height,
  fill = false,
  loading = "lazy",
  className = "",
  onLoad,
  onError,
  lazyThreshold = 0.1, // 10% visible para cargar
  placeholder,
  ...props
}: ImageWrapperProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(priority) // Cargar inmediatamente si es priority
  const imageRef = useRef<HTMLDivElement>(null)

  // Función para validar y procesar URLs de imágenes
  const getImageUrl = (imageUrl: string | undefined, fallbackUrl: string): string => {
    if (!imageUrl || imageUrl === '') {
      return fallbackUrl
    }
    
    // Validar que sea una URL válida
    try {
      new URL(imageUrl)
      return imageUrl
    } catch {
      return fallbackUrl
    }
  }

  // Determinar si la imagen es de Firebase Storage
  const isFirebaseImage = (url: string): boolean => {
    const isFirebase = url.includes('firebasestorage.googleapis.com')
    
    // Debug logging solo cuando realmente se carga
    if (process.env.NODE_ENV === 'development' && shouldLoad) {
      console.log(`🖼️ ImageWrapper Debug:`, {
        url: url.substring(0, 50) + '...',
        isFirebase,
        willUseImg: isFirebase || imageError,
        component: 'ImageWrapper',
        lazyLoaded: !priority
      })
    }
    
    return isFirebase
  }

  // Determinar si la imagen debe usar <img> en lugar de next/image
  const shouldUseImg = (url: string): boolean => {
    // Usar <img> para:
    // 1. Firebase Storage (evitar optimización de Vercel)
    // 2. URLs locales (placeholder.svg, etc.)
    // 3. Errores de imagen
    // 4. URLs que no son dominios optimizables configurados
    
    if (isFirebaseImage(url) || imageError) return true
    
    // Detectar URLs locales
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) return true
    
    // Detectar URLs relativas
    if (!url.startsWith('http')) return true
    
    // Solo usar next/image para dominios específicos que SÍ queremos optimizar
    const optimizableDomains = [
      'images.unsplash.com',
      // Agregar otros dominios que SÍ quieras optimizar
    ]
    
    try {
      const parsedUrl = new URL(url)
      return !optimizableDomains.some(domain => parsedUrl.hostname === domain)
    } catch {
      // Si no es una URL válida, usar <img>
      return true
    }
  }

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || !imageRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setShouldLoad(true)
          observer.disconnect() // Solo cargar una vez
        }
      },
      {
        threshold: lazyThreshold,
        rootMargin: '50px' // Cargar 50px antes de que sea visible
      }
    )

    observer.observe(imageRef.current)

    return () => observer.disconnect()
  }, [priority, lazyThreshold])

  const imageUrl = getImageUrl(src, fallback)
  const shouldUseImgResult = shouldUseImg(imageUrl)

  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setIsLoading(false)
    onError?.()
  }, [onError])

  // Si no debe cargar aún, mostrar placeholder
  if (!shouldLoad) {
    return (
      <div 
        ref={imageRef}
        className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}
      >
        {placeholder || (
          <div className="absolute inset-0 bg-neutral-200 animate-pulse rounded flex items-center justify-center">
            <span className="text-neutral-400 text-sm">Cargando...</span>
          </div>
        )}
      </div>
    )
  }

  // Si es imagen de Firebase, local o hubo error, usar <img> para evitar optimización de Vercel
  if (shouldUseImgResult) {
    // Debug logging solo cuando se carga
    if (process.env.NODE_ENV === 'development') {
      const reason = isFirebaseImage(imageUrl) 
        ? 'Firebase Storage' 
        : imageUrl.startsWith('/') 
        ? 'URL Local' 
        : 'Error de imagen'
      
      console.log(`🖼️ Renderizando como <img> HTML:`, {
        url: imageUrl.substring(0, 50) + '...',
        reason,
        component: 'ImageWrapper',
        lazyLoaded: !priority
      })
    }
    
    return (
      <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-neutral-200 animate-pulse rounded" />
        )}
        <img 
          src={imageUrl}
          alt={alt}
          loading={loading}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={{ 
            maxWidth: "100%", 
            height: "auto",
            ...(fill && { width: "100%", height: "100%", objectFit: "cover" })
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          {...props}
        />
      </div>
    )
  }

  // Para imágenes que SÍ queremos optimizar (como Unsplash), usar next/image
  // Debug logging solo cuando se carga
  if (process.env.NODE_ENV === 'development') {
    console.log(`🖼️ Renderizando como next/image optimizado:`, {
      url: imageUrl.substring(0, 50) + '...',
      reason: 'Dominio optimizable',
      component: 'ImageWrapper',
      lazyLoaded: !priority
    })
  }
  
  return (
    <Image
      src={imageUrl}
      alt={alt}
      priority={priority}
      sizes={sizes}
      quality={quality}
      width={width}
      height={height}
      fill={fill}
      className={className}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  )
}

// Componente especializado para imágenes de productos (Firebase)
export function ProductImage({ 
  src, 
  alt, 
  fallback = "/placeholder.svg",
  className = "",
  priority = false,
  ...props 
}: Omit<ImageWrapperProps, 'fill'>) {
  return (
    <ImageWrapper
      src={src}
      alt={alt}
      fallback={fallback}
      className={className}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      {...props}
    />
  )
}

// Componente para imágenes de hero/banner (Firebase)
export function HeroImage({ 
  src, 
  alt, 
  fallback = "/placeholder.svg",
  className = "",
  ...props 
}: Omit<ImageWrapperProps, 'priority'>) {
  return (
    <ImageWrapper
      src={src}
      alt={alt}
      fallback={fallback}
      className={className}
      priority={true}
      loading="eager"
      {...props}
    />
  )
}