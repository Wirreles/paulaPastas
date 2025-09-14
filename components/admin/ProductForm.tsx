"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import { useToast } from "@/lib/toast-context"
import type { Producto } from "@/lib/types"

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
        
        // Si había una imagen anterior y se sube una nueva, eliminar la anterior
        if (producto?.imagen && producto.imagen !== formData.imagen) {
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
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Información Básica</h3>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: Ravioles de Carne"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Slug (URL) *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="ravioles-de-carne"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  placeholder="Descripción del producto...&#10;Puedes usar Enter para crear párrafos&#10;y respetar la ortografía..."
                />
                <p className="text-xs text-neutral-500 mt-1">
                  💡 Usa Enter para crear párrafos. El formato se respetará al mostrar el producto.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción Acortada</label>
                <textarea
                  rows={2}
                  value={formData.descripcionAcortada}
                  onChange={(e) => handleInputChange("descripcionAcortada", e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Descripción breve del producto para mostrar en listas o resúmenes..."
                />
                <p className="text-xs text-neutral-500 mt-1">
                  💡 Descripción más corta para mostrar en cards o listas de productos.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Precio *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => handleInputChange("precio", Number.parseFloat(e.target.value))}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Porciones</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.porciones}
                    onChange={(e) => handleInputChange("porciones", Number.parseInt(e.target.value))}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría *</label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => handleInputChange("categoria", e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="rellenas">Pastas Rellenas</option>
                    <option value="sin-relleno">Sin Relleno</option>
                    <option value="sin-tacc">Sin TACC</option>
                    <option value="salsas">Salsas Caseras</option>
                    <option value="packs">Packs y Combos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Subcategoría {!["salsas", "packs"].includes(formData.categoria || "") ? "*" : ""}
                  </label>
                  <select
                    required={!["salsas", "packs"].includes(formData.categoria || "")}
                    value={formData.subcategoria}
                    onChange={(e) => handleInputChange("subcategoria", e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={!formData.categoria}
                  >
                    <option value="">Seleccionar subcategoría</option>
                    {formData.categoria === "rellenas" && (
                      <>
                        <option value="lasagna">Lasagna</option>
                        <option value="ravioles">Ravioles</option>
                        <option value="sorrentinos">Sorrentinos</option>
                      </>
                    )}
                    {formData.categoria === "sin-relleno" && (
                      <>
                        <option value="noquis">Ñoquis</option>
                        <option value="fideos">Fideos</option>
                      </>
                    )}
                    {formData.categoria === "sin-tacc" && (
                      <>
                        <option value="ravioles">Ravioles Sin TACC</option>
                        <option value="fideos">Fideos Sin TACC</option>
                      </>
                    )}
                    {["salsas", "packs"].includes(formData.categoria || "") && (
                      <option value="">No requiere subcategoría</option>
                    )}
                  </select>
                </div>
              </div>


            </div>

            {/* Configuración adicional */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Configuración</h3>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Imagen del Producto *</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-neutral-500">
                    💡 Formatos soportados: JPG, PNG, GIF. Tamaño máximo recomendado: 2MB
                  </p>
                </div>
                
                {/* Preview de imagen */}
                {(imagePreview || formData.imagen) && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-neutral-700 mb-2">Vista previa:</p>
                    <img
                      src={imagePreview || formData.imagen || "/placeholder.svg"}
                      alt="Preview"
                      className="w-32 h-24 object-cover rounded-lg border border-neutral-200"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.disponible}
                    onChange={(e) => handleInputChange("disponible", e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-neutral-700">Disponible</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.destacado}
                    onChange={(e) => handleInputChange("destacado", e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-neutral-700">Destacado</span>
                </label>
              </div>

              {/* Ingredientes */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Ingredientes</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ingredienteInput}
                    onChange={(e) => setIngredienteInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIngrediente())}
                    className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Agregar ingrediente..."
                  />
                  <button
                    type="button"
                    onClick={addIngrediente}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.ingredientes?.map((ingrediente, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
                    >
                      {ingrediente}
                      <button
                        type="button"
                        onClick={() => removeIngrediente(index)}
                        className="ml-2 text-neutral-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Nuevas secciones dinámicas */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Información Adicional del Producto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sección: Cómo se prepara */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-neutral-800">Cómo se prepara</h4>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Título de la sección</label>
                  <input
                    type="text"
                    value={formData.comoPreparar?.titulo || ""}
                    onChange={(e) => handleNestedInputChange("comoPreparar", "titulo", e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Cómo preparar este plato"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Instrucciones de preparación</label>
                  <textarea
                    rows={4}
                    value={formData.comoPreparar?.texto || ""}
                    onChange={(e) => handleNestedInputChange("comoPreparar", "texto", e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    placeholder="Paso 1: Hervir agua con sal...&#10;Paso 2: Cocinar la pasta...&#10;Paso 3: Servir caliente..."
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    💡 Usa Enter para separar pasos. El formato se respetará al mostrar el producto.
                  </p>
                </div>
              </div>

              {/* Sección: Historia del plato */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-neutral-800">Historia del plato</h4>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Título de la sección</label>
                  <input
                    type="text"
                    value={formData.historiaPlato?.titulo || ""}
                    onChange={(e) => handleNestedInputChange("historiaPlato", "titulo", e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Historia y origen de este plato"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Historia y origen</label>
                  <textarea
                    rows={4}
                    value={formData.historiaPlato?.texto || ""}
                    onChange={(e) => handleNestedInputChange("historiaPlato", "texto", e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    placeholder="Este plato tiene sus orígenes en...&#10;La tradición cuenta que...&#10;Hoy en día se prepara..."
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    💡 Usa Enter para crear párrafos. El formato se respetará al mostrar el producto.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Preguntas Frecuentes */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Preguntas Frecuentes</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Pregunta</label>
                  <input
                    type="text"
                    value={faqPregunta}
                    onChange={(e) => setFaqPregunta(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: ¿Cuánto tiempo tarda en cocinarse?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Respuesta</label>
                  <textarea
                    rows={3}
                    value={faqRespuesta}
                    onChange={(e) => setFaqRespuesta(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    placeholder="Respuesta a la pregunta..."
                  />
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addFAQ}
                  disabled={!faqPregunta.trim() || !faqRespuesta.trim()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Agregar Pregunta Frecuente
                </button>
              </div>

              {/* Lista de FAQs existentes */}
              {formData.preguntasFrecuentes && formData.preguntasFrecuentes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-md font-medium text-neutral-800">Preguntas agregadas:</h4>
                  {formData.preguntasFrecuentes.map((faq, index) => (
                    <div key={index} className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-neutral-900">Pregunta {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeFAQ(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          × Eliminar
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-neutral-700">Pregunta:</span>
                          <p className="text-sm text-neutral-600 mt-1">{faq.pregunta}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-neutral-700">Respuesta:</span>
                          <p className="text-sm text-neutral-600 mt-1 whitespace-pre-line">{faq.respuesta}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SEO Section */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">SEO</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Título SEO</label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => handleInputChange("seoTitle", e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Título optimizado para SEO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción SEO</label>
                <textarea
                  rows={2}
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange("seoDescription", e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Descripción para meta description"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Palabras Clave SEO</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                  className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Agregar palabra clave..."
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.seoKeywords?.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(index)}
                      className="ml-2 text-primary-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
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
