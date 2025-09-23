"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import { ProductPlaceholder } from "@/components/ui/ImagePlaceholder"
import { Edit, FileText, Plus, Eye, Trash2, Calendar, Clock, RefreshCcw } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import { BlogArticle } from "@/lib/types"
import BlogArticleForm from "@/components/admin/BlogArticleForm"
import AdminNavigation from "@/components/admin/AdminNavigation"
import { toast } from "sonner"

type BlogArticleFormType = Omit<BlogArticle, "publishedAt"> & { publishedAt?: string };

export default function AdminBlogPage() {
  const [blogArticles, setBlogArticles] = useState<BlogArticle[]>([])
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("todas")

  useEffect(() => {
    loadBlogArticles()
  }, [])

  const loadBlogArticles = async () => {
    try {
      setLoadingArticles(true)
      console.log("🔄 Cargando artículos del blog...")
      const data = await FirebaseService.getBlogArticles()
      console.log("📝 Artículos cargados:", data)
      setBlogArticles(data)
      toast.success("Artículos actualizados correctamente")
    } catch (error) {
      console.error("Error loading blog articles:", error)
      toast.error("Error al cargar los artículos")
    } finally {
      setLoadingArticles(false)
    }
  }

  const handleEditArticle = (article: BlogArticle) => {
    // Normaliza publishedAt para el formulario
    let publishedAt: string | undefined = "";
    if (article.publishedAt) {
      // Si es string y parseable, úsalo; si es Date, úsalo; si no, deja vacío
      let d: Date | null = null;
      if (typeof article.publishedAt === "string" || typeof article.publishedAt === "number") {
        d = new Date(article.publishedAt);
      } else if (article.publishedAt instanceof Date) {
        d = article.publishedAt;
      }
      publishedAt = d && !isNaN(d.getTime()) ? d.toISOString() : "";
    } else {
      publishedAt = "";
    }
    setEditingArticle({ ...article, publishedAt } as BlogArticleFormType);
    setShowForm(true);
  }

  const handleDeleteArticle = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
      try {
        await FirebaseService.deleteBlogArticle(id)
        await loadBlogArticles()
      } catch (error) {
        console.error("Error deleting article:", error)
      }
    }
  }

  // Agrupar artículos por categoría
  const groupedArticles = blogArticles.reduce((acc, article) => {
    const category = article.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(article)
    return acc
  }, {} as Record<string, BlogArticle[]>)

  // Obtener categorías únicas para el filtro
  const uniqueCategories = Object.keys(groupedArticles).sort()

  // Filtrar artículos según la selección
  const filteredArticles = selectedCategory === "todas" 
    ? blogArticles 
    : blogArticles.filter(article => article.category === selectedCategory)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "recetas": return "bg-red-100 text-red-800"
      case "lifestyle": return "bg-purple-100 text-purple-800"
      case "consejos": return "bg-green-100 text-green-800"
      case "cultura": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "recetas": return "Recetas"
      case "lifestyle": return "Lifestyle"
      case "consejos": return "Consejos"
      case "cultura": return "Cultura"
      default: return category
    }
  }

  const formatDate = (date: unknown) => {
    if (!date) return "Sin fecha";
    let d: Date;
    if (typeof date === "string" || typeof date === "number") {
      d = new Date(date);
    } else if (date instanceof Date) {
      d = date;
    } else {
      return "Sin fecha";
    }
    if (isNaN(d.getTime())) return "Sin fecha";
    return d.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminNavigation />

        {/* Filter Section */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm mb-6">
          <div className="space-y-4">
            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Filtrar por categoría:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="todas">Todas las categorías ({blogArticles.length})</option>
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {getCategoryLabel(category)} ({groupedArticles[category]?.length || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Acciones:</label>
                <div className="flex gap-2">
                  <button
                    onClick={loadBlogArticles}
                    disabled={loadingArticles}
                    className="flex-1 inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCcw className={`-ml-1 mr-2 h-5 w-5 text-neutral-500 ${loadingArticles ? 'animate-spin' : ''}`} aria-hidden="true" />
                    Actualizar
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Artículo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Artículos ({filteredArticles.length})</h2>
          </div>

          {loadingArticles ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Cargando artículos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Artículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-neutral-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-neutral-900">{article.title}</div>
                            <div className="text-sm text-neutral-500 max-w-xs truncate">{article.excerpt}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                          {getCategoryLabel(article.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          article.isPublished 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {article.isPublished ? "Publicado" : "Borrador"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-neutral-500">
                          <Clock className="w-3 h-3" />
                          <span>{article.readingTime} min</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-12 relative rounded-lg overflow-hidden bg-neutral-100">
                          {article.featuredImage ? (
                            <ImageWrapper 
                              src={article.featuredImage} 
                              alt={article.title} 
                              fill 
                              className="object-cover"
                              fallback="/placeholder.svg?height=48&width=64&text=Articulo"
                              placeholder={<ProductPlaceholder className="object-cover" />}
                            />
                          ) : (
                            <ProductPlaceholder className="w-full h-full" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/blog/${article.slug}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleEditArticle(article)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article.id!)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredArticles.length === 0 && !loadingArticles && (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No se encontraron artículos</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

        {/* Form Modal */}
        {showForm && (
          <BlogArticleForm
            article={editingArticle as BlogArticleFormType}
            onClose={() => {
              setShowForm(false)
              setEditingArticle(null)
            }}
            onSave={() => {
              loadBlogArticles()
              setShowForm(false)
              setEditingArticle(null)
            }}
          />
        )}
      </div>
    </AdminProtectedRoute>
  )
}