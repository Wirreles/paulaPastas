"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Star, Snowflake, Award, Leaf } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import dynamic from "next/dynamic"
import type { Review as ReviewType } from "@/lib/types"

const ReviewForm = dynamic(() => import("@/components/ReviewForm"), {
    ssr: false,
    loading: () => (
        <div className="animate-pulse h-[420px] w-full bg-neutral-100 rounded-2xl" />
    ),
})

interface ReviewsSectionProps {
    productoId: string
    productoNombre: string
}

export default function ReviewsSection({
    productoId,
    productoNombre,
}: ReviewsSectionProps) {
    const [reviews, setReviews] = useState<ReviewType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

    const loadReviews = useCallback(async () => {
        try {
            setIsLoading(true)
            const productReviews =
                await FirebaseService.getReviewsByProduct(productoId)
            const approvedReviews = productReviews.filter((r) => r.aprobada === true)
            setReviews(approvedReviews)
        } catch (error) {
            console.error("Error cargando reviews:", error)
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

    const avgRating =
        reviews.length > 0
            ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
            : 0

    if (isLoading) {
        return (
            <section className="mt-16 bg-neutral-100 rounded-2xl p-6 sm:p-10 min-h-[350px] animate-pulse">
                <div className="space-y-6">
                    <div className="h-8 bg-neutral-200 rounded w-1/2 mx-auto"></div>
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 bg-white rounded-2xl w-[75%]"></div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-12 sm:py-16 bg-neutral-100 mt-16 rounded-3xl overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                        Los que ya probaron
                    </h2>

                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 sm:w-6 sm:h-6 ${star <= Math.round(avgRating)
                                            ? "text-yellow-400 fill-current"
                                            : "text-neutral-300"
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="text-lg sm:text-xl font-bold text-neutral-900">
                            {reviews.length > 0 ? avgRating.toFixed(1) : "—"}
                        </div>
                    </div>

                    <p className="text-sm sm:text-base text-neutral-600">
                        {reviews.length > 0
                            ? `${reviews.length} opiniones`
                            : "Aún sin opiniones"}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs sm:text-sm text-neutral-700 font-medium">
                        <span className="flex items-center gap-1">
                            <Snowflake className="w-4 h-4 text-primary-600" /> Congelados
                        </span>
                        <span className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-primary-600" /> Sin aditivos
                        </span>
                        <span className="flex items-center gap-1">
                            <Leaf className="w-4 h-4 text-primary-600" /> Hecho en Rosario
                        </span>
                    </div>

                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="mt-6 px-6 py-2.5 sm:px-8 sm:py-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm sm:text-base"
                    >
                        Escribir Reseña
                    </button>
                </div>

                {/* Reviews */}
                {reviews.length > 0 ? (
                    <div className="relative">
                        {/* Fade edges */}
                        <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-neutral-100 to-transparent z-10" />
                        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-neutral-100 to-transparent z-10" />

                        <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scroll-smooth px-2 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {reviews.map((review) => {
                                const isExpanded = expandedReviews.has(review.id || "")

                                return (
                                    <div
                                        key={review.id}
                                        className={`bg-white rounded-2xl shadow-md p-5 sm:p-6 md:p-8 text-center min-w-[75%] sm:min-w-[320px] md:min-w-[360px] max-w-[85%] shrink-0 snap-center flex flex-col transition-all duration-300 ${isExpanded
                                                ? "h-auto border-2 border-primary-100"
                                                : "min-h-[220px] sm:min-h-[260px]"
                                            }`}
                                    >
                                        {/* Stars */}
                                        <div className="flex justify-center mb-3 text-yellow-400">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= review.rating
                                                            ? "fill-current"
                                                            : "text-neutral-200"
                                                        }`}
                                                />
                                            ))}
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 flex flex-col justify-center">
                                            <p
                                                className={`text-sm sm:text-base text-neutral-700 italic leading-relaxed ${!isExpanded ? "line-clamp-4" : ""
                                                    }`}
                                            >
                                                "{review.testimonial}"
                                            </p>

                                            {review.testimonial.length > 140 && (
                                                <button
                                                    onClick={() =>
                                                        toggleReviewExpansion(review.id || "")
                                                    }
                                                    className="text-primary-600 text-xs font-bold mt-2 uppercase tracking-wide"
                                                >
                                                    {isExpanded ? "Ver menos" : "Ver más"}
                                                </button>
                                            )}
                                        </div>

                                        {/* User */}
                                        <p className="text-neutral-900 text-sm sm:text-base font-bold mt-4 border-t border-neutral-100 pt-3">
                                            {review.userName}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-white/50 rounded-2xl border-2 border-dashed border-neutral-200">
                        <p className="text-neutral-500 italic text-sm sm:text-base">
                            ¡Sé el primero en compartir tu experiencia!
                        </p>
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