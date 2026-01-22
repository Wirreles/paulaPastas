"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"

interface Review {
    id: string
    name: string
    userName?: string
    rating: number
    testimonial: string
}

interface ReviewsCarouselProps {
    reviews: Review[]
}

export default function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(1)
    const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

    useEffect(() => {
        const calculateItemsPerPage = () => {
            const width = window.innerWidth
            if (width >= 1024) setItemsPerPage(3)
            else if (width >= 768) setItemsPerPage(2)
            else setItemsPerPage(1)
        }

        calculateItemsPerPage()

        const handleResize = () => {
            calculateItemsPerPage()
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const currentReviews = useMemo(() => {
        const start = currentReviewIndex
        const end = start + itemsPerPage
        return reviews.slice(start, end)
    }, [currentReviewIndex, itemsPerPage, reviews])

    const nextReviews = useCallback(() => {
        setCurrentReviewIndex(prev =>
            prev + itemsPerPage >= reviews.length ? 0 : prev + itemsPerPage
        )
    }, [itemsPerPage, reviews.length])

    const prevReviews = useCallback(() => {
        setCurrentReviewIndex(prev =>
            prev - itemsPerPage < 0 ? Math.max(0, reviews.length - itemsPerPage) : prev - itemsPerPage
        )
    }, [itemsPerPage, reviews.length])

    const toggleReviewExpansion = useCallback((reviewId: string) => {
        setExpandedReviews(prev => {
            const newSet = new Set(prev)
            if (newSet.has(reviewId)) {
                newSet.delete(reviewId)
            } else {
                newSet.add(reviewId)
            }
            return newSet
        })
    }, [])

    const isReviewExpanded = useCallback((reviewId: string) => expandedReviews.has(reviewId), [expandedReviews])

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Los que ya probaron</h2>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                        La opinión de nuestros clientes es lo más importante.
                    </p>
                </div>

                {reviews.length > 0 ? (
                    <div className="relative">
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{
                                    transform: `translateX(-${currentReviewIndex * (100 / itemsPerPage)}%)`,
                                }}
                            >
                                {reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4"
                                    >
                                        <div
                                            className={`bg-neutral-50 rounded-lg p-6 shadow-sm flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${isReviewExpanded(review.id || "")
                                                    ? "h-auto min-h-[200px] shadow-lg border-2 border-primary-200"
                                                    : "h-[200px]"
                                                }`}
                                        >
                                            <div className="flex justify-center mb-2">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                                ))}
                                                {[...Array(5 - review.rating)].map((_, i) => (
                                                    <Star key={i + review.rating} className="w-5 h-5 text-neutral-300" />
                                                ))}
                                            </div>

                                            <div className={`flex flex-col ${!isReviewExpanded(review.id || "") ? "flex-1" : ""
                                                }`}>
                                                <div className={`review-text-container ${!isReviewExpanded(review.id || "") ? "flex-1 overflow-hidden" : ""
                                                    }`}>
                                                    <p className={`text-neutral-700 italic mb-2 text-wrap-safe leading-relaxed ${!isReviewExpanded(review.id || "") ? "line-clamp-2" : ""
                                                        }`}>
                                                        "{review.testimonial}"
                                                    </p>
                                                </div>

                                                {review.testimonial.length > 60 && (
                                                    <button
                                                        onClick={() => toggleReviewExpansion(review.id || "")}
                                                        className={`text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 transition-colors ${isReviewExpanded(review.id || "") ? "font-semibold" : ""
                                                            }`}
                                                    >
                                                        {isReviewExpanded(review.id || "") ? "Ver menos" : "Ver más"}
                                                    </button>
                                                )}
                                            </div>

                                            <p className="font-semibold text-neutral-900 mt-auto" aria-label={`Reseña de ${review.userName || review.name}`}>
                                                - {review.userName || review.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={prevReviews}
                            className="absolute top-1/2 left-0 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-neutral-100 transition-colors z-10 hidden md:block"
                            aria-label="Reseña anterior"
                        >
                            <ChevronLeft className="w-6 h-6 text-neutral-700" />
                        </button>
                        <button
                            onClick={nextReviews}
                            className="absolute top-1/2 right-0 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-neutral-100 transition-colors z-10 hidden md:block"
                            aria-label="Siguiente reseña"
                        >
                            <ChevronRight className="w-6 h-6 text-neutral-700" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">💬</span>
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">Sin reseñas destacadas</h3>
                        <p className="text-neutral-600">Aún no tenemos reseñas destacadas. ¡Sé el primero en compartir tu experiencia!</p>
                    </div>
                )}
            </div>
        </section>
    )
}
