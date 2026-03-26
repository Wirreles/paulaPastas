"use client"

import Image from "next/image"
import { useState, useMemo } from "react"
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
  fetchPriority?: "high" | "low" | "auto"
  onLoad?: () => void
  onError?: () => void
}

export function ImageWrapper({
  src,
  alt,
  fallback = "/placeholder.svg",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 65, // ⚡ Reducido de 75 a 65 para ahorrar esos 25KB críticos en móviles
  width,
  height,
  fill = false,
  loading,
  fetchPriority,
  className = "",
  onLoad,
  onError,
}: ImageWrapperProps) {
  // 1. Evitamos el doble renderizado: calculamos el SRC inicial directamente.
  // Usamos un estado para manejar ÚNICAMENTE el error de carga.
  const [hasError, setHasError] = useState(false);
  const [lastSrc, setLastSrc] = useState(src);

  // 2. Si el 'src' cambia desde el padre, reseteamos el estado de error
  if (src !== lastSrc) {
    setHasError(false);
    setLastSrc(src);
  }

  // 3. Determinamos la fuente a mostrar. 
  // validateImageUrl se ejecuta en el render, no en un useEffect, eliminando el "flicker".
  const resolvedSrc = useMemo(() => {
    if (hasError) return fallback;
    return validateImageUrl(src, fallback);
  }, [src, fallback, hasError]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      onError?.();
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image
        src={resolvedSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width ?? 500 : undefined}
        height={!fill ? height ?? 500 : undefined}
        priority={priority}
        sizes={sizes}
        quality={quality}
        // Si es prioridad, eliminamos el lazy loading para que el navegador actúe de inmediato
        loading={priority ? undefined : loading ?? "lazy"}
        className={`${className} transition-opacity duration-300`}
        onLoad={onLoad}
        onError={handleError}
        // @ts-ignore: Propiedad válida en navegadores modernos para LCP
        fetchPriority={fetchPriority}
        // Optimizaciones extra para el motor de renderizado
        decoding="async"
      />
    </div>
  )
}

/* Imagen de producto específica */
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
      fill
      {...props}
    />
  )
}

/* Imagen Hero (Siempre prioridad máxima) */
export function HeroImage({
  src,
  alt,
  className = "",
  ...props
}: Omit<ImageWrapperProps, "priority" | "fetchPriority">) {
  return (
    <ImageWrapper
      src={src}
      alt={alt}
      className={className}
      priority={true}
      fetchPriority="high"
      quality={70} // Un poco más de calidad para el Hero
      fill
      {...props}
    />
  )
}