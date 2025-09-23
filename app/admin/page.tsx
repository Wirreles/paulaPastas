"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute"
import { Plus, Edit, Trash2, Eye, Package, BarChart3, Image, FileText, RefreshCcw } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import type { Producto } from "@/lib/types"
import ProductForm from "@/components/admin/ProductForm"
import AdminNavigation from "@/components/admin/AdminNavigation"
import { toast } from "sonner"

export default function AdminPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      setLoadingProducts(true)
      console.log("🔄 Cargando productos...")
      const data = await FirebaseService.getProductos()
      setProductos(data)
      toast.success("Productos actualizados correctamente")
    } catch (error) {
      console.error("Error loading productos:", error)
      toast.error("Error al cargar los productos")
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await FirebaseService.deleteProducto(id)
        await loadProductos()
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  const productosFiltrados =
    filtroCategoria === "todas" ? productos : productos.filter((p) => p.categoria === filtroCategoria)

  const stats = {
    total: productos.length,
    rellenas: productos.filter((p) => p.categoria === "rellenas").length,
    sinRelleno: productos.filter((p) => p.categoria === "sin-relleno").length,
    sinTacc: productos.filter((p) => p.categoria === "sin-tacc").length,
    salsas: productos.filter((p) => p.categoria === "salsas").length,
    packs: productos.filter((p) => p.categoria === "packs").length,
    destacados: productos.filter((p) => p.destacado).length,
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminNavigation />

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Total Productos</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">R</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Rellenas</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.rellenas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">S</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Sin Relleno</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.sinRelleno}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">T</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Sin TACC</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.sinTacc}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Destacados</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.destacados}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">S</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Salsas</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.salsas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">P</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Packs</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.packs}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Filtrar por categoría:</label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="todas">Todas las categorías</option>
                  <option value="rellenas">Pastas Rellenas</option>
                  <option value="sin-relleno">Sin Relleno</option>
                  <option value="sin-tacc">Sin TACC</option>
                  <option value="salsas">Salsas</option>
                  <option value="packs">Packs</option>
                </select>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={loadProductos}
                  disabled={loadingProducts}
                  className="flex-1 inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCcw className={`-ml-1 mr-2 h-5 w-5 text-neutral-500 ${loadingProducts ? 'animate-spin' : ''}`} aria-hidden="true" />
                  Actualizar
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(null)
                    setShowProductForm(true)
                  }}
                  className="flex-1 inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors sm:w-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nuevo Producto
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">Productos ({productosFiltrados.length})</h2>
            </div>

            {loadingProducts ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-neutral-600">Cargando productos...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Precio
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
                    {productosFiltrados.map((producto) => (
                      <tr key={producto.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={producto.imagen || "/placeholder.svg"}
                              alt={producto.nombre}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-900">{producto.nombre}</div>
                              <div className="text-sm text-neutral-500">{producto.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {producto.categoria.replace("-", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">${producto.precio}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                producto.disponible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {producto.disponible ? "Disponible" : "No disponible"}
                            </span>
                            {producto.destacado && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⭐ Destacado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                if (producto.subcategoria) {
                                  window.open(
                                    `/pastas/${producto.categoria}/${producto.subcategoria}/${producto.slug}`,
                                    "_blank",
                                  )
                                } else {
                                  alert(
                                    "Este producto no tiene subcategoría asignada. Por favor, edítalo para asignar una subcategoría.",
                                  )
                                }
                              }}
                              className="text-primary-600 hover:text-primary-900"
                              disabled={!producto.subcategoria}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(producto)
                                setShowProductForm(true)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(producto.id!)}
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

                {productosFiltrados.length === 0 && (
                  <div className="p-8 text-center">
                    <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600">No hay productos en esta categoría</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Product Form Modal */}
        {showProductForm && (
          <ProductForm
            producto={editingProduct}
            onClose={() => {
              setShowProductForm(false)
              setEditingProduct(null)
            }}
            onSave={() => {
              setShowProductForm(false)
              setEditingProduct(null)
              loadProductos()
            }}
          />
        )}
      </div>
    </AdminProtectedRoute>
  )
}
