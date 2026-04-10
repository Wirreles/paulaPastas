"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const ReviewsSection = dynamic(() => import("./ReviewsSection"), {
    ssr: false,
    loading: () => (
        <div className="h-64 animate-pulse bg-neutral-100 rounded-2xl" />
    )
})

export default function ReviewsLoader({
    productoId,
    productoNombre
}: {
    productoId: string
    productoNombre: string
}) {
    const [shouldLoad, setShouldLoad] = useState(false)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShouldLoad(true)
        }, 1500) // ⏱️ defer

        return () => clearTimeout(timeout)
    }, [])

    if (!shouldLoad) {
        return (
            <div className="mt-16 h-64 bg-neutral-100 animate-pulse rounded-2xl" />
        )
    }

    return (
        <ReviewsSection
            productoId={productoId}
            productoNombre={productoNombre}
        />
    )
}