"use client"

import { useState, useEffect } from "react"
import { X, User, Mail, Phone, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FirebaseService } from "@/lib/firebase-service"
import { useToast } from "@/lib/toast-context"

interface PerfilModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userData: any
  onProfileChange: () => void
}

export default function PerfilModal({ isOpen, onClose, userId, userData, onProfileChange }: PerfilModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    dni: "",
    fechaNacimiento: "",
    preferenciasContacto: {
      llamada: false,
      whatsapp: false,
      email: true
    }
  })

  const { success, error } = useToast()

  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        nombre: userData.nombre || "",
        email: userData.email || "",
        telefono: userData.telefono || "",
        dni: userData.dni || "",
        fechaNacimiento: userData.fechaNacimiento || "",
        preferenciasContacto: {
          llamada: userData.preferenciasContacto?.llamada || false,
          whatsapp: userData.preferenciasContacto?.whatsapp || false,
          email: userData.preferenciasContacto?.email !== false // Por defecto true
        }
      })
    }
  }, [isOpen, userData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const profileData = {
        ...formData,
        dni: formData.dni || undefined,
        fechaNacimiento: formData.fechaNacimiento || undefined
      }

      await FirebaseService.updateUserProfile(userId, profileData)
      success("Perfil actualizado", "Tu perfil se ha actualizado correctamente")
      onProfileChange()
      onClose()
    } catch (err) {
      error("Error", "No se pudo actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  const handlePreferenciaChange = (tipo: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferenciasContacto: {
        ...prev.preferenciasContacto,
        [tipo]: checked
      }
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Editar Perfil</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nombre completo *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-md"
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-md"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Teléfono *
              </label>
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-md"
                placeholder="(0341) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                DNI / CUIT
              </label>
              <input
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-md"
                placeholder="12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Preferencias de contacto</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.preferenciasContacto.email}
                  onChange={(e) => handlePreferenciaChange('email', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.preferenciasContacto.whatsapp}
                  onChange={(e) => handlePreferenciaChange('whatsapp', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">WhatsApp</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.preferenciasContacto.llamada}
                  onChange={(e) => handlePreferenciaChange('llamada', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Llamada telefónica</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 