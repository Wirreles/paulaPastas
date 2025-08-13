"use client"

import { useState, useEffect } from "react"
import { Star, Check, X, ThumbsUp, Filter, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import { Review } from "@/lib/types"
import AdminNavigation from "@/components/admin/AdminNavigation"
import { useAuth } from "@/lib/auth-context"

export default function ReviewsPage() {
  const { user } = useAuth() // Hook para obtener el usuario administrador actual
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [reviewsPerPage] = useState(5)
  const [filterAprobada, setFilterAprobada] = useState("todos")
  const [filterDestacada, setFilterDestacada] = useState("todos")
  const [filterProducto, setFilterProducto] = useState("")
  const [filterUsuario, setFilterUsuario] = useState("")
  const [updatingReviews, setUpdatingReviews] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setIsLoading(true)
      const allReviews = await FirebaseService.getAllReviews()
      setReviews(allReviews)
    } catch (error) {
      console.error("Error cargando reseñas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAprobada = async (reviewId: string, currentStatus: boolean) => {
    try {
      setUpdatingReviews(prev => new Set(prev).add(reviewId))
      
      // Obtener el ID del administrador actual
      const adminId = user?.uid || "admin-desconocido"
      
      // Pasar el ID del administrador al actualizar el estado
      await FirebaseService.updateReviewStatus(reviewId, !currentStatus, adminId)
      await loadReviews()
    } catch (error) {
      console.error("Error actualizando estado de aprobación:", error)
    } finally {
      setUpdatingReviews(prev => {
        const newSet = new Set(prev)
        newSet.delete(reviewId)
        return newSet
      })
    }
  }

  const handleToggleDestacada = async (reviewId: string, currentStatus: boolean) => {
    try {
      setUpdatingReviews(prev => new Set(prev).add(reviewId))
      await FirebaseService.toggleReviewDestacada(reviewId, !currentStatus)
      await loadReviews()
    } catch (error) {
      console.error("Error actualizando estado destacado:", error)
    } finally {
      setUpdatingReviews(prev => {
        const newSet = new Set(prev)
        newSet.delete(reviewId)
        return newSet
      })
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta reseña?")) return
    
    try {
      setUpdatingReviews(prev => new Set(prev).add(reviewId))
      await FirebaseService.deleteReview(reviewId)
      await loadReviews()
    } catch (error) {
      console.error("Error eliminando reseña:", error)
    } finally {
      setUpdatingReviews(prev => {
        const newSet = new Set(prev)
        newSet.delete(reviewId)
        return newSet
      })
    }
  }

  const clearFilters = () => {
    setFilterAprobada("todos")
    setFilterDestacada("todos")
    setFilterProducto("")
    setFilterUsuario("")
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  // Filtrar reseñas
  const filteredReviews = reviews.filter(review => {
    if (filterAprobada !== "todos") {
      if (filterAprobada === "aprobada" && !review.aprobada) return false
      if (filterAprobada === "pendiente" && review.aprobada) return false
    }
    
    if (filterDestacada !== "todos") {
      if (filterDestacada === "destacada" && !review.destacada) return false
      if (filterDestacada === "no-destacada" && review.destacada) return false
    }
    
    if (filterProducto && !review.productoId.includes(filterProducto)) return false
    if (filterUsuario && !review.userName.toLowerCase().includes(filterUsuario.toLowerCase()) && !review.userEmail.toLowerCase().includes(filterUsuario.toLowerCase())) return false
    
    return true
  })

  // Paginación
  const totalReviews = filteredReviews.length
  const totalPages = Math.ceil(totalReviews / reviewsPerPage)
  const startIndex = (currentPage - 1) * reviewsPerPage
  const endIndex = startIndex + reviewsPerPage
  const currentReviews = filteredReviews.slice(startIndex, endIndex)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminNavigation />

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total Reseñas</p>
                <p className="text-2xl font-bold text-neutral-900">{totalReviews}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Aprobadas</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {reviews.filter(r => r.aprobada).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ThumbsUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Destacadas</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {reviews.filter(r => r.destacada).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Pendientes</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {reviews.filter(r => !r.aprobada).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-neutral-600 mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Estado de Aprobación
              </label>
              <select
                value={filterAprobada}
                onChange={(e) => setFilterAprobada(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="todos">Todos</option>
                <option value="aprobada">Aprobadas</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Estado Destacado
              </label>
              <select
                value={filterDestacada}
                onChange={(e) => setFilterDestacada(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="todos">Todos</option>
                <option value="destacada">Destacadas</option>
                <option value="no-destacada">No Destacadas</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Buscar por Producto
              </label>
              <input
                type="text"
                value={filterProducto}
                onChange={(e) => setFilterProducto(e.target.value)}
                placeholder="ID del producto..."
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Buscar por Usuario
              </label>
              <input
                type="text"
                value={filterUsuario}
                onChange={(e) => setFilterUsuario(e.target.value)}
                placeholder="Nombre o email..."
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Lista de Reseñas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">
              Reseñas ({totalReviews})
            </h3>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-neutral-600">Cargando reseñas...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg text-neutral-600 mb-4">
                No se encontraron reseñas con los filtros aplicados.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Calificación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Reseña
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {currentReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {review.userName}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {review.userEmail}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          {review.productoId}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-neutral-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-neutral-600">
                            {review.rating}/5
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-neutral-900 line-clamp-3">
                            {review.testimonial}
                          </p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            {review.aprobada ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Aprobada
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Pendiente
                              </span>
                            )}
                          </div>
                          {review.destacada && (
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Destacada
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleAprobada(review.id || "", review.aprobada)}
                            disabled={updatingReviews.has(review.id || "")}
                            className={`p-2 rounded-lg transition-colors ${
                              review.aprobada
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : "bg-green-100 text-green-600 hover:bg-green-200"
                            }`}
                            title={review.aprobada ? "Rechazar reseña" : "Aprobar reseña"}
                          >
                            {review.aprobada ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => handleToggleDestacada(review.id || "", review.destacada)}
                            disabled={updatingReviews.has(review.id || "")}
                            className={`p-2 rounded-lg transition-colors ${
                              review.destacada
                                ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                            title={review.destacada ? "Quitar destacada" : "Marcar como destacada"}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteReview(review.id || "")}
                            disabled={updatingReviews.has(review.id || "")}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Eliminar reseña"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-neutral-700">
              Mostrando {((currentPage - 1) * reviewsPerPage) + 1} a {Math.min(currentPage * reviewsPerPage, totalReviews)} de {totalReviews} reseñas
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
