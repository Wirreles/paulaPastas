"use client"

import { useState, useEffect } from "react"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import { ProductPlaceholder } from "@/components/ui/ImagePlaceholder"
import { X, Upload, Trash2, Calendar, Clock, User } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import { BlogArticle } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface BlogArticleFormProps {
  article?: BlogArticle | null
  onClose: () => void
  onSave: () => void
}

export default function BlogArticleForm({ article, onClose, onSave }: BlogArticleFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    category: "recetas" as "recetas" | "lifestyle" | "consejos" | "cultura",
    readingTime: 5,
    author: "Paula Pastas",
    publishedAt: new Date(),
    isPublished: true,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [] as string[],
    order: 0,
  })

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || "",
        slug: article.slug || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        featuredImage: article.featuredImage || "",
        category: article.category || "recetas",
        readingTime: article.readingTime || 5,
        author: article.author || "Paula Pastas",
        publishedAt: article.publishedAt || new Date(),
        isPublished: article.isPublished !== undefined ? article.isPublished : true,
        seoTitle: article.seoTitle || "",
        seoDescription: article.seoDescription || "",
        seoKeywords: article.seoKeywords || [],
        order: article.order || 0,
      })
      setImagePreview(article.featuredImage || "")
    }
  }, [article])

  const handleInputChange = (field: string, value: any) => {
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
    setFormData((prev) => ({ ...prev, featuredImage: "" }))
  }

  const uploadImage = async (file: File): Promise<string> => {
    const timestamp = Date.now()
    const fileName = `blog-articles/${timestamp}-${file.name}`
    return await FirebaseService.uploadImage(file, fileName)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleTitleChange = (title: string) => {
    handleInputChange("title", title)
    if (!article) {
      // Solo generar slug automáticamente para artículos nuevos
      const slug = generateSlug(title)
      handleInputChange("slug", slug)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content) {
      toast({
        title: "Error de validación",
        description: "Todos los campos obligatorios deben estar completos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      let featuredImage = formData.featuredImage

      // Subir nueva imagen si se seleccionó una
      if (imageFile) {
        featuredImage = await uploadImage(imageFile)
      }

      const articleData = {
        ...formData,
        featuredImage,
        publishedAt: formData.publishedAt instanceof Date ? formData.publishedAt : new Date(formData.publishedAt),
      }

      if (article?.id) {
        // Actualizar artículo existente
        await FirebaseService.updateBlogArticle(article.id, articleData)
        toast({
          title: "Artículo actualizado",
          description: "El artículo se actualizó correctamente",
        })
      } else {
        // Crear nuevo artículo
        await FirebaseService.createBlogArticle(articleData)
        toast({
          title: "Artículo creado",
          description: "El artículo se creó correctamente",
        })
      }

      onSave()
    } catch (error) {
      console.error("Error saving article:", error)
      toast({
        title: "Error",
        description: "Hubo un error al guardar el artículo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              {article ? "Editar Artículo" : "Nuevo Artículo"}
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
                  Título del Artículo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: Cómo hacer salsas caseras que enamoran"
                />
              </div>

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
                  placeholder="Ej: como-hacer-salsas-caseras"
                />
              </div>
            </div>

            {/* Categoría y tiempo de lectura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Categoría *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="recetas">Recetas</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="consejos">Consejos</option>
                  <option value="cultura">Cultura</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Tiempo de Lectura (minutos) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.readingTime}
                  onChange={(e) => handleInputChange("readingTime", parseInt(e.target.value))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="5"
                />
              </div>
            </div>

            {/* Autor y fecha de publicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Autor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Paula Pastas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fecha de Publicación *
                </label>
                <input
                  type="date"
                  required
                  value={formData.publishedAt instanceof Date ? formData.publishedAt.toISOString().split('T')[0] : new Date(formData.publishedAt).toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange("publishedAt", new Date(e.target.value))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Estado y orden */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.isPublished ? "published" : "draft"}
                  onChange={(e) => handleInputChange("isPublished", e.target.value === "published")}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                </select>
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

            {/* Extracto */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Extracto *
              </label>
              <textarea
                required
                value={formData.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                rows={3}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Breve descripción del artículo que aparecerá en las tarjetas del blog"
              />
            </div>

            {/* Contenido */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Contenido *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={15}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                placeholder="Contenido del artículo en HTML..."
              />
              <p className="text-xs text-neutral-500 mt-1">
                Puedes usar HTML básico: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
              </p>
            </div>

            {/* SEO */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">SEO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Título SEO
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => handleInputChange("seoTitle", e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Título optimizado para SEO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Descripción SEO
                  </label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => handleInputChange("seoDescription", e.target.value)}
                    rows={2}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Descripción para motores de búsqueda"
                  />
                </div>
              </div>
            </div>

            {/* Imagen destacada */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Imagen Destacada
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
                {loading ? "Guardando..." : article ? "Actualizar Artículo" : "Crear Artículo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 