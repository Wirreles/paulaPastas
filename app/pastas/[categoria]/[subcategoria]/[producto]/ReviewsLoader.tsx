"use client"; // 👈 Este es el secreto

import dynamic from "next/dynamic";

// Aquí SÍ está permitido el ssr: false
const ReviewsSection = dynamic(() => import('./ReviewsSection'), {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse bg-neutral-100 rounded-2xl" />
});

export default function ReviewsLoader({ productoId, productoNombre }: { productoId: string, productoNombre: string }) {
    return <ReviewsSection productoId={productoId} productoNombre={productoNombre} />;
}