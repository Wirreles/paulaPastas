"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import { useToast } from "@/lib/toast-context"
import type { Producto } from "@/lib/types"

// Sub-componentes presentacionales
import ProductFormBasicInfo from "./ProductFormBasicInfo"
import ProductFormCategoria from "./ProductFormCategoria"
import ProductFormImagen from "./ProductFormImagen"
import ProductFormIngredientes from "./ProductFormIngredientes"
import ProductFormDetalles from "./ProductFormDetalles"
import ProductFormFAQ from "./ProductFormFAQ"
import ProductFormSEO from "./ProductFormSEO"

interface ProductFormProps {
  producto?: Producto | null
  onClose: () => void
  onSave: () => void
}

export default function ProductForm({ producto, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: "",
    slug: "",
    descripcion: "",
    descripcionAcortada: "",
    precio: 0,
    categoria: "rellenas",
    subcategoria: "",
    imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
    ingredientes: [],
    disponible: true,
    destacado: false,
    porciones: 4,
    // tiempoPreparacion removido
    comoPreparar: {
      titulo: "Cómo se prepara",
      texto: ""
    },
    historiaPlato: {
      titulo: "Historia del plato",
      texto: ""
    },
    preguntasFrecuentes: [],
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
  })

  const [ingredienteInput, setIngredienteInput] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [faqPregunta, setFaqPregunta] = useState("")
  const [faqRespuesta, setFaqRespuesta] = useState("")

  const { success, error } = useToast()

  useEffect(() => {
    if (producto) {
      setFormData({
        ...producto,
        comoPreparar: producto.comoPreparar || {
          titulo: "Cómo se prepara",
          texto: ""
        },
        historiaPlato: producto.historiaPlato || {
          titulo: "Historia del plato",
          texto: ""
        },
        preguntasFrecuentes: producto.preguntasFrecuentes || []
      })
      if (producto.imagen) {
        setImagePreview(producto.imagen)
      }
    }
  }, [producto])

  const generateSlug = (nombre: string) => {
    return nombre
      .toLowerCase()
      .replace(/[áàäâ]/g, "a")
      .replace(/[éèëê]/g, "e")
      .replace(/[íìïî]/g, "i")
      .replace(/[óòöô]/g, "o")
      .replace(/[úùüû]/g, "u")
      .replace(/ñ/g, "n")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleInputChange = (field: keyof Producto, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Auto-generate slug when name changes
    if (field === "nombre" && typeof value === "string") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }))
    }
  }

  const addIngrediente = () => {
    if (ingredienteInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        ingredientes: [...(prev.ingredientes || []), ingredienteInput.trim()],
      }))
      setIngredienteInput("")
    }
  }

  const removeIngrediente = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredientes: prev.ingredientes?.filter((_, i) => i !== index) || [],
    }))
  }

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        seoKeywords: [...(prev.seoKeywords || []), keywordInput.trim()],
      }))
      setKeywordInput("")
    }
  }

  const removeKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      seoKeywords: prev.seoKeywords?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNestedInputChange = (section: 'comoPreparar' | 'historiaPlato', field: 'titulo' | 'texto', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const addFAQ = () => {
    if (faqPregunta.trim() && faqRespuesta.trim()) {
      setFormData((prev) => ({
        ...prev,
        preguntasFrecuentes: [
          ...(prev.preguntasFrecuentes || []),
          {
            pregunta: faqPregunta.trim(),
            respuesta: faqRespuesta.trim()
          }
        ],
      }))
      setFaqPregunta("")
      setFaqRespuesta("")
    }
  }

  const removeFAQ = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      preguntasFrecuentes: prev.preguntasFrecuentes?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación adicional
    if (!formData.categoria) {
      error("Error de validación", "Categoría es obligatoria")
      return
    }

    // Solo validar subcategoría si no es salsas o packs
    if (!["salsas", "packs"].includes(formData.categoria) && !formData.subcategoria) {
      error("Error de validación", "Subcategoría es obligatoria para esta categoría")
      return
    }

    // Validar que se haya seleccionado una imagen para productos nuevos
    if (!producto?.id && !selectedImage && !formData.imagen) {
      error("Error de validación", "Debes seleccionar una imagen para el producto")
      return
    }

    setLoading(true)

    try {
      let imageUrl = formData.imagen

      // Subir nueva imagen si se seleccionó una
      if (selectedImage) {
        const timestamp = Date.now()
        const fileName = `productos/${timestamp}-${selectedImage.name}`
        imageUrl = await FirebaseService.uploadImage(selectedImage, fileName)

        // Si había una imagen anterior y se sube una nueva, eliminar la anterior.
        // Nota: la condición producto.imagen !== formData.imagen fue eliminada porque
        // formData.imagen se inicializa desde producto en el useEffect, por lo que
        // siempre son iguales al editar (condición siempre false → imagen nunca se borraba).
        // El if (selectedImage) externo ya garantiza que solo entramos si hay nueva imagen.
        if (producto?.imagen) {
          try {
            await FirebaseService.deleteImage(producto.imagen)
          } catch (deleteError) {
            console.warn("No se pudo eliminar la imagen anterior:", deleteError)
          }
        }
      }

      const productData = {
        ...formData,
        imagen: imageUrl,
      }

      if (producto?.id) {
        await FirebaseService.updateProducto(producto.id, productData)
        success("Producto actualizado", "El producto se ha actualizado correctamente")
      } else {
        await FirebaseService.addProducto(productData as Omit<Producto, "id">)
        success("Producto creado", "El producto se ha creado correctamente")
      }
      onSave()
    } catch (err: any) {
      error("Error al guardar", err.message || "No se pudo guardar el producto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900">{producto ? "Editar Producto" : "Nuevo Producto"}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda: Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Información Básica</h3>
              <ProductFormBasicInfo
                nombre={formData.nombre ?? ""}
                slug={formData.slug ?? ""}
                descripcion={formData.descripcion ?? ""}
                descripcionAcortada={formData.descripcionAcortada ?? ""}
                precio={formData.precio ?? 0}
                porciones={formData.porciones ?? 4}
                disponible={formData.disponible ?? true}
                destacado={formData.destacado ?? false}
                onChange={handleInputChange}
              />
              <ProductFormCategoria
                categoria={formData.categoria ?? ""}
                subcategoria={formData.subcategoria ?? ""}
                onChange={handleInputChange}
              />
            </div>

            {/* Columna derecha: Configuración */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Configuración</h3>
              <ProductFormImagen
                imagePreview={imagePreview}
                currentImageUrl={formData.imagen}
                onImageChange={handleImageChange}
              />
              <ProductFormIngredientes
                ingredientes={formData.ingredientes ?? []}
                ingredienteInput={ingredienteInput}
                onIngredienteInputChange={setIngredienteInput}
                onAdd={addIngrediente}
                onRemove={removeIngrediente}
              />
            </div>
          </div>

          {/* Sección: Información adicional del producto */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Información Adicional del Producto</h3>
            <ProductFormDetalles
              comoPreparar={formData.comoPreparar ?? { titulo: "Cómo se prepara", texto: "" }}
              historiaPlato={formData.historiaPlato ?? { titulo: "Historia del plato", texto: "" }}
              onNestedChange={handleNestedInputChange}
            />
          </div>

          {/* Sección: Preguntas Frecuentes */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Preguntas Frecuentes</h3>
            <ProductFormFAQ
              preguntasFrecuentes={formData.preguntasFrecuentes ?? []}
              faqPregunta={faqPregunta}
              faqRespuesta={faqRespuesta}
              onPreguntaChange={setFaqPregunta}
              onRespuestaChange={setFaqRespuesta}
              onAdd={addFAQ}
              onRemove={removeFAQ}
            />
          </div>

          {/* Sección: SEO */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">SEO</h3>
            <ProductFormSEO
              seoTitle={formData.seoTitle ?? ""}
              seoDescription={formData.seoDescription ?? ""}
              seoKeywords={formData.seoKeywords ?? []}
              keywordInput={keywordInput}
              onKeywordInputChange={setKeywordInput}
              onChange={handleInputChange}
              onKeywordAdd={addKeyword}
              onKeywordRemove={removeKeyword}
            />
          </div>

          {/* Actions */}
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
                  {producto ? "Actualizar" : "Crear"} Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
