import Link from "next/link"
import Image from "next/image"
import { CATEGORIAS_HOME } from "@/lib/constants"

export default function CategoriesSection() {
    return (
        <section className="py-16 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                        ¿Qué pasta casera te gustaría comer hoy?
                    </h2>
                    <p className="text-lg text-neutral-600">Tenemos opciones para todos los gustos y necesidades</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                    {CATEGORIAS_HOME.map((categoria) => (
                        <Link key={categoria.slug} href={`/pastas/${categoria.slug}`} className="group">
                            <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift">
                                <div className="relative h-48">
                                    <Image
                                        src={categoria.imagen || "/placeholder.svg"}
                                        alt={`${categoria.nombre} caseras artesanales`}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <h3 className="text-2xl font-bold mb-2">{categoria.nombre}</h3>
                                        <p className="text-neutral-200 text-sm">{categoria.descripcion}</p>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
