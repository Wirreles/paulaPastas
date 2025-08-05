"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false, 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Si requiere autenticación y no hay usuario
      if (requireAuth && !user) {
        router.push(redirectTo)
        return
      }

      // Si requiere admin y no es admin
      if (requireAdmin && !isAdmin) {
        router.push("/dashboard-usuario")
        return
      }

      // Si es admin y está en una ruta de usuario
      if (isAdmin && redirectTo === "/dashboard-usuario") {
        router.push("/admin")
        return
      }
    }
  }, [user, isAdmin, loading, requireAuth, requireAdmin, redirectTo, router])

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Si requiere autenticación y no hay usuario, no mostrar nada
  if (requireAuth && !user) {
    return null
  }

  // Si requiere admin y no es admin, no mostrar nada
  if (requireAdmin && !isAdmin) {
    return null
  }

  return <>{children}</>
} 