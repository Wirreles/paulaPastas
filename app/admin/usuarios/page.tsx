"use client"

import { useEffect, useState } from "react"
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Ban, 
  UserCheck, 
  Eye,
  Search,
  Filter
} from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import type { Usuario } from "@/lib/types"
import AdminNavigation from "@/components/admin/AdminNavigation"

export default function UsuariosPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRol, setFilterRol] = useState<string>("todos")
  const [filterStatus, setFilterStatus] = useState<string>("todos")

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true)
      const data = await FirebaseService.getUsuarios()
      setUsuarios(data)
    } catch (error) {
      console.error("Error loading usuarios:", error)
    } finally {
      setLoadingUsuarios(false)
    }
  }

  const handleBanUsuario = async (uid: string) => {
    if (confirm("¿Estás seguro de que quieres banear a este usuario?")) {
      try {
        await FirebaseService.banUsuario(uid)
        await loadUsuarios()
      } catch (error) {
        console.error("Error banning usuario:", error)
      }
    }
  }

  const handleUnbanUsuario = async (uid: string) => {
    if (confirm("¿Estás seguro de que quieres desbanear a este usuario?")) {
      try {
        await FirebaseService.unbanUsuario(uid)
        await loadUsuarios()
      } catch (error) {
        console.error("Error unbanning usuario:", error)
      }
    }
  }

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchesSearch = 
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usuario.nombre && usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (usuario.telefono && usuario.telefono.includes(searchTerm))
    
    const matchesRol = filterRol === "todos" || usuario.rol === filterRol
    const matchesStatus = filterStatus === "todos" || 
      (filterStatus === "baneados" && usuario.baneado) ||
      (filterStatus === "activos" && !usuario.baneado)

    return matchesSearch && matchesRol && matchesStatus
  })

  const stats = {
    total: usuarios.length,
    admin: usuarios.filter((u) => u.rol === "admin").length,
    clientes: usuarios.filter((u) => u.rol === "cliente").length,
    baneados: usuarios.filter((u) => u.baneado).length,
    activos: usuarios.filter((u) => !u.baneado).length,
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminNavigation />

          {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Administradores</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.admin}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Clientes</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.clientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Activos</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.activos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Ban className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Baneados</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.baneados}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por email, nombre o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 min-w-0">
                <select
                  value={filterRol}
                  onChange={(e) => setFilterRol(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="todos">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="cliente">Clientes</option>
                </select>
              </div>

              <div className="flex-1 min-w-0">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activos">Solo activos</option>
                  <option value="baneados">Solo baneados</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Usuarios ({usuariosFiltrados.length})</h2>
          </div>

          {loadingUsuarios ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Rol
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
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.uid} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-bold text-sm">
                              {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : usuario.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">
                              {usuario.nombre || "Sin nombre"}
                            </div>
                            <div className="text-sm text-neutral-500">{usuario.email}</div>
                            <div className="text-xs text-neutral-400">
                              Registrado: {usuario.fechaCreacion ? new Date(usuario.fechaCreacion).toLocaleDateString('es-ES') : "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {usuario.telefono && (
                            <div className="flex items-center text-sm text-neutral-600">
                              <Phone className="w-4 h-4 mr-2" />
                              {usuario.telefono}
                            </div>
                          )}
                          {usuario.direccion && (
                            <div className="flex items-center text-sm text-neutral-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {usuario.direccion.ciudad}, {usuario.direccion.provincia}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.rol === "admin" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {usuario.rol === "admin" ? "Administrador" : "Cliente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            usuario.baneado 
                              ? "bg-red-100 text-red-800" 
                              : "bg-green-100 text-green-800"
                          }`}>
                            {usuario.baneado ? "Baneado" : "Activo"}
                          </span>
                          {usuario.baneado && usuario.fechaBaneo && (
                            <span className="text-xs text-neutral-500">
                              {new Date(usuario.fechaBaneo).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              // Aquí podrías abrir un modal con más detalles del usuario
                              alert(`Detalles del usuario:\nEmail: ${usuario.email}\nNombre: ${usuario.nombre || 'No especificado'}\nTeléfono: ${usuario.telefono || 'No especificado'}`)
                            }}
                            className="text-primary-600 hover:text-primary-900"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {usuario.rol !== "admin" && (
                            usuario.baneado ? (
                              <button
                                onClick={() => handleUnbanUsuario(usuario.uid)}
                                className="text-green-600 hover:text-green-900"
                                title="Desbanear usuario"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanUsuario(usuario.uid)}
                                className="text-red-600 hover:text-red-900"
                                title="Banear usuario"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {usuariosFiltrados.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No se encontraron usuarios con los filtros aplicados</p>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </AdminProtectedRoute>
  )
}
