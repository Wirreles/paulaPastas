import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Leaf, Award } from "lucide-react"

export default function HeroSection() {
    const heroImage = "/home-sections/hero-main-image.webp"

    return (
        <section className="relative flex flex-col lg:flex-row items-center justify-center lg:justify-between min-h-[80vh] lg:h-[70vh] bg-gradient-to-b from-primary-350 to-primary-550 overflow-hidden">
            {/* Contenedor de Imagen: Priorizamos su renderizado para el LCP */}
            <div className="relative w-full lg:w-1/2 aspect-video lg:h-full order-2 lg:order-1">
                <Image
                    src={heroImage}
                    alt="Pasta artesanal en Rosario, plato de ravioles con salsa"
                    fill
                    className="object-cover w-full h-full"
                    priority={true} // Instrucción crítica para el navegador
                    loading="eager" // Fuerza la carga inmediata
                    sizes="(max-width: 1024px) 100vw, 50vw"
                />
            </div>

            {/* Contenedor de Texto */}
            <div className="relative z-10 text-center lg:text-left w-full lg:w-1/2 max-w-4xl mx-auto lg:mx-0 order-1 lg:order-2 py-8 lg:py-0 px-4 sm:px-6 lg:px-8">
                <div className="inline-flex items-center gap-2 bg-primary-50/90 rounded-full px-4 py-2 text-sm font-medium text-neutral-700 mb-4">
                    <Leaf className="w-4 h-4 text-primary-600" />
                    <span>Elaboración 100% Artesanal</span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl font-bold text-neutral-900 mb-4 leading-tight">
                    Fábrica de pastas artesanales en Rosario
                </h1>

                <p className="text-lg md:text-xl mb-8 text-neutral-700 max-w-xl mx-auto lg:mx-0">
                    En Paula Pastas llevamos la experiencia del restaurante a tu casa. Si buscas algo especial, rico y rápido
                    sin complicarte la vida, esta es tu casa de pastas.
                </p>

                <div className="flex flex-col items-center lg:items-start gap-4">
                    <Link
                        href="/pastas"
                        className="group inline-flex items-center justify-center px-8 py-4 bg-neutral-900 text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-all duration-300 w-full sm:max-w-xs"
                    >
                        Descubrí nuestras pastas
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex flex-row flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mt-4 text-xs font-medium text-neutral-800">
                        <div className="flex items-center space-x-2">
                            <Leaf className="w-4 h-4" />
                            <span>Sin Conservantes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4" />
                            <span>Frescura garantizada</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}