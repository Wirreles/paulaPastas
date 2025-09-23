"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface AdminProtectedRouteProps {
  children: React.ReactNode
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("🚫 Usuario no autenticado, redirigiendo a login")
        router.push("/login")
        return
      }

      if (user && !isAdmin) {
        console.log("🚫 Usuario no es admin, redirigiendo a dashboard de usuario")
        router.push("/dashboard-usuario")
        return
      }

      if (user && isAdmin) {
        console.log("✅ Usuario admin autenticado, acceso permitido")
      }
    }
  }, [user, isAdmin, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (user && !isAdmin) {
    return null
  }

  return <>{children}</>
}