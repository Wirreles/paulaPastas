"use client"

/**
 * Panel de Administración - Gestión de Pedidos
 * 
 * Funcionalidades:
 * - Visualización de todos los pedidos
 * - Actualización de estados de pedidos
 * - Contacto directo con clientes vía WhatsApp
 * - Mensajes dinámicos según el estado del pedido:
 *   * En preparación: Informa sobre la elaboración
 *   * Listo para entrega: Confirma que está listo
 *   * En camino: Notifica que está siendo entregado
 *   * Entregado: Solicita feedback y nuevos pedidos
 *   * Cancelado: Ofrece asistencia post-cancelación
 */

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ProtectedRoute from "@/components/ProtectedRoute"
import { FirebaseService } from "@/lib/firebase-service"
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Eye,
  Edit,
  Search,
  Filter,
  MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminNavigation from "@/components/admin/AdminNavigation"

interface Purchase {
  id: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  buyerAddress: string
  products: Array<{
    name: string
    quantity: number
    price: number
    imageUrl?: string
  }>
  totalAmount: number
  orderStatus: 'en_preparacion' | 'listo_para_entrega' | 'en_camino' | 'entregado' | 'cancelado'
  createdAt: Date
  deliveryOption: 'delivery' | 'pickup'
  deliverySlot?: string
  comments?: string
  paymentId?: string
  isUserLoggedIn: boolean
}

