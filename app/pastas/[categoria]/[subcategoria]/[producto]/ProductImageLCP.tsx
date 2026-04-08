import Image from "next/image";

interface Props {
    src: string;
    alt: string;
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
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                className="object-cover"
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRiIAAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA="
            />
        </div>
    );
}