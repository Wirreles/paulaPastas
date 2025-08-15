"use client"

import { useState, useEffect } from "react"
import { 
  Ticket, 
  Plus, 
  Search, 
  Download,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  RefreshCw,
  X
} from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import AdminNavigation from "@/components/admin/AdminNavigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Función helper para convertir fechas de Firestore
const convertFirestoreDate = (date: any): Date => {
  if (!date) return new Date()
  
  if (date && typeof date === 'object' && date.seconds) {
    return new Date(date.seconds * 1000)
  }
  
  if (typeof date === 'number') {
    return new Date(date)
  }
  
  if (date instanceof Date) {
    return date
  }
  
  if (typeof date === 'string') {
    const parsed = new Date(date)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  }
  
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

// Función para generar código aleatorio de cupón
const generateCouponCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Componente del formulario de cupón
function CouponForm({ 
  onClose, 
  onSuccess, 
  coupon = null 
}: { 
  onClose: () => void; 
  onSuccess: () => void;
  coupon?: any | null;
}) {
  const isEditing = !!coupon
  
  const [formData, setFormData] = useState({
    codigo: coupon?.codigo || generateCouponCode(),
    descripcion: coupon?.descripcion || "",
    descuento: coupon?.descuento || 10,
    tipoDescuento: coupon?.tipoDescuento || "porcentaje" as "porcentaje" | "monto",
    montoMinimo: coupon?.montoMinimo || 0,
    fechaInicio: coupon?.fechaInicio ? format(convertFirestoreDate(coupon.fechaInicio), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    fechaFin: coupon?.fechaFin ? format(convertFirestoreDate(coupon.fechaFin), "yyyy-MM-dd") : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    maxUsos: coupon?.maxUsos || 100,
    usado: coupon?.usado || false,
    activo: coupon?.activo !== undefined ? coupon.activo : true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validaciones
    if (!formData.codigo.trim()) {
      setError("El código del cupón es requerido")
      setIsLoading(false)
      return
    }

    if (!formData.descripcion.trim()) {
      setError("La descripción del cupón es requerida")
      setIsLoading(false)
      return
    }

    if (formData.descuento <= 0) {
      setError("El descuento debe ser mayor a 0")
      setIsLoading(false)
      return
    }

    if (formData.tipoDescuento === "porcentaje" && formData.descuento > 100) {
      setError("El descuento porcentual no puede ser mayor al 100%")
      setIsLoading(false)
      return
    }

    if (formData.maxUsos <= 0) {
      setError("El máximo de usos debe ser mayor a 0")
      setIsLoading(false)
      return
    }

    try {
      const couponData: any = {
        codigo: formData.codigo.trim().toUpperCase(),
        descripcion: formData.descripcion.trim(),
        descuento: formData.descuento,
        tipoDescuento: formData.tipoDescuento,
        montoMinimo: formData.montoMinimo,
        fechaInicio: new Date(formData.fechaInicio),
        fechaFin: new Date(formData.fechaFin),
        maxUsos: formData.maxUsos,
        usado: formData.usado,
        activo: formData.activo,
        fechaActualizacion: new Date()
      }

      if (isEditing) {
        // Actualizar cupón existente
        await FirebaseService.updateCoupon(coupon!.id!, couponData)
      } else {
        // Crear nuevo cupón
        couponData.fechaCreacion = new Date()
        couponData.usosActuales = 0
        await FirebaseService.createCoupon(couponData)
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("❌ Error al guardar cupón:", error)
      setError(error.message || "Error al guardar el cupón")
    } finally {
      setIsLoading(false)
    }
  }

  const regenerateCode = () => {
    setFormData(prev => ({ ...prev, codigo: generateCouponCode() }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">
            {isEditing ? 'Editar Cupón' : 'Nuevo Cupón de Descuento'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código del cupón *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: SUMMER2024"
                />
                <button
                  type="button"
                  onClick={regenerateCode}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  title="Generar nuevo código"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <input
                type="text"
                required
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Descuento de verano"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de descuento
              </label>
              <select
                value={formData.tipoDescuento}
                onChange={(e) => setFormData({ ...formData, tipoDescuento: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="monto">Monto fijo ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor del descuento *
              </label>
              <input
                type="number"
                required
                min="0"
                step={formData.tipoDescuento === "porcentaje" ? "1" : "0.01"}
                max={formData.tipoDescuento === "porcentaje" ? "100" : undefined}
                value={formData.descuento}
                onChange={(e) => setFormData({ ...formData, descuento: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={formData.tipoDescuento === "porcentaje" ? "15" : "50"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto mínimo ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.montoMinimo}
                onChange={(e) => setFormData({ ...formData, montoMinimo: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio *
              </label>
              <input
                type="date"
                required
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de fin *
              </label>
              <input
                type="date"
                required
                value={formData.fechaFin}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de usos *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxUsos}
                onChange={(e) => setFormData({ ...formData, maxUsos: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="100"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Cupón activo</span>
              </label>
            </div>
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
              {isLoading ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar Cambios" : "Crear Cupón")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CuponesAdminPage() {
  const [cupones, setCupones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"todos" | "activo" | "inactivo" | "usado">("todos")
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<any | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const cuponesData = await FirebaseService.getAllCoupons()
      setCupones(cuponesData)
    } catch (error) {
      console.error("Error cargando cupones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCupones = cupones.filter(cupon => {
    const matchesSearch = cupon.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cupon.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesFilter = true
    if (filterStatus === "activo") matchesFilter = cupon.activo && !cupon.usado
    else if (filterStatus === "inactivo") matchesFilter = !cupon.activo
    else if (filterStatus === "usado") matchesFilter = cupon.usado
    
    return matchesSearch && matchesFilter
  })

  const handleDeleteCoupon = async (cupon: any) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el cupón "${cupon.codigo}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      await FirebaseService.deleteCoupon(cupon.id!)
      await loadData()
      alert("✅ Cupón eliminado exitosamente")
    } catch (error: any) {
      console.error("❌ Error eliminando cupón:", error)
      alert(`Error eliminando cupón: ${error.message}`)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Código copiado al portapapeles")
  }

  const exportToCSV = () => {
    const headers = ["Código", "Descripción", "Descuento", "Tipo", "Monto Mínimo", "Fecha Inicio", "Fecha Fin", "Max Usos", "Usos Actuales", "Estado", "Usado", "Fecha Creación"]
    const csvContent = [
      headers.join(","),
      ...filteredCupones.map(c => [
        c.codigo,
        c.descripcion,
        c.descuento,
        c.tipoDescuento,
        c.montoMinimo,
        formatDateSafely(c.fechaInicio, "dd/MM/yyyy"),
        formatDateSafely(c.fechaFin, "dd/MM/yyyy"),
        c.maxUsos,
        c.usosActuales || 0,
        c.activo ? "Activo" : "Inactivo",
        c.usado ? "Sí" : "No",
        formatDateSafely(c.fechaCreacion, "dd/MM/yyyy")
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `cupones_${format(new Date(), "dd-MM-yyyy")}.csv`
    link.click()
  }

  const getStatusColor = (cupon: any) => {
    if (cupon.usado) return "text-red-600 bg-red-100"
    if (!cupon.activo) return "text-gray-600 bg-gray-100"
    
    const now = new Date()
    const fechaInicio = convertFirestoreDate(cupon.fechaInicio)
    const fechaFin = convertFirestoreDate(cupon.fechaFin)
    
    if (now < fechaInicio) return "text-blue-600 bg-blue-100"
    if (now > fechaFin) return "text-red-600 bg-red-100"
    
    return "text-green-600 bg-green-100"
  }

  const getStatusText = (cupon: any) => {
    if (cupon.usado) return "Usado"
    if (!cupon.activo) return "Inactivo"
    
    const now = new Date()
    const fechaInicio = convertFirestoreDate(cupon.fechaInicio)
    const fechaFin = convertFirestoreDate(cupon.fechaFin)
    
    if (now < fechaInicio) return "Pendiente"
    if (now > fechaFin) return "Expirado"
    
    return "Activo"
  }

  const getStatusIcon = (cupon: any) => {
    if (cupon.usado) return <XCircle className="w-4 h-4" />
    if (!cupon.activo) return <XCircle className="w-4 h-4" />
    
    const now = new Date()
    const fechaInicio = convertFirestoreDate(cupon.fechaInicio)
    const fechaFin = convertFirestoreDate(cupon.fechaFin)
    
    if (now < fechaInicio) return <Clock className="w-4 h-4" />
    if (now > fechaFin) return <XCircle className="w-4 h-4" />
    
    return <CheckCircle className="w-4 h-4" />
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
            Gestión de Cupones
          </h1>
          <p className="text-gray-600">
            Administra cupones de descuento para tus clientes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cupones</p>
                <p className="text-2xl font-bold text-gray-900">{cupones.length}</p>
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
                  {cupones.filter(c => c.activo && !c.usado && new Date() >= convertFirestoreDate(c.fechaInicio) && new Date() <= convertFirestoreDate(c.fechaFin)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cupones.filter(c => c.activo && new Date() < convertFirestoreDate(c.fechaInicio)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usados/Expirados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cupones.filter(c => c.usado || new Date() > convertFirestoreDate(c.fechaFin)).length}
                </p>
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
                    placeholder="Buscar por código o descripción..."
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
                  <option value="usado">Usados</option>
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
                    setSelectedCoupon(null)
                    setShowCouponForm(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Cupón
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
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descuento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validez
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCupones.map((cupon) => (
                  <tr key={cupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-mono font-bold text-gray-900">
                          {cupon.codigo}
                        </div>
                        <button
                          onClick={() => copyToClipboard(cupon.codigo)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copiar código"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {cupon.descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {cupon.tipoDescuento === "porcentaje" ? `${cupon.descuento}%` : `$${cupon.descuento}`}
                      </div>
                      {cupon.montoMinimo > 0 && (
                        <div className="text-xs text-gray-500">
                          Min: ${cupon.montoMinimo}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>Desde: {formatDateSafely(cupon.fechaInicio, "dd/MM/yyyy")}</div>
                        <div>Hasta: {formatDateSafely(cupon.fechaFin, "dd/MM/yyyy")}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{cupon.usosActuales || 0} / {cupon.maxUsos}</div>
                        <div className="text-xs text-gray-500">
                          {cupon.usado ? "Usado" : "Disponible"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cupon)}`}>
                        {getStatusIcon(cupon)}
                        <span className="ml-1">{getStatusText(cupon)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedCoupon(cupon)
                            setShowCouponForm(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(cupon)}
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
                Mostrando <span className="font-medium">{filteredCupones.length}</span> de{" "}
                <span className="font-medium">{cupones.length}</span> cupones
              </div>
            </div>
          </div>
        </div>

        {cupones.length === 0 && (
          <div className="text-center py-8">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay cupones creados</p>
            <p className="text-sm text-gray-400">Crea tu primer cupón usando el botón "Nuevo Cupón"</p>
          </div>
        )}

        {/* Modal del formulario de cupón */}
        {showCouponForm && (
          <CouponForm
            onClose={() => {
              setShowCouponForm(false)
              setSelectedCoupon(null)
            }}
            onSuccess={() => {
              loadData()
              setShowCouponForm(false)
              setSelectedCoupon(null)
            }}
            coupon={selectedCoupon}
          />
        )}
      </div>
    </div>
  )
}
