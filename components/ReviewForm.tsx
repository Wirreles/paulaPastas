"use client"

import { useState } from "react"
import { Star, Send, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/lib/toast-context"
import { FirebaseService } from "@/lib/firebase-service"
import type { Review } from "@/lib/types"

interface ReviewFormProps {
  productoId: string
  productoNombre: string
  onClose: () => void
  onReviewSubmitted: () => void
}

export default function ReviewForm({ productoId, productoNombre, onClose, onReviewSubmitted }: ReviewFormProps) {
  const { user, userData } = useAuth()
  const { success, error } = useToast()
  
  const [rating, setRating] = useState(5)
  const [testimonial, setTestimonial] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user || !userData || userData.rol !== "cliente") {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!testimonial.trim()) {
      error("Error", "Por favor escribe tu reseña")
      return
    }

    setIsSubmitting(true)

    try {
      const reviewData: Omit<Review, "id" | "fechaCreacion"> = {
        productoId,
        userId: user.uid,
        userName: userData.nombre || "Usuario",
        userEmail: user.email,
        rating,
        testimonial: testimonial.trim(),
        aprobada: false, // Requiere aprobación del administrador
        destacada: false, // No destacada por defecto
      }

      await FirebaseService.addReview(reviewData)
      
      success(
        "Reseña enviada", 
        "Tu reseña ha sido enviada y será revisada por nuestro equipo antes de ser publicada."
      )
      
      onReviewSubmitted()
      onClose()
    } catch (err: any) {
      error("Error al enviar reseña", err.message || "No se pudo enviar la reseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStarClick = (starRating: number) => {
    setRating(starRating)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900">Escribir Reseña</h2>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-neutral-600"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="text-sm text-neutral-600 mb-4">
              Estás escribiendo una reseña para: <span className="font-semibold">{productoNombre}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Calificación *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  className="focus:outline-none"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= rating
                        ? "text-yellow-400 fill-current"
                        : "text-neutral-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-neutral-600">
                {rating} estrella{rating !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Tu Reseña *
            </label>
            <textarea
              required
              rows={4}
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Comparte tu experiencia con este producto..."
              disabled={isSubmitting}
            />
            <p className="text-xs text-neutral-500 mt-1">
              💡 Tu reseña será revisada antes de ser publicada.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !testimonial.trim()}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Reseña</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
