"use client"

import { useState, useEffect } from "react"
import { Image, Loader2 } from "lucide-react"

interface ImagePlaceholderProps {
  width?: number
  height?: number
  className?: string
  variant?: "skeleton" | "gradient" | "pulse" | "shimmer"
  text?: string
  icon?: boolean
}

export function ImagePlaceholder({ 
  width, 
  height, 
  className = "",
  variant = "skeleton",
  text = "Cargando imagen...",
  icon = true
}: ImagePlaceholderProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Simular animación para shimmer
    if (variant === "shimmer") {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [variant])

  const baseClasses = "relative overflow-hidden rounded-lg bg-neutral-100"
  const sizeClasses = width && height ? `w-[${width}px] h-[${height}px]` : "w-full h-full"

  const variants = {
    skeleton: "animate-pulse bg-neutral-200",
    gradient: "bg-gradient-to-br from-neutral-200 via-neutral-300 to-neutral-200",
    pulse: "animate-pulse bg-neutral-200",
    shimmer: `bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 ${
      isAnimating ? "animate-shimmer" : ""
    }`
  }

  return (
    <div className={`${baseClasses} ${sizeClasses} ${variants[variant]} ${className}`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {icon && (
          <div className="mb-2">
            <Image className="w-8 h-8 text-neutral-400" />
          </div>
        )}
        <div className="text-center">
          <p className="text-sm text-neutral-500 font-medium">{text}</p>
          {variant === "shimmer" && (
            <div className="mt-2 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Placeholder especializado para productos
export function ProductPlaceholder({ className = "" }: { className?: string }) {
  return (
    <ImagePlaceholder
      variant="skeleton"
      text="Producto cargando..."
      className={className}
    />
  )
}

// Placeholder especializado para hero/banner
export function HeroPlaceholder({ className = "" }: { className?: string }) {
  return (
    <ImagePlaceholder
      variant="gradient"
      text="Imagen principal cargando..."
      className={className}
    />
  )
}

// Placeholder especializado para categorías
export function CategoryPlaceholder({ className = "" }: { className?: string }) {
  return (
    <ImagePlaceholder
      variant="pulse"
      text="Categoría cargando..."
      className={className}
    />
  )
}
