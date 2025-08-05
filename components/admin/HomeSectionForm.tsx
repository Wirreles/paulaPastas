"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Save, UploadCloud } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import { useToast } from "@/lib/toast-context"
import type { HomeSection } from "@/lib/types"

interface HomeSectionFormProps {
  section: HomeSection | null
  onClose: () => void
  onSave: () => void
}

export default function HomeSectionForm({ section, onClose, onSave }: HomeSectionFormProps) {
  const [formData, setFormData] = useState<Partial<HomeSection>>({
    name: "",
    description: "",
    imageUrl: "",
    order: 0,
    sectionId: "",
    elementId: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // Nuevo estado para el archivo seleccionado
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    if (section) {
      setFormData(section)
      setSelectedFile(null) // Reiniciar el input de archivo al editar una nueva sección
    }
  }, [section])

  const handleInputChange = (field: keyof HomeSection, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      // Opcionalmente, actualiza la vista previa de la imagen inmediatamente
      setFormData((prev) => ({
        ...prev,
        imageUrl: URL.createObjectURL(e.target.files![0]),
      }))
    } else {
      setSelectedFile(null)
      // Si no se selecciona ningún archivo, vuelve a la URL de imagen original si se está editando, o vacía si es nueva
      setFormData((prev) => ({
        ...prev,
        imageUrl: section?.imageUrl || "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let newImageUrl = formData.imageUrl

      if (selectedFile) {
        // Si se selecciona un nuevo archivo, subirlo a Firebase Storage
        const fileExtension = selectedFile.name.split(".").pop()
        // Usar el ID de la sección como parte del nombre del archivo para evitar colisiones y facilitar la gestión
        const fileName = `${formData.id || Date.now()}.${fileExtension}`
        const filePath = `home-sections/${formData.sectionId}/${fileName}`
        newImageUrl = await FirebaseService.uploadImage(selectedFile, filePath)

        // Si había una imagen antigua y se sube una nueva, eliminar la antigua
        if (section?.imageUrl && section.imageUrl !== newImageUrl) {
          await FirebaseService.deleteImage(section.imageUrl)
        }
      } else if (section?.imageUrl && !formData.imageUrl) {
        // Si no hay nuevo archivo, pero la URL de la imagen se borró, eliminar la imagen antigua
        await FirebaseService.deleteImage(section.imageUrl)
      }

      const updatedData = {
        ...formData,
        imageUrl: newImageUrl,
      }

      if (formData.id) {
        await FirebaseService.updateHomeSection(formData.id, updatedData)
        success("Sección actualizada", "La sección del home se ha actualizado correctamente")
      } else {
        // Este formulario es principalmente para editar secciones existentes.
        // Si se necesitara la creación, se usaría addDoc y se generaría un ID.
        // Por ahora, nos ceñimos a la lógica de que las secciones se inicializan con seed-data.ts
        error("Error", "No se puede crear una nueva sección desde aquí. Edita las existentes.")
      }
      onSave()
    } catch (err: any) {
      error("Error al guardar", err.message || "No se pudo guardar la sección")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900">
            {section ? "Editar Sección del Home" : "Nueva Sección del Home"}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: Imagen Principal del Hero"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Descripción de la sección..."
            />
          </div>

          {/* Sección de Subida de Imagen */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Imagen</label>
            <div className="flex items-center space-x-4">
              <input type="file" id="image-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-neutral-300 rounded-lg shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
              >
                <UploadCloud className="w-5 h-5 mr-2" />
                {selectedFile ? selectedFile.name : "Seleccionar archivo"}
              </label>
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-24 h-16 object-cover rounded-lg border border-neutral-200"
                />
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500">Sube una nueva imagen o deja vacío para mantener la actual.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Orden</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => handleInputChange("order", Number.parseInt(e.target.value))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">ID de Sección</label>
              <input
                type="text"
                value={formData.sectionId}
                onChange={(e) => handleInputChange("sectionId", e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-neutral-100 cursor-not-allowed"
                readOnly
                title="Este campo es solo de lectura"
              />
            </div>
          </div>
          {formData.elementId && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">ID de Elemento</label>
              <input
                type="text"
                value={formData.elementId}
                onChange={(e) => handleInputChange("elementId", e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-neutral-100 cursor-not-allowed"
                readOnly
                title="Este campo es solo de lectura"
              />
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
