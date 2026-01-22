import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function InfoSection() {
    return (
        <section className="py-16 bg-primary-50">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                    ¿Aún no sabes qué elegir?
                </h2>
                <p className="text-xl mb-8 text-neutral-700">
                    En Paula Pastas, cada plato es una obra de arte culinaria, elaborada con pasión y los ingredientes más
                    frescos. Nuestra tradición familiar se refleja en cada bocado, ofreciéndote una experiencia inigualable.
                </p>
                <Link
                    href="/pastas"
                    className="inline-flex items-center px-8 py-4 border border-neutral-900 text-neutral-900 font-semibold rounded-lg hover:bg-neutral-900 hover:text-white transition-colors w-full sm:max-w-xs mx-auto"
                >
                    Conocé el menú completo
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
            </div>
        </section>
    )
}
