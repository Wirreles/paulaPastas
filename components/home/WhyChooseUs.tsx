import Link from "next/link"
import { ArrowRight, Star, Clock, Truck, MessageCircle } from "lucide-react"

export default function WhyChooseUs() {
    return (
        <section className="py-16 bg-primary-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">¿Por qué nos eligen?</h2>
                <p className="text-lg text-neutral-700 max-w-2xl mx-auto mb-12">
                    Nuestros clientes eligen Paula Pastas por la calidad, el sabor y la comodidad.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mb-4">
                            <Star className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">Calidad Inigualable</h3>
                        <p className="text-neutral-600">
                            Utilizamos solo ingredientes frescos y de primera calidad para cada preparación.
                        </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">Frescura Diaria</h3>
                        <p className="text-neutral-600">
                            Elaboramos nuestras pastas todos los días para garantizar el máximo sabor y frescura.
                        </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mb-4">
                            <Truck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">Delivery Confiable</h3>
                        <p className="text-neutral-600">
                            Recibe tus pastas en la comodidad de tu hogar, con entregas rápidas y seguras en Rosario.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/pastas"
                        className="inline-flex items-center px-8 py-4 bg-primary-900 text-white font-semibold rounded-lg hover:bg-primary-800 transition-colors w-full sm:max-w-xs"
                    >
                        Ver pastas
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                    <a
                        href="https://wa.me/5493413557400"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-8 py-4 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#1DA851] transition-colors w-full sm:max-w-xs"
                    >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Hablemos por Wsp
                    </a>
                </div>
            </div>
        </section>
    )
}
