"use client"

import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute"
import AdminNavigation from "@/components/admin/AdminNavigation"

export default function AdminHomeSectionsPage() {
  // SECCIÓN DESHABILITADA: Las secciones del home ahora son estáticas
  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminNavigation />
          
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl">🏠</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Sección Deshabilitada
            </h2>
            <p className="text-neutral-600 mb-6">
              Las secciones del home ahora son estáticas y se gestionan directamente desde el código.
            </p>
            <p className="text-sm text-neutral-500">
              Esta funcionalidad ha sido deshabilitada temporalmente. El código se mantiene intacto para uso futuro.
            </p>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  )
}