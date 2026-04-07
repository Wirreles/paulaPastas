"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductCarouselProps {
    images: string[]
    producto: {
        nombre: string
    }
}

export default function ProductCarousel({ images, producto }: ProductCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(1) // 🔥 empieza en 1 (evita LCP)

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length || 1)
    }

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 <= 0 ? images.length - 1 : prev - 1))
    }

    const safeIndex = currentIndex === 0 ? 1 : currentIndex

    return (
        <div className="space-y-4">

            <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-neutral-100">

                <Image
                    src={images[safeIndex]}
                    alt={`${producto.nombre} - vista ${safeIndex + 1}`}
                    fill
                    loading="lazy"
                    priority={false}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    className="object-cover transition-opacity duration-300"
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur rounded-full shadow-md hover:scale-105 active:scale-95 transition-all p-[clamp(6px,1vw,10px)]"
                            aria-label="Imagen anterior"
                        >
                            <ChevronLeft className="w-[clamp(18px,2.5vw,28px)] h-[clamp(18px,2.5vw,28px)] text-neutral-800" />
                        </button>

                        <button
                            onClick={nextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur rounded-full shadow-md hover:scale-105 active:scale-95 transition-all p-[clamp(6px,1vw,10px)]"
                            aria-label="Siguiente imagen"
                        >
                            <ChevronRight className="w-[clamp(18px,2.5vw,28px)] h-[clamp(18px,2.5vw,28px)] text-neutral-800" />
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex justify-center gap-2">
                    {images.slice(1).map((_, index) => {
                        const realIndex = index + 1
                        return (
                            <button
                                key={realIndex}
                                onClick={() => setCurrentIndex(realIndex)}
                                className={`h-2 rounded-full transition-all ${realIndex === safeIndex
                                        ? "bg-primary-600 w-5"
                                        : "bg-neutral-300 w-2 hover:bg-neutral-400"
                                    }`}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}