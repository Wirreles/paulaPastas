import { MessageCircle } from "lucide-react"

export default function ContactCTA() {
    return (
        <section className="py-16 bg-primary-50 text-center">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">¿Tenés otra consulta?</h2>
                <p className="text-xl mb-8 text-neutral-700">
                    Te ayudamos por WhatsApp. Nuestro equipo está listo para responder todas tus preguntas.
                </p>
                <a
                    href="https://wa.me/5493413557400"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-8 py-4 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#1DA851] transition-colors"
                    aria-label="Chatear por WhatsApp con Paula Pastas"
                >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Hablemos por WhatsApp
                </a>
            </div>
        </section>
    )
}
