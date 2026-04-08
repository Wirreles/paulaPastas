import Image from "next/image";

interface Props {
    src: string;
    alt: string;
}

// export default function ProductImageLCP({ src, alt }: Props) {
//     return (
//         <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-neutral-100">
//             <Image
//                 src={src}
//                 alt={alt}
//                 fill
//                 priority
//                 fetchPriority="high"
//                 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
//                 className="object-cover"
//                 placeholder="blur"
//                 blurDataURL="data:image/webp;base64,UklGRiIAAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA="
//             />
//         </div>
//     );
// }

// ProductImageLCP.tsx
export default function ProductImageLCP({ src, alt }: Props) {
    return (
        <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-neutral-100">
            <Image
                src={src}
                alt={alt}
                fill
                priority // Esto ya genera el preload automáticamente en Next.js
                fetchPriority="high"
                loading="eager" // Forzamos carga inmediata
                sizes="(max-width: 640px) 100vw, 600px"
                className="object-cover"
            // Quita el placeholder temporalmente para testear velocidad pura
            />
        </div>
    );
}