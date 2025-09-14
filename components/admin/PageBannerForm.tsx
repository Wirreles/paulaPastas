"use client"

import { useState, useEffect } from "react"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import { ProductPlaceholder } from "@/components/ui/ImagePlaceholder"
import { X, Upload, Trash2 } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import { PageBanner } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface PageBannerFormProps {
  banner?: PageBanner | null
  onClose: () => void
  onSave: () => void
}

export default function PageBannerForm({ banner, onClose, onSave }: PageBannerFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    title: "",
    subtitle: "",
    imageUrl: "",
    pageType: "categoria" as "categoria" | "subcategoria" | "especial",
    categoria: "",
    subcategoria: "",
    slug: "",
    order: 0,
  })

  useEffect(() => {
    if (banner) {
      setFormData({
        name: banner.name || "",
        description: banner.description || "",
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        imageUrl: banner.imageUrl || "",
        pageType: banner.pageType || "categoria",
        categoria: banner.categoria || "",
        subcategoria: banner.subcategoria || "",
        slug: banner.slug || "",
        order: banner.order || 0,
      })
      setImagePreview(banner.imageUrl || "")
    }
  }, [banner])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview("")
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
  }

  const uploadImage = async (file: File): Promise<string> => {
    const timestamp = Date.now()
    const fileName = `page-banners/${timestamp}-${file.name}`
    return await FirebaseService.uploadImage(file, fileName)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.title || !formData.subtitle) {
      toast({
        title: "Error de validación",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      let imageUrl = formData.imageUrl

      // Subir nueva imagen si se seleccionó una
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const bannerData = {
        ...formData,
        imageUrl,
      }

      if (banner?.id) {
        // Actualizar banner existente
        await FirebaseService.updatePageBanner(banner.id, bannerData)
        toast({
          title: "Banner actualizado",
          description: "El banner se actualizó correctamente",
        })
      } else {
        // Crear nuevo banner
        await FirebaseService.createPageBanner(bannerData)
        toast({
          title: "Banner creado",
          description: "El banner se creó correctamente",
        })
      }

      onSave()
    } catch (error) {
      console.error("Error saving banner:", error)
      toast({
        title: "Error",
        description: "Hubo un error al guardar el banner",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              {banner ? "Editar Banner" : "Nuevo Banner"}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre del Banner *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: Banner Pastas Rellenas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Tipo de Página *
                </label>
                <select
                  required
                  value={formData.pageType}
                  onChange={(e) => handleInputChange("pageType", e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="categoria">Categoría</option>
                  <option value="subcategoria">Subcategoría</option>
                  <option value="especial">Página Especial</option>
                </select>
              </div>
            </div>

            {/* Categoría y subcategoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleInputChange("categoria", e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="rellenas">Rellenas</option>
                  <option value="sin-relleno">Sin Relleno</option>
                  <option value="sin-tacc">Sin TACC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Subcategoría
                </label>
                <select
                  value={formData.subcategoria}
                  onChange={(e) => handleInputChange("subcategoria", e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleccionar subcategoría</option>
                  <option value="lasagna">Lasagna</option>
                  <option value="ravioles">Ravioles</option>
                  <option value="sorrentinos">Sorrentinos</option>
                  <option value="noquis">Ñoquis</option>
                  <option value="fideos">Fideos</option>
                  <option value="ravioles-fritos">Ravioles Fritos</option>
                </select>
              </div>
            </div>

            {/* Slug y orden */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: rellenas o rellenas/ravioles"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Orden
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange("order", parseInt(e.target.value))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Título y subtítulo */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Título del Banner *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ej: Pastas rellenas caseras artesanales"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Subtítulo del Banner *
              </label>
              <textarea
                required
                value={formData.subtitle}
                onChange={(e) => handleInputChange("subtitle", e.target.value)}
                rows={3}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Descripción del banner que aparecerá debajo del título"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={2}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Descripción para el panel de administración"
              />
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Imagen del Banner
              </label>
              
              {imagePreview && (
                <div className="mb-4 relative">
                  <div className="w-full h-48 relative rounded-lg overflow-hidden bg-neutral-100">
                    <ImageWrapper 
                      src={imagePreview} 
                      alt="Preview" 
                      fill 
                      className="object-cover"
                      fallback="/placeholder.svg?height=192&width=400&text=Preview"
                      placeholder={<ProductPlaceholder className="object-cover" />}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer bg-neutral-50 hover:bg-neutral-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-neutral-500" />
                    <p className="mb-2 text-sm text-neutral-500">
                      <span className="font-semibold">Click para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-neutral-500">PNG, JPG, GIF hasta 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? "Guardando..." : banner ? "Actualizar Banner" : "Crear Banner"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 