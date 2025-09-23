import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export default function WhatsAppCTA() {
  const whatsappNumber = "5493413557400" // Número de WhatsApp de Paula Pastas
  const whatsappMessage = "Hola, tengo una consulta sobre las salsas de Comida Casera."

  return (
    <section className="bg-primary-600 py-12 px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl font-bold text-white mb-6">¿Tenés otra consulta?</h2>
      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button className="bg-white text-primary-600 hover:bg-primary-50 hover:text-primary-700 text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 flex items-center gap-3">
          <MessageCircle className="w-6 h-6" />
          Contactanos a WhatsApp
        </Button>
      </a>
    </section>
  )
}
