"use client"

import { useState, useEffect } from "react"
import { X, Plus, Edit, Trash2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FirebaseService } from "@/lib/firebase-service"
import { useToast } from "@/lib/toast-context"

interface Direccion {
  id: string
  calle: string
  numero: string
  piso?: string
  codigoPostal: string
  ciudad: string
  provincia: string
  indicaciones?: string
  fechaCreacion: any
}

interface DireccionesModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onDireccionesChange: () => void
}

export default function DireccionesModal({ isOpen, onClose, userId, onDireccionesChange }: DireccionesModalProps) {
  console.log(`🎯 Modal: userId recibido: ${userId}`)
  const [direcciones, setDirecciones] = useState<Direccion[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingDireccion, setEditingDireccion] = useState<Direccion | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    calle: "",
    numero: "",
    piso: "",
    codigoPostal: "",
    ciudad: "",
    provincia: "",
    indicaciones: ""
  })

  const { success, error } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadDirecciones()
    }
  }, [isOpen, userId])

  const loadDirecciones = async () => {
    try {
      console.log(`📱 Modal: Cargando direcciones para userId: ${userId}`)
      const data = await FirebaseService.getDireccionesByUser(userId)
      console.log(`📱 Modal: Direcciones recibidas:`, data)
      setDirecciones(data)
    } catch (err) {
      console.error("Error cargando direcciones:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const direccionData = {
        userId,
        ...formData,
        piso: formData.piso || undefined,
        indicaciones: formData.indicaciones || undefined
      }

      if (editingDireccion) {
        await FirebaseService.updateDireccion(editingDireccion.id, direccionData)
        success("Dirección actualizada", "La dirección se ha actualizado correctamente")
      } else {
        await FirebaseService.addDireccion(direccionData)
        success("Dirección agregada", "La dirección se ha agregado correctamente")
      }

      setShowForm(false)
      setEditingDireccion(null)
      resetForm()
      loadDirecciones()
      onDireccionesChange()
    } catch (err) {
      error("Error", "No se pudo guardar la dirección")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (direccion: Direccion) => {
    setEditingDireccion(direccion)
    setFormData({
      calle: direccion.calle,
      numero: direccion.numero,
      piso: direccion.piso || "",
      codigoPostal: direccion.codigoPostal,
      ciudad: direccion.ciudad,
      provincia: direccion.provincia,
      indicaciones: direccion.indicaciones || ""
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta dirección?")) return

    try {
      await FirebaseService.deleteDireccion(id)
      success("Dirección eliminada", "La dirección se ha eliminado correctamente")
      loadDirecciones()
      onDireccionesChange()
    } catch (err) {
      error("Error", "No se pudo eliminar la dirección")
    }
  }

  const resetForm = () => {
    setFormData({
      calle: "",
      numero: "",
      piso: "",
      codigoPostal: "",
      ciudad: "",
      provincia: "",
      indicaciones: ""
    })
  }

  const handleNewDireccion = () => {
    setEditingDireccion(null)
    resetForm()
    setShowForm(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Gestionar Direcciones</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          {!showForm ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Mis Direcciones</h3>
                <Button onClick={handleNewDireccion} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar Dirección
                </Button>
              </div>

              {direcciones.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No tienes direcciones guardadas</p>
                  <Button onClick={handleNewDireccion} className="mt-4">
                    Agregar primera dirección
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {direcciones.map((direccion) => (
                    <Card key={direccion.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">
                              {direccion.calle} {direccion.numero}
                              {direccion.piso && `, Piso ${direccion.piso}`}
                            </p>
                            <p className="text-sm text-neutral-600">
                              {direccion.ciudad}, {direccion.provincia} - CP: {direccion.codigoPostal}
                            </p>
                            {direccion.indicaciones && (
                              <p className="text-sm text-neutral-500 mt-1">
                                {direccion.indicaciones}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(direccion)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(direccion.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-medium">
                {editingDireccion ? "Editar Dirección" : "Nueva Dirección"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Calle *</label>
                  <input
                    type="text"
                    required
                    value={formData.calle}
                    onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-md"
                    placeholder="Av. San Martín"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Número *</label>
                  <input
                    type="text"
                    required
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-md"
                    placeholder="1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Piso / Depto</label>
                  <input
                    type="text"
                    value={formData.piso}
                    onChange={(e) => setFormData({ ...formData, piso: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-md"
                    placeholder="2° A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Código Postal *</label>
                  <input
                    type="text"
                    required
                    value={formData.codigoPostal}
                    onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-md"
                    placeholder="2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ciudad *</label>
                  <input
                    type="text"
                    required
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-md"
                    placeholder="Rosario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Provincia *</label>
                  <input
                    type="text"
                    required
                    value={formData.provincia}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-md"
                    placeholder="Santa Fe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Indicaciones adicionales</label>
                <textarea
                  value={formData.indicaciones}
                  onChange={(e) => setFormData({ ...formData, indicaciones: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-md"
                  rows={3}
                  placeholder="Entre calles, puntos de referencia, etc."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : editingDireccion ? "Actualizar" : "Guardar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingDireccion(null)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 