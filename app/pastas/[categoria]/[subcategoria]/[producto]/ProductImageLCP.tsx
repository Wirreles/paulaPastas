import Image from "next/image"

interface Props {
    src: string
    alt: string
}

export default function ProductImageLCP({ src, alt }: Props) {
    return (
        <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-neutral-100">
            <Image
                src={src}
                alt={alt}
                fill
                priority
                fetchPriority="high"
                loading="eager"
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-cover"
            />
        </div>
    )
}