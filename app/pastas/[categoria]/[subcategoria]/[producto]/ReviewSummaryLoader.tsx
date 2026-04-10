"use client";

import dynamic from "next/dynamic";

const ReviewSummary = dynamic(() => import("./ReviewSummary"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center gap-3 mt-3">
            <div className="h-6 w-24 bg-neutral-200 animate-pulse rounded-full" />
            <div className="h-5 w-32 bg-neutral-200 animate-pulse rounded" />
        </div>
    ),
});

export default function ReviewSummaryLoader({ productId }: { productId: string }) {
    return <ReviewSummary productId={productId} />;
}