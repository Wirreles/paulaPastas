"use client"

import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { shouldUseNextImage, validateImageUrl } from "@/lib/image-utils"

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
  loading?: "lazy" | "eager"
  onLoad?: () => void
  onError?: () => void
  lazyThreshold?: number
  placeholder?: React.ReactNode
}

export function ImageWrapper({
  src,
  alt,
  fallback = "/placeholder.svg",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 75, // Reducido para mejor rendimiento
  width,
  height,
  fill = false,
  loading = "lazy",
  className = "",
  onLoad,
  onError,
  lazyThreshold = 0.05, // Reducido para cargar más temprano
  placeholder,
  ...props
}: ImageWrapperProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // Inicializar shouldLoad en true si estamos en el navegador (client-side)
  // Esto soluciona el problema con SSR donde el Intersection Observer no funciona
  const [shouldLoad, setShouldLoad] = useState(priority || typeof window !== 'undefined')
  const imageRef = useRef<HTMLDivElement>(null)

  // Función optimizada para validar URLs
  const getImageUrl = useCallback((imageUrl: string | undefined, fallbackUrl: string): string => {
    return validateImageUrl(imageUrl, fallbackUrl)
  }, [])

  // Determinar si usar <img> en lugar de next/image
  const shouldUseImg = useCallback((url: string): boolean => {
    return !shouldUseNextImage(url)
  }, [])

  // Intersection Observer optimizado
  useEffect(() => {
    if (priority || !imageRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      {
        threshold: lazyThreshold,
        rootMargin: '100px' // Aumentado para precargar más temprano
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

  // Placeholder optimizado
  if (!shouldLoad) {
    return (
      <div
        ref={imageRef}
        className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}
      >
        {placeholder || (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 animate-pulse rounded flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
          </div>
        )}
      </div>
    )
  }

  // Usar <img> para Firebase Storage y URLs locales
  if (shouldUseImgResult) {
    return (
      <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 animate-pulse rounded" />
        )}
        <img
          src={imageUrl}
          alt={alt}
          loading={priority ? "eager" : loading}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
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

  // Usar next/image para URLs optimizables
  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 animate-pulse rounded z-10" />
      )}
      <Image
        src={imageUrl}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        quality={quality}
        loading={priority ? "eager" : loading}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
    </div>
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