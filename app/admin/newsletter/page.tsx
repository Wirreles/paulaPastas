"use client"

import { useState, useEffect } from "react"
import { 
  Mail, 
  Users, 
  Send, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Clock
} from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import { emailService } from "@/lib/email-service"
import type { Suscripcion, NewsletterCampaign } from "@/lib/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import AdminNavigation from "@/components/admin/AdminNavigation"

// Función helper para convertir fechas de Firestore
const convertFirestoreDate = (date: any): Date => {
  if (!date) return new Date()
  
  // Si es un timestamp de Firestore
  if (date && typeof date === 'object' && date.seconds) {
    return new Date(date.seconds * 1000)
  }
  
  // Si es un timestamp en milisegundos
  if (typeof date === 'number') {
    return new Date(date)
  }
  
  // Si ya es un Date
  if (date instanceof Date) {
    return date
  }
  
  // Si es un string, intentar parsearlo
  if (typeof date === 'string') {
    const parsed = new Date(date)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  }
  
  // Fallback
  return new Date()
}

// Función helper para formatear fechas de forma segura
const formatDateSafely = (date: any, formatString: string): string => {
  try {
    const convertedDate = convertFirestoreDate(date)
    return format(convertedDate, formatString, { locale: es })
  } catch (error) {
    console.warn("Error formateando fecha:", error)
    return "Fecha inválida"
  }
}

