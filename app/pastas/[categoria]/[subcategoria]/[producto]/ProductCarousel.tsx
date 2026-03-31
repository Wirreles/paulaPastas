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
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div className="relative group">
            <div className="aspect-square relative overflow-hidden rounded-3xl bg-neutral-100 shadow-inner">
                {images.map((img, index) => (
                    <Image
                        key={img}
                        src={img}
                        alt={`${producto.nombre} - vista ${index + 1}`}
                        fill
                        priority={index === 0} // ✅ Crítico para el LCP: Carga la primera imagen de inmediato
                        fetchPriority={index === 0 ? "high" : "low"}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={`object-cover transition-opacity duration-500 ${index === currentIndex ? "opacity-100" : "opacity-0"
                            }`}
                    />
                ))}
            </div>

            {images.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Imagen anterior"
                    >
                        <ChevronLeft className="w-6 h-6 text-neutral-800" />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Siguiente imagen"
                    >
                        <ChevronRight className="w-6 h-6 text-neutral-800" />
                    </button>

                    <div className="flex justify-center gap-2 mt-4">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-primary-600 w-4" : "bg-neutral-300"
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}