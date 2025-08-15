import { useState, useCallback } from "react"
import { FirebaseService } from "@/lib/firebase-service"

interface UseNewsletterReturn {
  email: string
  isLoading: boolean
  isSuccess: boolean
  error: string | null
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  resetForm: () => void
}

export const useNewsletter = (): UseNewsletterReturn => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError(null)
    setIsSuccess(false)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError("Por favor, ingresa tu email")
      return
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError("Por favor, ingresa un email válido")
      return
    }

    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      await FirebaseService.createSuscripcion(email.trim(), "web")
      setIsSuccess(true)
      setEmail("")
      console.log("✅ Suscripción exitosa al newsletter")
    } catch (err: any) {
      const errorMessage = err.message || "Error al suscribirse. Intenta nuevamente."
      setError(errorMessage)
      console.error("❌ Error en suscripción:", err)
    } finally {
      setIsLoading(false)
    }
  }, [email])

  const resetForm = useCallback(() => {
    setEmail("")
    setError(null)
    setIsSuccess(false)
  }, [])

  return {
    email,
    isLoading,
    isSuccess,
    error,
    handleEmailChange,
    handleSubmit,
    resetForm
  }
}