// Componente del formulario de campaña (para crear y editar)
function CampaignForm({ 
  onClose, 
  onSuccess, 
  campaign = null 
}: { 
  onClose: () => void; 
  onSuccess: () => void;
  campaign?: NewsletterCampaign | null;
}) {
  const isEditing = !!campaign
  
  const [formData, setFormData] = useState({
    titulo: campaign?.titulo || "Nueva Campaña",
    contenido: campaign?.contenido || "<h2>¡Hola!</h2>\n\n<p>Este es el contenido de tu nueva campaña.</p>\n\n<p>Saludos,<br>Equipo de Paula Pastas</p>",
    asunto: campaign?.asunto || "Nueva Campaña de Paula Pastas",
    destinatarios: campaign?.destinatarios || "todos" as "todos" | "activos" | "nuevos",
    estado: campaign?.estado || "borrador" as "borrador" | "programada" | "enviada" | "cancelada",
    fechaProgramada: campaign?.fechaProgramada ? format(convertFirestoreDate(campaign.fechaProgramada), "yyyy-MM-dd'T'HH:mm") : ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validación adicional
    if (!formData.titulo.trim()) {
      setError("El título de la campaña es requerido")
      setIsLoading(false)
      return
    }

    if (!formData.asunto.trim()) {
      setError("El asunto del email es requerido")
      setIsLoading(false)
      return
    }

    if (!formData.contenido.trim()) {
      setError("El contenido del email es requerido")
      setIsLoading(false)
      return
    }

    // Validar fecha programada si el estado es "programada"
    if (formData.estado === "programada" && (!formData.fechaProgramada || formData.fechaProgramada.trim() === "")) {
      setError("La fecha de envío es requerida para campañas programadas")
      setIsLoading(false)
      return
    }

    try {
      // Preparar los datos de la campaña
      const campaignData: any = {
        titulo: formData.titulo.trim(),
        contenido: formData.contenido.trim(),
        asunto: formData.asunto.trim(),
        destinatarios: formData.destinatarios,
        estado: formData.estado,
        fechaActualizacion: new Date()
      }

      // Solo agregar fechaProgramada si está definida y no está vacía
      if (formData.fechaProgramada && formData.fechaProgramada.trim() !== "") {
        campaignData.fechaProgramada = new Date(formData.fechaProgramada)
      }

      if (isEditing) {
        // Actualizar campaña existente
        await FirebaseService.updateNewsletterCampaign(campaign!.id!, campaignData)
      } else {
        // Crear nueva campaña
        campaignData.fechaCreacion = new Date()
        campaignData.estadisticas = {
          enviados: 0,
          abiertos: 0,
          clicks: 0
        }
        await FirebaseService.createNewsletterCampaign(campaignData)
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("❌ Error al guardar campaña:", error)
      setError(error.message || "Error al guardar la campaña")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">
            {isEditing ? 'Editar Campaña' : 'Nueva Campaña de Newsletter'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título de la campaña *
            </label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: Ofertas de Verano"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asunto del email *
            </label>
            <input
              type="text"
              required
              value={formData.asunto}
              onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: 🔥 Ofertas Especiales de Verano"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destinatarios
            </label>
            <select
              value={formData.destinatarios}
              onChange={(e) => setFormData({ ...formData, destinatarios: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="todos">Todos los suscriptores</option>
              <option value="activos">Solo activos</option>
              <option value="nuevos">Solo nuevos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="borrador">Borrador</option>
              <option value="programada">Programada</option>
              <option value="enviada">Enviada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {formData.estado === "programada" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de envío programada
              </label>
              <input
                type="datetime-local"
                value={formData.fechaProgramada}
                onChange={(e) => setFormData({ ...formData, fechaProgramada: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenido del email *
            </label>
            <textarea
              required
              rows={8}
              value={formData.contenido}
              onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Escribe el contenido HTML del email..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Puedes usar HTML básico para formatear el contenido
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar Cambios" : "Crear Campaña")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewsletterAdminPage() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([])
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"todos" | "activo" | "inactivo" | "dado-de-baja">("todos")
  const [selectedSuscripciones, setSelectedSuscripciones] = useState<Set<string>>(new Set())
  const [showCampaignForm, setShowCampaignForm] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<NewsletterCampaign | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [suscripcionesData, campaignsData] = await Promise.all([
        FirebaseService.getAllSuscripciones(),
        FirebaseService.getAllNewsletterCampaigns()
      ])
      setSuscripciones(suscripcionesData)
      setCampaigns(campaignsData)
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSuscripciones = suscripciones.filter(suscripcion => {
    const matchesSearch = suscripcion.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "todos" || suscripcion.estado === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleStatusChange = async (id: string, newStatus: "activo" | "inactivo" | "dado-de-baja") => {
    try {
      await FirebaseService.updateSuscripcionEstado(id, newStatus)
      await loadData() // Recargar datos
    } catch (error) {
      console.error("Error actualizando estado:", error)
    }
  }

  const handleDeleteSuscripcion = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta suscripción?")) {
      try {
        await FirebaseService.deleteSuscripcion(id)
        await loadData() // Recargar datos
      } catch (error) {
        console.error("Error eliminando suscripción:", error)
      }
    }
  }

  // Función para enviar campañas de newsletter
  const handleSendCampaign = async (campaign: NewsletterCampaign) => {
    if (!emailService.isConfigured()) {
      alert("⚠️ El servicio de email no está configurado. Configura NEXT_PUBLIC_BREVO_API_KEY en .env.local")
      return
    }

    if (!confirm(`¿Estás seguro de que quieres enviar la campaña "${campaign.titulo}" a todos los suscriptores?`)) {
      return
    }

    try {
      // Obtener emails de suscriptores activos
      const suscriptoresActivos = suscripciones
        .filter(s => s.estado === "activo")
        .map(s => s.email)

      if (suscriptoresActivos.length === 0) {
        alert("No hay suscriptores activos para enviar la campaña")
        return
      }

      console.log(`📬 Iniciando envío de campaña "${campaign.titulo}" a ${suscriptoresActivos.length} suscriptores`)

      // Mostrar indicador de progreso
      const progressElement = document.getElementById('send-progress')
      if (progressElement) {
        progressElement.style.display = 'block'
        progressElement.innerHTML = `<div class="text-center p-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p>Enviando campaña a ${suscriptoresActivos.length} suscriptores...</p>
        </div>`
      }

      // Enviar la campaña
      const result = await emailService.sendNewsletterCampaign(campaign, suscriptoresActivos)

      // Ocultar indicador de progreso
      if (progressElement) {
        progressElement.style.display = 'none'
      }

      // Mostrar resultado
      if (result.success) {
        alert(`✅ Campaña enviada exitosamente a ${result.sent} suscriptores`)
        
        // Actualizar estado de la campaña a "enviada"
        await FirebaseService.updateNewsletterCampaign(campaign.id!, {
          ...campaign,
          estado: "enviada",
          fechaEnvio: new Date(),
          estadisticas: {
            enviados: result.sent,
            entregados: result.sent,
            abiertos: 0,
            clicks: 0,
            rebotes: 0
          }
        })
        
        // Recargar datos
        await loadData()
      } else {
        alert(`⚠️ Campaña enviada con errores:\n${result.sent} enviados, ${result.failed} fallidos\n\nErrores: ${result.errors.slice(0, 3).join('\n')}`)
      }

    } catch (error: any) {
      console.error("❌ Error enviando campaña:", error)
      alert(`Error enviando campaña: ${error.message}`)
      
      // Ocultar indicador de progreso
      const progressElement = document.getElementById('send-progress')
      if (progressElement) {
        progressElement.style.display = 'none'
      }
    }
  }

  // Función para eliminar campaña
  const handleDeleteCampaign = async (campaign: NewsletterCampaign) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la campaña "${campaign.titulo}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      await FirebaseService.deleteNewsletterCampaign(campaign.id!)
      await loadData() // Recargar datos
      alert("✅ Campaña eliminada exitosamente")
    } catch (error: any) {
      console.error("❌ Error eliminando campaña:", error)
      alert(`Error eliminando campaña: ${error.message}`)
    }
  }

  const handleSelectAll = () => {
    if (selectedSuscripciones.size === filteredSuscripciones.length) {
      setSelectedSuscripciones(new Set())
    } else {
      setSelectedSuscripciones(new Set(filteredSuscripciones.map(s => s.id!)))
    }
  }

  const exportToCSV = () => {
    const headers = ["Email", "Estado", "Fecha Suscripción", "Origen", "Fecha Baja"]
    const csvContent = [
      headers.join(","),
      ...filteredSuscripciones.map(s => [
        s.email,
        s.estado,
        formatDateSafely(s.fechaSuscripcion, "dd/MM/yyyy"),
        s.origen,
        s.fechaBaja ? formatDateSafely(s.fechaBaja, "dd/MM/yyyy") : ""
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `suscripciones_${format(new Date(), "dd-MM-yyyy")}.csv`
    link.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo":
        return "text-green-600 bg-green-100"
      case "inactivo":
        return "text-yellow-600 bg-yellow-100"
      case "dado-de-baja":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "activo":
        return <CheckCircle className="w-4 h-4" />
      case "inactivo":
        return <AlertCircle className="w-4 h-4" />
      case "dado-de-baja":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navegación Administrativa */}
        <AdminNavigation />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Newsletter
          </h1>
          <p className="text-gray-600">
            Administra suscripciones y campañas de email marketing
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Suscriptores</p>
                <p className="text-2xl font-bold text-gray-900">{suscripciones.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {suscripciones.filter(s => s.estado === "activo").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {suscripciones.filter(s => s.estado === "inactivo").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Send className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Campañas</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                  <option value="dado-de-baja">Dados de baja</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
                <button
                  onClick={() => {
                    setSelectedCampaign(null)
                    setShowCampaignForm(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Campaña
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedSuscripciones.size === filteredSuscripciones.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Suscripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuscripciones.map((suscripcion) => (
                  <tr key={suscripcion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedSuscripciones.has(suscripcion.id!)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedSuscripciones)
                          if (e.target.checked) {
                            newSelected.add(suscripcion.id!)
                          } else {
                            newSelected.delete(suscripcion.id!)
                          }
                          setSelectedSuscripciones(newSelected)
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {suscripcion.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(suscripcion.estado)}`}>
                        {getStatusIcon(suscripcion.estado)}
                        <span className="ml-1 capitalize">{suscripcion.estado}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateSafely(suscripcion.fechaSuscripcion, "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {suscripcion.origen}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <select
                          value={suscripcion.estado}
                          onChange={(e) => handleStatusChange(suscripcion.id!, e.target.value as any)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="activo">Activo</option>
                          <option value="inactivo">Inactivo</option>
                          <option value="dado-de-baja">Dado de baja</option>
                        </select>
                        <button
                          onClick={() => handleDeleteSuscripcion(suscripcion.id!)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
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

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{filteredSuscripciones.length}</span> de{" "}
                <span className="font-medium">{suscripciones.length}</span> suscriptores
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Campañas */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Campañas de Newsletter</h2>
            <p className="text-gray-600 mb-4">Gestiona y envía tus campañas de email marketing</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asunto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destinatarios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.titulo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {campaign.asunto}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.estado === 'enviada' ? 'text-green-600 bg-green-100' :
                        campaign.estado === 'programada' ? 'text-blue-600 bg-blue-100' :
                        campaign.estado === 'borrador' ? 'text-gray-600 bg-gray-100' :
                        'text-red-600 bg-red-100'
                      }`}>
                        {campaign.estado === 'enviada' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {campaign.estado === 'programada' && <Clock className="w-3 h-3 mr-1" />}
                        {campaign.estado === 'borrador' && <Edit className="w-3 h-3 mr-1" />}
                        {campaign.estado === 'cancelada' && <XCircle className="w-3 h-3 mr-1" />}
                        <span className="capitalize">{campaign.estado}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {campaign.destinatarios}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateSafely(campaign.fechaCreacion, "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {campaign.estado === 'borrador' && (
                          <button
                            onClick={() => {
                              setSelectedCampaign(campaign)
                              setShowCampaignForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            title="Editar campaña"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                        )}
                        {campaign.estado === 'borrador' && (
                          <button
                            onClick={() => handleSendCampaign(campaign)}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            title="Enviar campaña"
                          >
                            <Send className="w-4 h-4" />
                            Enviar
                          </button>
                        )}
                        {campaign.estado === 'enviada' && campaign.estadisticas && (
                          <span className="text-xs text-gray-500">
                            {campaign.estadisticas.enviados} enviados
                          </span>
                        )}
                        {campaign.estado !== 'enviada' && (
                          <button
                            onClick={() => {
                              setSelectedCampaign(campaign)
                              setShowCampaignForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCampaign(campaign)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
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
          
          {campaigns.length === 0 && (
            <div className="text-center py-8">
              <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay campañas creadas</p>
              <p className="text-sm text-gray-400">Crea tu primera campaña usando el botón "Nueva Campaña"</p>
            </div>
          )}
        </div>

        {/* Modal del formulario de campaña */}
        {showCampaignForm && (
          <CampaignForm
            onClose={() => {
              setShowCampaignForm(false)
              setSelectedCampaign(null)
            }}
            onSuccess={() => {
              loadData() // Recargar datos
              setShowCampaignForm(false)
              setSelectedCampaign(null)
            }}
            campaign={selectedCampaign}
          />
        )}

        {/* Indicador de progreso para envío */}
        <div id="send-progress" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ display: 'none' }}>
          <div className="bg-white rounded-lg p-6 max-w-md">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p>Enviando campaña...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
