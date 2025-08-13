"use client"

import { useEffect, useState } from "react"
import { Edit, ImageIcon } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import type { HomeSection } from "@/lib/types"
import HomeSectionForm from "@/components/admin/HomeSectionForm"
import AdminNavigation from "@/components/admin/AdminNavigation"

export default function AdminHomeSectionsPage() {
  const [homeSections, setHomeSections] = useState<HomeSection[]>([])
  const [loadingSections, setLoadingSections] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null)
  const [selectedSection, setSelectedSection] = useState<string>("todas")

  useEffect(() => {
    loadHomeSections()
  }, [])

  const loadHomeSections = async () => {
    try {
      setLoadingSections(true)
      console.log("🔄 Cargando secciones del home...")
      const data = await FirebaseService.getHomeSections()
      console.log("📋 Secciones cargadas:", data)
      setHomeSections(data)
    } catch (error) {
      console.error("Error loading home sections:", error)
    } finally {
      setLoadingSections(false)
    }
  }

  const handleEditSection = (section: HomeSection) => {
    setEditingSection(section)
    setShowForm(true)
  }

  // Agrupar secciones por sectionId
  const groupedSections = homeSections.reduce((acc, section) => {
    const sectionId = section.sectionId || "other"
    if (!acc[sectionId]) {
      acc[sectionId] = []
    }
    acc[sectionId].push(section)
    return acc
  }, {} as Record<string, HomeSection[]>)

  // Obtener secciones únicas para el filtro
  const uniqueSections = Object.keys(groupedSections).sort()

  // Filtrar secciones según la selección
  const filteredSections = selectedSection === "todas" 
    ? homeSections 
    : homeSections.filter(section => section.sectionId === selectedSection)

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminNavigation />

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-neutral-700">Filtrar por sección:</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="todas">Todas las secciones ({homeSections.length})</option>
              {uniqueSections.map((sectionId) => (
                <option key={sectionId} value={sectionId}>
                  {sectionId === "hero" && "Hero Principal"}
                  {sectionId === "dishes-gallery" && "Galería de Platos"}
                  {sectionId === "home-categories" && "Categorías del Home"}
                  {sectionId === "quality-assured" && "Calidad Asegurada"}
                  {sectionId !== "hero" && sectionId !== "dishes-gallery" && sectionId !== "home-categories" && sectionId !== "quality-assured" && sectionId}
                  {" "}({groupedSections[sectionId]?.length || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sections Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Secciones ({filteredSections.length})</h2>
          </div>

          {loadingSections ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Cargando secciones...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Sección
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
                  {filteredSections.map((section) => (
                    <tr key={section.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ImageIcon className="w-5 h-5 text-neutral-500 mr-2" />
                          <div className="text-sm font-medium text-neutral-900">{section.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {section.sectionId === "hero" && "Hero Principal"}
                          {section.sectionId === "dishes-gallery" && "Galería de Platos"}
                          {section.sectionId === "home-categories" && "Categorías del Home"}
                          {section.sectionId === "quality-assured" && "Calidad Asegurada"}
                          {section.sectionId !== "hero" && section.sectionId !== "dishes-gallery" && section.sectionId !== "home-categories" && section.sectionId !== "quality-assured" && section.sectionId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs truncate">{section.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {section.imageUrl && (
                          <img
                            className="h-10 w-16 rounded-md object-cover"
                            src={section.imageUrl || "/placeholder.svg"}
                            alt={section.name}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditSection(section)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSections.length === 0 && !loadingSections && (
                <div className="p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No hay secciones del home para administrar.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Home Section Form Modal */}
      {showForm && (
        <HomeSectionForm
          section={editingSection}
          onClose={() => {
            setShowForm(false)
            setEditingSection(null)
          }}
          onSave={() => {
            setShowForm(false)
            setEditingSection(null)
            loadHomeSections()
          }}
        />
      )}
    </div>
  )
}
