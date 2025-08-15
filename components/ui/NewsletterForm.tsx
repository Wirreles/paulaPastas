"use client"

import { useState } from "react"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useNewsletter } from "@/hooks/use-newsletter"

interface NewsletterFormProps {
  title?: string
  description?: string
  buttonText?: string
  placeholder?: string
  className?: string
  showSuccessMessage?: boolean
  onSuccess?: () => void
}

export function NewsletterForm({
  title = "Mantente informado",
  description = "Suscribite a nuestro newsletter y recibí un 10% de descuento en tu primer pedido.",
  buttonText = "Suscribirme",
  placeholder = "Tu email",
  className = "",
  showSuccessMessage = true,
  onSuccess
}: NewsletterFormProps) {
  const {
    email,
    isLoading,
    isSuccess,
    error,
    handleEmailChange,
    handleSubmit,
    resetForm
  } = useNewsletter()

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    }
    // Auto-reset después de 5 segundos
    setTimeout(() => {
      resetForm()
    }, 5000)
  }

  if (isSuccess && showSuccessMessage) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 text-center ${className}`}>
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-900 mb-2">
          ¡Suscripción exitosa!
        </h3>
        <p className="text-green-700 mb-4">
          Gracias por suscribirte. Pronto recibirás nuestras mejores ofertas y novedades.
        </p>
        <button
          onClick={handleSuccess}
          className="text-green-600 hover:text-green-700 font-medium underline"
        >
          Suscribir otro email
        </button>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
          {title}
        </h2>
        <p className="text-lg text-neutral-700">
          {description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <div className="flex-1 relative">
          <label htmlFor="email-newsletter" className="sr-only">
            Email
          </label>
          <input
            type="email"
            id="email-newsletter"
            name="email"
            value={email}
            onChange={handleEmailChange}
            placeholder={placeholder}
            required
            disabled={isLoading}
            className={`w-full px-5 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 text-neutral-900 ${
              error 
                ? "border-red-300 focus:ring-red-500" 
                : "border-neutral-300 focus:border-primary-600"
            } ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
          {error && (
            <div className="absolute -bottom-6 left-0 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className={`px-8 py-3 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            isLoading || !email.trim()
              ? "bg-neutral-400 text-neutral-600 cursor-not-allowed"
              : "bg-primary-900 text-white hover:bg-primary-800"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            buttonText
          )}
        </button>
      </form>

      {/* Mensaje de privacidad */}
      <p className="text-xs text-neutral-500 text-center mt-4 max-w-md mx-auto">
        Al suscribirte, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.
      </p>
    </div>
  )
}

