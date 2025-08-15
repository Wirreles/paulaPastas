import { useState, useCallback } from "react"
import { FirebaseService } from "@/lib/firebase-service"
import { emailService } from "@/lib/email-service"

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
      // 1. Crear la suscripción en Firebase
      const suscripcionId = await FirebaseService.createSuscripcion(email.trim(), "web")
      console.log("✅ Suscripción creada exitosamente:", suscripcionId)

      // 2. Generar cupón de bienvenida automático
      const cuponId = await FirebaseService.generateWelcomeCoupon(email.trim())
      console.log("✅ Cupón de bienvenida generado:", cuponId)

      // 3. Obtener el cupón generado por su ID
      const cupon = await FirebaseService.getCouponById(cuponId)
      if (cupon) {
        // 4. Enviar email de bienvenida con el cupón
        const emailResult = await emailService.sendWelcomeEmail(email.trim(), cupon.codigo)
        
        if (emailResult.success) {
          console.log("✅ Email de bienvenida enviado exitosamente")
          setIsSuccess(true)
          setEmail("")
        } else {
          console.warn("⚠️ Suscripción creada pero error enviando email:", emailResult.error)
          // Aún marcamos como éxito porque la suscripción se creó
          setIsSuccess(true)
          setEmail("")
        }
      } else {
        console.warn("⚠️ Suscripción creada pero no se pudo obtener el cupón")
        setIsSuccess(true)
        setEmail("")
      }

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

