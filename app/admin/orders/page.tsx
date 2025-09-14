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
  MessageCircle,
  CreditCard,
  Banknote,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  ShoppingBag,
  AlertCircle
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
  status?: 'approved' | 'pending' | 'rejected' | 'cancelled' // Estado del pago
  createdAt: Date
  deliveryOption: 'delivery' | 'pickup'
  deliverySlot?: string
  comments?: string
  paymentId?: string
  paymentMethod?: 'mercadopago' | 'efectivo-local'
  isUserLoggedIn: boolean
  couponApplied?: any
  discountAmount?: number
  originalAmount?: number
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

  const getPaymentMethodInfo = (paymentMethod?: string) => {
    switch (paymentMethod) {
      case 'mercadopago':
        return {
          text: 'MercadoPago',
          icon: <CreditCard className="w-4 h-4" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          bgColor: 'bg-blue-50'
        }
      case 'efectivo-local':
        return {
          text: 'Efectivo en Local',
          icon: <Banknote className="w-4 h-4" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          bgColor: 'bg-green-50'
        }
      default:
        return {
          text: 'No especificado',
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          bgColor: 'bg-gray-50'
        }
    }
  }

  const getDeliveryMethodInfo = (deliveryOption: string) => {
    switch (deliveryOption) {
      case 'delivery':
        return {
          text: 'Envío a Domicilio',
          icon: <Truck className="w-4 h-4" />,
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          bgColor: 'bg-purple-50'
        }
      case 'pickup':
        return {
          text: 'Retiro por Local',
          icon: <MapPin className="w-4 h-4" />,
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          bgColor: 'bg-orange-50'
        }
      default:
        return {
          text: 'No especificado',
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          bgColor: 'bg-gray-50'
        }
    }
  }

  const getPaymentStatusInfo = (status?: string, paymentMethod?: string) => {
    // Solo mostrar estados basados en el status real del pago
    if (!status) {
      return {
        text: 'Estado Desconocido',
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        bgColor: 'bg-gray-50'
      }
    }

    switch (status) {
      case 'approved':
        return {
          text: 'Pago Aprobado',
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          bgColor: 'bg-green-50'
        }
      case 'pending':
        return {
          text: 'Pago Pendiente',
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          bgColor: 'bg-yellow-50'
        }
      case 'rejected':
        return {
          text: 'Pago Rechazado',
          icon: <XCircle className="w-4 h-4" />,
          color: 'bg-red-100 text-red-800 border-red-200',
          bgColor: 'bg-red-50'
        }
      case 'cancelled':
        return {
          text: 'Pago Cancelado',
          icon: <XCircle className="w-4 h-4" />,
          color: 'bg-red-100 text-red-800 border-red-200',
          bgColor: 'bg-red-50'
        }
      default:
        return {
          text: 'Estado Desconocido',
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          bgColor: 'bg-gray-50'
        }
    }
  }

  const getUserTypeInfo = (isUserLoggedIn: boolean) => {
    return {
      text: isUserLoggedIn ? 'Usuario Registrado' : 'Usuario Invitado',
      icon: <User className="w-4 h-4" />,
      color: isUserLoggedIn ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-gray-100 text-gray-800 border-gray-200',
      bgColor: isUserLoggedIn ? 'bg-indigo-50' : 'bg-gray-50'
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
    mercadopago: purchases.filter(p => p.paymentMethod === 'mercadopago').length,
    efectivoLocal: purchases.filter(p => p.paymentMethod === 'efectivo-local').length,
    delivery: purchases.filter(p => p.deliveryOption === 'delivery').length,
    pickup: purchases.filter(p => p.deliveryOption === 'pickup').length,
    usuariosRegistrados: purchases.filter(p => p.isUserLoggedIn).length,
    usuariosInvitados: purchases.filter(p => !p.isUserLoggedIn).length,
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Estadísticas de Estados */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total Pedidos</CardTitle>
                <Package className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800">{stats.total}</div>
                <p className="text-xs text-blue-600 mt-1">Todos los pedidos</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-800">En Preparación</CardTitle>
                <Clock className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-800">{stats.enPreparacion}</div>
                <p className="text-xs text-yellow-600 mt-1">Preparando pedidos</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Entregados</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">{stats.entregado}</div>
                <p className="text-xs text-green-600 mt-1">Pedidos completados</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Cancelados</CardTitle>
                <XCircle className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-800">{stats.cancelado}</div>
                <p className="text-xs text-red-600 mt-1">Pedidos cancelados</p>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas de Métodos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">MercadoPago</CardTitle>
                <CreditCard className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800">{stats.mercadopago}</div>
                <p className="text-xs text-blue-600 mt-1">Pagos digitales</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Efectivo Local</CardTitle>
                <Banknote className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">{stats.efectivoLocal}</div>
                <p className="text-xs text-green-600 mt-1">Pagos en efectivo</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Envío a Domicilio</CardTitle>
                <Truck className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-800">{stats.delivery}</div>
                <p className="text-xs text-purple-600 mt-1">Entregas a domicilio</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Retiro por Local</CardTitle>
                <MapPin className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-800">{stats.pickup}</div>
                <p className="text-xs text-orange-600 mt-1">Retiros en local</p>
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
          <div className="space-y-6">
            {loadingPurchases ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-neutral-600 text-lg">Cargando pedidos...</p>
              </div>
            ) : filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase) => {
                const paymentInfo = getPaymentMethodInfo(purchase.paymentMethod)
                const deliveryInfo = getDeliveryMethodInfo(purchase.deliveryOption)
                const userInfo = getUserTypeInfo(purchase.isUserLoggedIn)
                const paymentStatusInfo = getPaymentStatusInfo(purchase.status, purchase.paymentMethod)
                
                return (
                  <Card key={purchase.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    {/* Header con información principal */}
                    <CardHeader className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary-100 p-3 rounded-full">
                            <ShoppingBag className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-neutral-800">
                              Pedido #{purchase.id.slice(-8)}
                            </CardTitle>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1 text-sm text-neutral-600">
                                <User className="w-4 h-4" />
                                <span className="font-medium">{purchase.buyerName}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm text-neutral-600">
                                <Mail className="w-4 h-4" />
                                <span>{purchase.buyerEmail}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm text-neutral-600">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(purchase.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(purchase.orderStatus)} px-4 py-2 text-sm font-semibold`}>
                          {getStatusIcon(purchase.orderStatus)}
                          <span className="ml-2">{getStatusText(purchase.orderStatus)}</span>
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Columna 1: Información del Cliente y Opciones */}
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg border p-4">
                            <h4 className="font-semibold text-lg mb-3 flex items-center">
                              <User className="w-5 h-5 mr-2 text-primary-600" />
                              Información del Cliente
                            </h4>
                            
                            {/* Badges de opciones seleccionadas */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-neutral-600">Tipo de Usuario:</span>
                                <Badge className={`${userInfo.color} px-3 py-1`}>
                                  {userInfo.icon}
                                  <span className="ml-1">{userInfo.text}</span>
                                </Badge>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-neutral-600">Método de Pago:</span>
                                <Badge className={`${paymentInfo.color} px-3 py-1`}>
                                  {paymentInfo.icon}
                                  <span className="ml-1">{paymentInfo.text}</span>
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-neutral-600">Estado del Pago:</span>
                                <Badge className={`${paymentStatusInfo.color} px-3 py-1`}>
                                  {paymentStatusInfo.icon}
                                  <span className="ml-1">{paymentStatusInfo.text}</span>
                                </Badge>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-neutral-600">Método de Entrega:</span>
                                <Badge className={`${deliveryInfo.color} px-3 py-1`}>
                                  {deliveryInfo.icon}
                                  <span className="ml-1">{deliveryInfo.text}</span>
                                </Badge>
                              </div>
                            </div>

                            {/* Información de contacto */}
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-neutral-500" />
                                  <span className="text-sm font-medium">{purchase.buyerPhone}</span>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleWhatsAppContact(purchase.buyerPhone, purchase.buyerName, purchase.id, purchase.orderStatus)}
                                >
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  WhatsApp
                                </Button>
                              </div>
                              <p className="text-xs text-green-600 mt-1">
                                {getMessagePreview(purchase.orderStatus)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Columna 2: Productos y Totales */}
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg border p-4">
                            <h4 className="font-semibold text-lg mb-3 flex items-center">
                              <Package className="w-5 h-5 mr-2 text-primary-600" />
                              Productos
                            </h4>
                            
                            <div className="space-y-2">
                              {purchase.products.map((product, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-b-0">
                                  <div className="flex-1">
                                    <span className="font-medium text-neutral-800">{product.name}</span>
                                    <span className="text-sm text-neutral-500 ml-2">x{product.quantity}</span>
                                  </div>
                                  <span className="font-semibold text-neutral-800">${product.price.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                            
                            {/* Totales */}
                            <div className="mt-4 pt-4 border-t space-y-2">
                              {purchase.originalAmount && purchase.originalAmount !== purchase.totalAmount && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-neutral-600">Subtotal:</span>
                                  <span className="line-through text-neutral-500">${purchase.originalAmount.toLocaleString()}</span>
                                </div>
                              )}
                              {purchase.discountAmount && purchase.discountAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-green-600">Descuento:</span>
                                  <span className="text-green-600">-${purchase.discountAmount.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-lg font-bold">
                                <span>Total:</span>
                                <span className="text-primary-600">${purchase.totalAmount?.toLocaleString() || '0'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Columna 3: Detalles de Entrega y Estados */}
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg border p-4">
                            <h4 className="font-semibold text-lg mb-3 flex items-center">
                              <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                              Detalles de Entrega
                            </h4>
                            
                            <div className="space-y-3">
                              <div>
                                <span className="text-sm font-medium text-neutral-600">Dirección:</span>
                                <p className="text-sm text-neutral-800 mt-1 break-words">
                                  {purchase.buyerAddress}
                                </p>
                              </div>
                              
                              {purchase.deliverySlot && (
                                <div>
                                  <span className="text-sm font-medium text-neutral-600">Horario:</span>
                                  <p className="text-sm text-neutral-800 mt-1">{purchase.deliverySlot}</p>
                                </div>
                              )}
                              
                              {purchase.comments && (
                                <div>
                                  <span className="text-sm font-medium text-neutral-600">Comentarios:</span>
                                  <p className="text-sm text-neutral-800 mt-1 italic">"{purchase.comments}"</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Estados */}
                          <div className="bg-white rounded-lg border p-4">
                            <h4 className="font-semibold text-lg mb-3 flex items-center">
                              <Clock className="w-5 h-5 mr-2 text-primary-600" />
                              Actualizar Estado
                            </h4>
                            
                            <div className="grid grid-cols-1 gap-2">
                              {['en_preparacion', 'listo_para_entrega', 'en_camino', 'entregado', 'cancelado'].map((status) => (
                                <Button
                                  key={status}
                                  variant={purchase.orderStatus === status ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleStatusUpdate(purchase.id, status)}
                                  disabled={purchase.orderStatus === status}
                                  className={`justify-start ${purchase.orderStatus === status ? 'bg-primary-600 hover:bg-primary-700' : ''}`}
                                >
                                  {getStatusIcon(status)}
                                  <span className="ml-2">{getStatusText(status)}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card className="shadow-lg">
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-600 mb-2">No se encontraron pedidos</h3>
                  <p className="text-neutral-500">Intenta ajustar los filtros de búsqueda</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 