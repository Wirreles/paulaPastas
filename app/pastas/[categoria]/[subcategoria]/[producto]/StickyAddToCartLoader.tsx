"use client"

import dynamic from "next/dynamic"
import { Producto } from "@/lib/types"
import { useEffect, useState } from "react"

const StickyAddToCart = dynamic(() => import("./StickyAddToCart"), {
    ssr: false
})

export default function StickyAddToCartLoader({ producto }: { producto: Producto }) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShow(true)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    if (!show) return null

    return <StickyAddToCart producto={producto} />
}