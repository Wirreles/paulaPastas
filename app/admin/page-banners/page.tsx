"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, ImageIcon, Plus } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import { PageBanner } from "@/lib/types"
import PageBannerForm from "@/components/admin/PageBannerForm"

export default function AdminPageBannersPage() {
  const [pageBanners, setPageBanners] = useState<PageBanner[]>([])
  const [loadingBanners, setLoadingBanners] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<PageBanner | null>(null)
  const [selectedType, setSelectedType] = useState<string>("todos")

  useEffect(() => {
    loadPageBanners()
  }, [])

  const loadPageBanners = async () => {
    try {
      setLoadingBanners(true)
      console.log("🔄 Cargando banners de páginas...")
      const data = await FirebaseService.getPageBanners()
      console.log("🎨 Banners cargados:", data)
      setPageBanners(data)
    } catch (error) {
      console.error("Error loading page banners:", error)
    } finally {
      setLoadingBanners(false)
    }
  }

  const handleEditBanner = (banner: PageBanner) => {
    setEditingBanner(banner)
    setShowForm(true)
  }

  // Agrupar banners por tipo
  const groupedBanners = pageBanners.reduce((acc, banner) => {
    const type = banner.pageType
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(banner)
    return acc
  }, {} as Record<string, PageBanner[]>)

  // Obtener tipos únicos para el filtro
  const uniqueTypes = Object.keys(groupedBanners).sort()

  // Filtrar banners según la selección
  const filteredBanners = selectedType === "todos" 
    ? pageBanners 
    : pageBanners.filter(banner => banner.pageType === selectedType)

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">Gestión de Banners de Páginas</h1>
              <p className="text-neutral-600">Administra las imágenes y textos de los banners de todas las páginas de categorías y subcategorías</p>
            </div>
            <Link
              href="/admin"
              className="text-sm text-neutral-500 hover:text-neutral-700"
            >
              ← Volver al Panel
            </Link>
          </div>
        </div>

        {/* Navigation Tabs/Links */}
        <div className="mb-8 flex space-x-4 border-b border-neutral-200">
          <Link href="/admin" className="py-2 px-4 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:border-primary-600 transition-colors">
            Productos
          </Link>
          <Link
            href="/admin/home-sections"
            className="py-2 px-4 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:border-primary-600 transition-colors"
          >
            Secciones del Home
          </Link>
          <Link
            href="/admin/page-banners"
            className="py-2 px-4 text-sm font-medium text-primary-600 border-b-2 border-primary-600"
          >
            Banners de Páginas
          </Link>
        </div>

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-neutral-700">Filtrar por tipo:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="todos">Todos los tipos ({pageBanners.length})</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "categoria" && "Categorías"}
                  {type === "subcategoria" && "Subcategorías"}
                  {type === "especial" && "Páginas Especiales"}
                  {type !== "categoria" && type !== "subcategoria" && type !== "especial" && type}
                  {" "}({groupedBanners[type]?.length || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Banners Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Banners ({filteredBanners.length})</h2>
          </div>

          {loadingBanners ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Cargando banners...</p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Banner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Descripción
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
                  {filteredBanners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ImageIcon className="w-5 h-5 text-neutral-500 mr-2" />
                          <div className="text-sm font-medium text-neutral-900">{banner.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {banner.pageType === "categoria" && "Categoría"}
                          {banner.pageType === "subcategoria" && "Subcategoría"}
                          {banner.pageType === "especial" && "Página Especial"}
                          {banner.pageType !== "categoria" && banner.pageType !== "subcategoria" && banner.pageType !== "especial" && banner.pageType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs truncate">{banner.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-12 relative rounded-lg overflow-hidden bg-neutral-100">
                          {banner.imageUrl ? (
                            <Image
                              src={banner.imageUrl}
                              alt={banner.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-neutral-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditBanner(banner)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBanners.length === 0 && !loadingBanners && (
                <div className="p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No se encontraron banners</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <PageBannerForm
          banner={editingBanner}
          onClose={() => {
            setShowForm(false)
            setEditingBanner(null)
          }}
          onSave={() => {
            loadPageBanners()
            setShowForm(false)
            setEditingBanner(null)
          }}
        />
      )}
    </div>
  )
} 