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
  quality = 65,
  width,
  height,
  fill = false,
  loading,
  fetchPriority,
  className = "",
  onLoad,
  onError,
}: ImageWrapperProps) {
  const [hasError, setHasError] = useState(false);
  const [lastSrc, setLastSrc] = useState(src);

  // Sincronización de estado sin useEffect para evitar ciclos de renderizado extra
  if (src !== lastSrc) {
    setHasError(false);
    setLastSrc(src);
  }

  const resolvedSrc = useMemo(() => {
    if (hasError) return fallback;
    return validateImageUrl(src, fallback);
  }, [src, fallback, hasError]);

  // Componente de imagen puro y duro
  const imageElement = (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width ?? 500 : undefined}
      height={!fill ? height ?? 500 : undefined}
      priority={priority}
      sizes={sizes}
      quality={quality}
      // Si es LCP, prohibimos cualquier forma de lazy loading
      loading={priority ? undefined : (loading ?? "lazy")}
      // Eliminamos transiciones en LCP para que Lighthouse no detecte "retraso de visibilidad"
      className={`${className} ${!priority ? 'transition-opacity duration-300' : 'opacity-100'}`}
      onLoad={onLoad}
      onError={() => setHasError(true)}
      // Forzamos al navegador a priorizar la descarga y el renderizado (sync)
      // @ts-ignore
      fetchPriority={priority ? "high" : fetchPriority}
      decoding={priority ? "sync" : "async"}
    />
  );

  /**
   * ESTRATEGIA ULTRA-LCP: 
   * Si es prioridad, renderizamos la imagen SIN el contenedor div relativo.
   * Esto elimina una capa de cálculo de Layout (Reflow) y acelera el pintado final.
   */
  if (priority) {
    return imageElement;
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-100/50">
      {imageElement}
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
      fill // Las imágenes de producto suelen requerir fill para el contenedor del card
      {...props}
    />
  )
}

/* Imagen Hero (La que define el LCP real) */
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
      loading="eager"
      quality={75}
      fill
      {...props}
    />
  )
}