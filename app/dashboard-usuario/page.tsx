"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/lib/toast-context"
import ProtectedRoute from "@/components/ProtectedRoute"
import { FirebaseService } from "@/lib/firebase-service"
import DireccionesModal from "@/components/DireccionesModal"
import PerfilModal from "@/components/PerfilModal"
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Heart, 
  Settings, 
  LogOut,
  ArrowRight,
  Package,
  Star,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
}

export default function DashboardUsuarioPage() {
  const { user, userData, logout, loading } = useAuth()
  const { success } = useToast()
  const router = useRouter()
  const [showDireccionesModal, setShowDireccionesModal] = useState(false)
  const [showPerfilModal, setShowPerfilModal] = useState(false)

  // Estadísticas dinámicas del usuario
  const [stats, setStats] = useState({
    totalPedidos: 0,
    pedidosPendientes: 0,
    direccionesGuardadas: 0
  })

  // Últimos pedidos
  const [lastPurchases, setLastPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Cargar estadísticas del usuario
  const loadUserStats = async (forceRefresh: boolean = false) => {
    if (user?.uid) {
      console.log(`📊 Dashboard: Cargando estadísticas para userId: ${user.uid}${forceRefresh ? ' (FORZANDO RECARGA)' : ''}`)
      setIsLoading(true)
      try {
        // Cargar pedidos del usuario (orders collection)
        const pedidos = await FirebaseService.getPedidosByUser(user.uid, forceRefresh)
        const totalPedidos = pedidos.length
        const pedidosPendientes = pedidos.filter(p => 
          p.estado === 'pendiente' || p.estado === 'confirmado'
        ).length

        // Cargar compras completadas (purchases collection)
        const comprasCompletadas = await FirebaseService.getCompletedPurchasesByUser(user.uid, forceRefresh)
        const totalCompras = comprasCompletadas.length
        const comprasPendientes = comprasCompletadas.filter(p => 
          p.orderStatus === 'en_preparacion' || p.orderStatus === 'listo_para_entrega' || p.orderStatus === 'en_camino'
        ).length

        // Combinar estadísticas
        const totalPedidosCombinados = totalPedidos + totalCompras
        const totalPendientesCombinados = pedidosPendientes + comprasPendientes

        // Cargar direcciones del usuario
        const direcciones = await FirebaseService.getDireccionesByUser(user.uid)
        const direccionesGuardadas = direcciones.length
        console.log(`📊 Dashboard: Direcciones encontradas: ${direccionesGuardadas}`)

        setStats({
          totalPedidos: totalPedidosCombinados,
          pedidosPendientes: totalPendientesCombinados,
          direccionesGuardadas
        })

        // Establecer últimos pedidos (combinar orders y purchases)
        const allPurchases = [
          ...pedidos.map(p => ({
            id: p.id || '',
            buyerName: p.userName || '',
            buyerEmail: p.userEmail || '',
            buyerPhone: p.phone || '',
            buyerAddress: p.address || '',
            products: p.items || [],
            totalAmount: p.totalAmount || 0,
            orderStatus: p.estado || 'pendiente',
            createdAt: p.fechaCreacion || new Date(),
            deliveryOption: p.deliveryOption || 'delivery',
            deliverySlot: p.deliverySlot || '',
            comments: p.comments || ''
          })),
          ...comprasCompletadas.map(p => ({
            id: p.id || '',
            buyerName: p.buyerName || '',
            buyerEmail: p.buyerEmail || '',
            buyerPhone: p.buyerPhone || '',
            buyerAddress: p.buyerAddress || '',
            products: p.products || [],
            totalAmount: p.totalAmount || 0,
            orderStatus: p.orderStatus || 'en_preparacion',
            createdAt: p.createdAt || new Date(),
            deliveryOption: p.deliveryOption || 'delivery',
            deliverySlot: p.deliverySlot || '',
            comments: p.comments || ''
          }))
        ].sort((a, b) => {
          // Manejar diferentes formatos de fecha
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
          return dateB.getTime() - dateA.getTime()
        })
        .slice(0, 5) // Solo los últimos 5

        setLastPurchases(allPurchases)
        console.log(`✅ Dashboard: Estadísticas cargadas exitosamente`)
      } catch (error) {
        console.error('❌ Error cargando estadísticas:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    loadUserStats()
  }, [user?.uid])



  const recargarEstadisticas = async () => {
    if (user?.uid) {
      console.log(`🔄 Dashboard: Recargando estadísticas para userId: ${user.uid}`)
      // Limpiar cache y forzar recarga
      FirebaseService.clearCache()
      await loadUserStats(true)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    try {
      await logout()
      success("Sesión cerrada", "Has cerrado sesión correctamente")
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Función para obtener el texto del estado
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
      case 'pendiente':
        return 'Pendiente'
      case 'confirmado':
        return 'Confirmado'
      case 'enviado':
        return 'Enviado'
      default:
        return status
    }
  }

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_preparacion':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'listo_para_entrega':
      case 'confirmado':
        return 'bg-blue-100 text-blue-800'
      case 'en_camino':
      case 'enviado':
        return 'bg-purple-100 text-purple-800'
      case 'entregado':
        return 'bg-green-100 text-green-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Función para formatear la fecha
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

      const now = new Date()
      const diffTime = Math.abs(now.getTime() - dateObj.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        return 'Hace 1 día'
      } else if (diffDays < 7) {
        return `Hace ${diffDays} días`
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
      } else {
        return dateObj.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })
      }
    } catch (error) {
      console.error('Error formateando fecha:', error, date)
      return 'Fecha no disponible'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Se redirigirá automáticamente
  }

  return (
    <ProtectedRoute requireAuth={true} requireAdmin={false} redirectTo="/login">
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">
                  ¡Hola, {userData?.nombre || "Usuario"}!
                </h1>
                <p className="text-neutral-600">Bienvenido a tu panel de usuario</p>
              </div>
              <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                <ShoppingBag className="h-4 w-4 text-primary-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPedidos}</div>
                <p className="text-xs text-neutral-600">Pedidos realizados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pedidosPendientes}</div>
                <p className="text-xs text-neutral-600">En preparación</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Direcciones</CardTitle>
                <MapPin className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.direccionesGuardadas}</div>
                <p className="text-xs text-neutral-600">Guardadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/pastas">
                  <Button className="w-full justify-between" variant="outline">
                    <span>Hacer un pedido</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                
                <Link href="/checkout">
                  <Button className="w-full justify-between" variant="outline">
                    <span>Ver carrito actual</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                
                <Link href="/delivery">
                  <Button className="w-full justify-between" variant="outline">
                    <span>Zonas de entrega</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Últimos Pedidos
                  </CardTitle>
                  <Button
                    onClick={recargarEstadisticas}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    title="Actualizar pedidos"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Actualizar</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="inline-block w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-sm text-neutral-600">Actualizando pedidos...</p>
                    </div>
                  ) : lastPurchases.length > 0 ? (
                    lastPurchases.map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">
                            {purchase.products.length > 0 
                              ? purchase.products.map(p => p.name).join(', ')
                              : 'Pedido sin productos'
                            }
                          </p>
                          <p className="text-sm text-neutral-600">
                            {formatDate(purchase.createdAt)}
                          </p>
                          <p className="text-xs text-neutral-500">
                            ${purchase.totalAmount?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(purchase.orderStatus)}`}>
                          {getStatusText(purchase.orderStatus)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-neutral-500">
                      <p>No tienes pedidos aún</p>
                      <Link href="/pastas">
                        <Button variant="outline" size="sm" className="mt-2">
                          Hacer tu primer pedido
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Datos de la cuenta</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Nombre:</span> {userData?.nombre || "No especificado"}</p>
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                    <p><span className="font-medium">Teléfono:</span> {userData?.telefono || "No especificado"}</p>
                    <p><span className="font-medium">DNI/CUIT:</span> {userData?.dni || "No especificado"}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Configuración</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setShowPerfilModal(true)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Editar perfil
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        console.log("🔓 Abriendo modal de direcciones para userId:", user?.uid)
                        setShowDireccionesModal(true)
                      }}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Gestionar direcciones
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Direcciones */}
      <DireccionesModal
        isOpen={showDireccionesModal}
        onClose={() => {
          console.log("🔒 Cerrando modal de direcciones")
          setShowDireccionesModal(false)
        }}
        userId={user?.uid || ""}
        onDireccionesChange={recargarEstadisticas}
      />

      {/* Modal de Perfil */}
      <PerfilModal
        isOpen={showPerfilModal}
        onClose={() => setShowPerfilModal(false)}
        userId={user?.uid || ""}
        userData={userData}
        onProfileChange={() => {
          // Recargar datos del usuario
          window.location.reload()
        }}
      />
    </ProtectedRoute>
  )
} 