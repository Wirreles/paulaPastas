"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Star, Snowflake, Award, Leaf } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import dynamic from 'next/dynamic'
import type { Review as ReviewType } from "@/lib/types"

// El ReviewForm sí puede ser dynamic porque estamos dentro de un Client Component
const ReviewForm = dynamic(() => import('@/components/ReviewForm'), {
    ssr: false,
    loading: () => <div className="animate-pulse h-[480px] w-full bg-neutral-100 rounded-2xl" />
});

interface ReviewsSectionProps {
    productoId: string
    productoNombre: string
}

export default function ReviewsSection({ productoId, productoNombre }: ReviewsSectionProps) {
    const [reviews, setReviews] = useState<ReviewType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

    const loadReviews = useCallback(async () => {
        try {
            setIsLoading(true)
            const productReviews = await FirebaseService.getReviewsByProduct(productoId)
            const approvedReviews = productReviews.filter((r) => r.aprobada === true)
            setReviews(approvedReviews)
        } catch (error) {
            console.error("Error cargando reviews de Paula Pastas:", error)
        } finally {
            setIsLoading(false)
        }
    }, [productoId])

    useEffect(() => {
        loadReviews()
    }, [loadReviews])

    const handleReviewSubmitted = () => {
        setShowReviewForm(false)
        loadReviews()
    }

    const toggleReviewExpansion = (reviewId: string) => {
        setExpandedReviews((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(reviewId)) newSet.delete(reviewId)
            else newSet.add(reviewId)
            return newSet
        })
    }

    const avgRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
        : 0

    if (isLoading) {
        return (
            <section className="mt-16 bg-neutral-100 rounded-2xl p-12 min-h-[450px] animate-pulse">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="h-10 bg-neutral-200 rounded w-1/3 mx-auto"></div>
                    <div className="flex justify-center gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-white rounded-2xl w-full max-w-[350px]"></div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-16 bg-neutral-100 mt-16 rounded-3xl overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                        Los que ya probaron
                    </h2>

                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-6 h-6 ${star <= Math.round(avgRating) ? "text-yellow-400 fill-current" : "text-neutral-300"}`}
                                />
                            ))}
                        </div>
                        <div className="text-xl font-bold text-neutral-900">
                            {reviews.length > 0 ? avgRating.toFixed(1) : "—"} <span className="text-neutral-600">★</span>
                        </div>
                    </div>

                    <p className="text-neutral-600">
                        {reviews.length > 0 ? `${reviews.length} opiniones` : "Aún sin opiniones"}
                    </p>

                    {/* Tags de Confianza */}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4 text-sm text-neutral-700 font-medium">
                        <span className="flex items-center gap-1.5"><Snowflake className="w-4 h-4 text-primary-600" /> Congelados</span>
                        <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-primary-600" /> Sin aditivos</span>
                        <span className="flex items-center gap-1.5"><Leaf className="w-4 h-4 text-primary-600" /> Hecho en Rosario</span>
                    </div>

                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="mt-8 px-8 py-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all shadow-md hover:shadow-lg font-semibold"
                    >
                        Escribir Reseña
                    </button>
                </div>

                {/* Listado de Reviews */}
                {reviews.length > 0 ? (
                    <div className="relative">
                        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4">
                            {reviews.map((review) => {
                                const isExpanded = expandedReviews.has(review.id || "")
                                return (
                                    <div
                                        key={review.id}
                                        className={`bg-white rounded-2xl shadow-md p-8 text-center min-w-[85vw] md:min-w-[380px] shrink-0 snap-center flex flex-col transition-all duration-300 ${isExpanded ? "h-auto border-2 border-primary-100" : "h-[300px]"
                                            }`}
                                    >
                                        <div className="flex justify-center mb-4 text-yellow-400">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className={`w-5 h-5 ${star <= review.rating ? "fill-current" : "text-neutral-200"}`} />
                                            ))}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center">
                                            <p className={`text-neutral-700 italic leading-relaxed ${!isExpanded ? "line-clamp-4" : ""}`}>
                                                "{review.testimonial}"
                                            </p>
                                            {review.testimonial.length > 140 && (
                                                <button
                                                    onClick={() => toggleReviewExpansion(review.id || "")}
                                                    className="text-primary-600 text-xs font-bold mt-2 uppercase tracking-wider hover:text-primary-700"
                                                >
                                                    {isExpanded ? "Ver menos" : "Ver más"}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-neutral-900 font-bold mt-6 border-t border-neutral-50 pt-4">{review.userName}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white/50 rounded-2xl border-2 border-dashed border-neutral-200">
                        <p className="text-neutral-500 italic">¡Sé el primero en compartir tu experiencia!</p>
                    </div>
                )}
            </div>

            {showReviewForm && (
                <ReviewForm
                    productoId={productoId}
                    productoNombre={productoNombre}
                    onClose={() => setShowReviewForm(false)}
                    onReviewSubmitted={handleReviewSubmitted}
                />
            )}
        </section>
    )
}