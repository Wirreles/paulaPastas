"use client"

import dynamic from "next/dynamic"
import { Producto } from "@/lib/types"

const AddToCart = dynamic(() => import("./AddToCart"), {
    ssr: false,
    loading: () => (
        <div className="h-40 w-full bg-neutral-100 animate-pulse rounded-2xl" />
    )
})

export default function AddToCartLoader({ producto }: { producto: Producto }) {
    return <AddToCart producto={producto} />
}