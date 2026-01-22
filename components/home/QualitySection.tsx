import Image from "next/image"

export default function QualitySection() {
    const qualityAssuredImage = "/home-sections/quality-assured-image.webp"

    return (
        <section className="py-16 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
                <figure className="relative w-full lg:w-1/2 aspect-video rounded-2xl overflow-hidden shadow-lg">
                    <Image
                        src={qualityAssuredImage}
                        alt="Elaboración artesanal de pastas Paula Pastas"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                </figure>
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Calidad asegurada</h2>
                    <p className="text-lg text-neutral-700 leading-relaxed">
                        Cuando decimos que nuestras pastas artesanales son otra cosa, lo sostenemos. Cada ingrediente es
                        seleccionado con el mayor cuidado y cada paso de la elaboración se realiza con la pasión y el saber hacer
                        que solo una tradición de años puede ofrecer.
                    </p>
                </div>
            </div>
        </section>
    )
}
