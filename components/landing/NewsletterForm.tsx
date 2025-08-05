"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useToast } from "@/lib/toast-context" // Asumiendo que tienes un useToast

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast() // Usar el hook de toast

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simular envío a un servicio de newsletter
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log("Email suscrito:", email)
    showToast("¡Gracias por suscribirte!", "Revisa tu bandeja de entrada para tu descuento.")
    setEmail("")
    setIsLoading(false)
  }

  return (
    <section className="bg-neutral-900 py-16 px-4 sm:px-6 lg:px-8 text-white text-center">
      <h2 className="text-3xl font-bold mb-4">Mantenete informada</h2>
      <p className="text-lg text-neutral-300 mb-8">Suscribite y recibí un 10% de descuento en tu primer pedido.</p>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2">
        <Input
          type="email"
          placeholder="Tu correo electrónico"
          className="flex-1 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-primary-600 focus:ring-primary-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button
          type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? "Suscribiendo..." : "Suscribirme"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </form>
    </section>
  )
}
