import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Leaf, Award } from "lucide-react"

export default function HeroSection() {
    const heroImage = "/home-sections/hero-main-image.webp"

    return (
        <section className="relative flex flex-col lg:flex-row items-center justify-center lg:justify-between min-h-[80vh] lg:h-[70vh] bg-gradient-to-b from-primary-350 to-primary-550">
            <div className="relative z-10 text-center lg:text-left w-full lg:w-1/2 max-w-4xl mx-auto lg:mx-0 order-1 lg:order-2 py-8 lg:py-0 px-4 sm:px-6 lg:px-8">
                <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-2 text-sm font-medium text-neutral-700 mb-4 animate-fade-in">
                    <Leaf className="w-4 h-4 text-primary-600" />
                    <span>Elaboración 100% Artesanal</span>
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-neutral-900 mb-4 animate-fade-in">
                    Fábrica de pastas artesanales en Rosario
                </h1>
                <p className="text-lg md:text-xl mb-8 text-neutral-700 animate-slide-up">
                    En Paula Pastas llevamos la experiencia del restaurante a tu casa. Si buscas algo especial, rico y rápido
                    sin complicarte la vida, esta es tu casa de pastas.
                </p>
                <div className="flex flex-col items-center lg:items-start gap-4 animate-scale-in">
                    <Link
                        href="/pastas"
                        className="group inline-flex items-center justify-center px-6 py-3 border border-neutral-900 text-neutral-900 text-sm font-semibold rounded-lg hover:bg-neutral-900 hover:text-white transition-all duration-300 w-full sm:max-w-xs mx-auto lg:w-auto lg:mx-0"
                    >
                        Descubrí nuestras pastas
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <div className="flex flex-row flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs text-neutral-900">
                        <div className="flex items-center space-x-2">
                            <Leaf className="w-4 h-4 text-neutral-900" />
                            <span>Sin Conservantes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-neutral-900" />
                            <span>Frescura garantizada</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative w-full lg:w-1/2 aspect-video lg:h-full order-2 lg:order-1">
                <Image
                    src={heroImage}
                    alt="Pasta artesanal en Rosario, plato de ravioles con salsa"
                    fill
                    className="object-cover w-full h-full"
                    priority={true}
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </div>
        </section>
    )
}
