"use client";

import dynamic from "next/dynamic";

// 🔥 ahora sí permitido (porque es client component)
const Analytics = dynamic(() => import("./Analytics"), {
    ssr: false,
});

export default function AnalyticsWrapper() {
    return <Analytics />;
}