export default function OrdersPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login")
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (isAdmin) {
      loadPurchases()
    }
  }, [isAdmin])

  const loadPurchases = async () => {
    try {
      setLoadingPurchases(true)
      const data = await FirebaseService.getAllPurchases()
      setPurchases(data)
    } catch (error) {
      console.error("Error loading purchases:", error)
    } finally {
      setLoadingPurchases(false)
    }
  }

  const handleStatusUpdate = async (purchaseId: string, newStatus: string) => {
    try {
      await FirebaseService.updatePurchaseStatus(purchaseId, newStatus)
      await loadPurchases() // Recargar la lista
    } catch (error) {
      console.error("Error updating purchase status:", error)
    }
  }

  const handleWhatsAppContact = (phoneNumber: string, customerName: string, orderId: string, orderStatus: string) => {
    // Limpiar el número de teléfono (remover espacios, guiones, etc.)
    const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[-()]/g, '')
    
    // Agregar código de país si no lo tiene (asumiendo Argentina +54)
    let formattedPhone = cleanPhone
    if (!cleanPhone.startsWith('54')) {
      formattedPhone = `54${cleanPhone}`
    }
    
    // Generar mensaje dinámico según el estado del pedido
    const message = generateWhatsAppMessage(customerName, orderId, orderStatus)
    
    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank')
  }

  // Función para generar mensajes dinámicos según el estado del pedido
  const generateWhatsAppMessage = (customerName: string, orderId: string, orderStatus: string) => {
    const orderNumber = orderId.slice(-8)
    
    switch (orderStatus) {
      case 'en_preparacion':
        return `Hola ${customerName}! 👋 Te contactamos desde Paula Pastas sobre tu pedido #${orderNumber}. 🍝

Tu pedido está siendo preparado con mucho amor y los ingredientes más frescos. Te avisaremos cuando esté listo para la entrega.

¿Tenés alguna consulta o querés hacer algún cambio?`

      case 'listo_para_entrega':
        return `Hola ${customerName}! 🎉 Tu pedido #${orderNumber} está listo para la entrega. 🚚

Nuestro equipo de delivery saldrá en breve hacia tu dirección. Te enviaremos una notificación cuando esté en camino.

¡Gracias por elegir Paula Pastas! 😊`

      case 'en_camino':
        return `Hola ${customerName}! 🚚 Tu pedido #${orderNumber} está en camino hacia tu casa. 

Nuestro delivery debería llegar en los próximos minutos. ¡Prepará el plato para disfrutar de nuestras pastas frescas! 🍝

¿Necesitás que te contactemos por algo más?`

      case 'entregado':
        return `Hola ${customerName}! ✅ Tu pedido #${orderNumber} ya fue entregado exitosamente.

¡Esperamos que estés disfrutando de nuestras pastas artesanales! 🍝

¿Cómo te gustó? ¿Tenés alguna sugerencia o querés hacer otro pedido?`

      case 'cancelado':
        return `Hola ${customerName}! 😔 Te contactamos sobre tu pedido #${orderNumber} que fue cancelado.

Si tenés alguna consulta sobre la cancelación o querés hacer un nuevo pedido, estamos acá para ayudarte.

¿En qué podemos asistirte?`

      default:
        return `Hola ${customerName}! 👋 Te contactamos desde Paula Pastas sobre tu pedido #${orderNumber}. 

¿Tenés alguna consulta o necesitás ayuda con tu pedido? Estamos acá para asistirte. 😊`
    }
  }

  // Función para obtener un resumen del mensaje que se enviará
  const getMessagePreview = (orderStatus: string) => {
    switch (orderStatus) {
      case 'en_preparacion':
        return 'Mensaje: Pedido en preparación'
      case 'listo_para_entrega':
        return 'Mensaje: Listo para entrega'
      case 'en_camino':
        return 'Mensaje: En camino'
      case 'entregado':
        return 'Mensaje: Pedido entregado'
      case 'cancelado':
        return 'Mensaje: Pedido cancelado'
      default:
        return 'Mensaje: Consulta general'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_preparacion':
        return 'En preparación'
      case 'listo_para_entrega':
        return 'Listo para entrega'
      case 'en_camino':
        return 'En camino'
      case 'entregado':
        return 'Entregado'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_preparacion':
        return 'bg-yellow-100 text-yellow-800'
      case 'listo_para_entrega':
        return 'bg-blue-100 text-blue-800'
      case 'en_camino':
        return 'bg-purple-100 text-purple-800'
      case 'entregado':
        return 'bg-green-100 text-green-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en_preparacion':
        return <Clock className="w-4 h-4" />
      case 'listo_para_entrega':
        return <Package className="w-4 h-4" />
      case 'en_camino':
        return <Truck className="w-4 h-4" />
      case 'entregado':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelado':
        return <XCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const formatDate = (date: Date | string | any) => {
    let dateObj: Date
    
    try {
      // Si es un objeto Firestore Timestamp
      if (date && typeof date === 'object' && date.toDate) {
        dateObj = date.toDate()
      }
      // Si es un string
      else if (typeof date === 'string') {
        dateObj = new Date(date)
      }
      // Si ya es un objeto Date
      else if (date instanceof Date) {
        dateObj = date
      }
      // Si es un timestamp numérico
      else if (typeof date === 'number') {
        dateObj = new Date(date)
      }
      // Si es null, undefined o inválido
      else {
        return 'Fecha no disponible'
      }

      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) {
        return 'Fecha no disponible'
      }

      return dateObj.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formateando fecha:', error, date)
      return 'Fecha no disponible'
    }
  }

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "todos" || purchase.orderStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: purchases.length,
    enPreparacion: purchases.filter(p => p.orderStatus === 'en_preparacion').length,
    listoParaEntrega: purchases.filter(p => p.orderStatus === 'listo_para_entrega').length,
    enCamino: purchases.filter(p => p.orderStatus === 'en_camino').length,
    entregado: purchases.filter(p => p.orderStatus === 'entregado').length,
    cancelado: purchases.filter(p => p.orderStatus === 'cancelado').length,
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true} redirectTo="/login">
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminNavigation />

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                <Package className="h-4 w-4 text-primary-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Preparación</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.enPreparacion}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Listo para Entrega</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.listoParaEntrega}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Camino</CardTitle>
                <Truck className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.enCamino}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entregados</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.entregado}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cancelado}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="en_preparacion">En preparación</SelectItem>
                <SelectItem value="listo_para_entrega">Listo para entrega</SelectItem>
                <SelectItem value="en_camino">En camino</SelectItem>
                <SelectItem value="entregado">Entregado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {loadingPurchases ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-neutral-600">Cargando pedidos...</p>
              </div>
            ) : filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Pedido #{purchase.id.slice(-8)}</CardTitle>
                        <p className="text-sm text-neutral-600">
                          {purchase.buyerName} • {purchase.buyerEmail} • {formatDate(purchase.createdAt)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(purchase.orderStatus)}>
                        {getStatusIcon(purchase.orderStatus)}
                        <span className="ml-1">{getStatusText(purchase.orderStatus)}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Productos</h4>
                        <div className="space-y-1">
                          {purchase.products.map((product, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{product.name} x{product.quantity}</span>
                              <span>${product.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span>${purchase.totalAmount?.toLocaleString() || '0'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Detalles de Entrega</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Dirección:</span> {purchase.buyerAddress}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Teléfono:</span> 
                            <span>{purchase.buyerPhone}</span>
                            <div className="ml-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                onClick={() => handleWhatsAppContact(purchase.buyerPhone, purchase.buyerName, purchase.id, purchase.orderStatus)}
                                title={`Contactar por WhatsApp - ${getStatusText(purchase.orderStatus)}`}
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                WhatsApp
                              </Button>
                              <p className="text-xs text-green-600 mt-1 text-center">
                                {getMessagePreview(purchase.orderStatus)}
                              </p>
                            </div>
                          </div>
                          <p><span className="font-medium">Opción:</span> {purchase.deliveryOption === 'delivery' ? 'Entrega a domicilio' : 'Retiro por local'}</p>
                          {purchase.deliverySlot && (
                            <p><span className="font-medium">Horario:</span> {purchase.deliverySlot}</p>
                          )}
                          {purchase.comments && (
                            <p><span className="font-medium">Comentarios:</span> {purchase.comments}</p>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Actualizar Estado</h4>
                          <div className="flex flex-wrap gap-2">
                            {['en_preparacion', 'listo_para_entrega', 'en_camino', 'entregado', 'cancelado'].map((status) => (
                              <Button
                                key={status}
                                variant={purchase.orderStatus === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleStatusUpdate(purchase.id, status)}
                                disabled={purchase.orderStatus === status}
                              >
                                {getStatusIcon(status)}
                                <span className="ml-1">{getStatusText(status)}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No se encontraron pedidos</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 