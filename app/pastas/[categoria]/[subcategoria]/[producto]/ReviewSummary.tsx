"use client"

import { useEffect, useState } from "react"
import { FirebaseService } from "@/lib/firebase-service"

export default function ReviewSummary({ productId }: { productId: string }) {
    const [data, setData] = useState<{ avgRating: number; total: number } | null>(null)

    useEffect(() => {
        FirebaseService.getReviewSummary(productId).then(setData)
    }, [productId])

    if (!data) {
        return (
            <div className="h-6 w-32 bg-neutral-200 animate-pulse rounded" />
        )
    }

    return (
        <div className="flex items-center gap-2">
            <span>{data.avgRating.toFixed(1)}</span>
            <span>{data.total} opiniones</span>
        </div>
    )
}