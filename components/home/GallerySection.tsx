import Image from "next/image"
import { DISHES_GALLERY } from "@/lib/constants"

export default function GallerySection() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                        Platos que hablan por sí solos
                    </h2>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                        Deslizá y mirá lo que podés tener en tu mesa esta semana.
                    </p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {DISHES_GALLERY.map((img, index) => (
                        <div key={index} className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-lg hover-lift">
                            <Image
                                src={img.imageUrl}
                                alt={img.name || `Plato ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 33vw"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
