"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { validateImageUrl } from "@/lib/image-utils"

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
}

export function ImageWrapper({
  src,
  alt,
  fallback = "/placeholder.svg",
  priority = false,
  sizes = "(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw",
  quality = 75,
  width,
  height,
  fill = false,
  loading,
  className = "",
  onLoad,
  onError,
}: ImageWrapperProps) {

  const [currentSrc, setCurrentSrc] = useState(() => validateImageUrl(src, fallback))

  useEffect(() => {
    setCurrentSrc(validateImageUrl(src, fallback))
  }, [src, fallback])

  const handleError = () => {
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback)
    }
    onError?.()
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={currentSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width ?? 500 : undefined}
        height={!fill ? height ?? 500 : undefined}
        priority={priority}
        sizes={fill ? sizes : undefined}
        quality={quality}
        loading={priority ? undefined : loading ?? "lazy"}
        className={className}
        onLoad={onLoad}
        onError={handleError}
      />
    </div>
  )
}

/* Imagen de producto */
export function ProductImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  className = "",
  priority = false,
  ...props
}: Omit<ImageWrapperProps, "fill">) {
  return (
    <ImageWrapper
      src={src}
      alt={alt}
      fallback={fallback}
      className={className}
      priority={priority}
      {...props}
    />
  )
}

/* Imagen hero */
export function HeroImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  className = "",
  ...props
}: Omit<ImageWrapperProps, "priority">) {
  return (
    <ImageWrapper
      src={src}
      alt={alt}
      fallback={fallback}
      className={className}
      priority={true}
      {...props}
    />
  )
}