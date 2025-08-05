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
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  // Cargar estadísticas del usuario
  useEffect(() => {
    const loadUserStats = async () => {
      if (user?.uid) {
        console.log(`📊 Dashboard: Cargando estadísticas para userId: ${user.uid}`)
        try {
          // Cargar pedidos del usuario
          const pedidos = await FirebaseService.getPedidosByUser(user.uid)
          const totalPedidos = pedidos.length
          const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'en_preparacion').length

          // Cargar direcciones del usuario
          const direcciones = await FirebaseService.getDireccionesByUser(user.uid)
          const direccionesGuardadas = direcciones.length
          console.log(`📊 Dashboard: Direcciones encontradas: ${direccionesGuardadas}`)

          setStats({
            totalPedidos,
            pedidosPendientes,
            direccionesGuardadas
          })
        } catch (error) {
          console.error('Error cargando estadísticas:', error)
        }
      }
    }

    loadUserStats()
  }, [user?.uid])

  const recargarEstadisticas = () => {
    if (user?.uid) {
      console.log(`🔄 Dashboard: Recargando estadísticas para userId: ${user.uid}`)
      loadUserStats()
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
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Últimos Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium">Ravioles de Osobuco</p>
                      <p className="text-sm text-neutral-600">Hace 2 días</p>
                    </div>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Entregado
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium">Lasaña Clásica</p>
                      <p className="text-sm text-neutral-600">Hace 1 semana</p>
                    </div>
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      En preparación
                    </span>
                  </div>
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