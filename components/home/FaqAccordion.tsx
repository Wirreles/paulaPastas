"use client"

import { ChevronRight } from "lucide-react"

interface FaqItem {
    question: string
    answer: string
}

interface FaqAccordionProps {
    faqs: FaqItem[]
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Preguntas frecuentes</h2>
                    <p className="text-lg text-neutral-600">
                        Resolvemos tus dudas más comunes sobre nuestros productos y servicios.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <details
                            key={index}
                            className="bg-neutral-50 rounded-lg shadow-sm p-5 cursor-pointer group"
                            style={{ fontFamily: "var(--font-playfair)" }}
                        >
                            <summary className="flex justify-between items-center font-bold text-neutral-900 text-lg">
                                {faq.question}
                                <ChevronRight className="w-5 h-5 text-primary-600 transition-transform duration-300 group-open:rotate-90" />
                            </summary>
                            <div className="mt-4 text-neutral-700 leading-relaxed">{faq.answer}</div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}
