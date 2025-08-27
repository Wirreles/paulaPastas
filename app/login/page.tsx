"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/lib/toast-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  const { login, userData, isAdmin } = useAuth()
  const { success, error } = useToast()
  const router = useRouter()

  // Efecto para redirigir después del login exitoso
  useEffect(() => {
    if (loginSuccess && userData) {
      setTimeout(() => {
        if (isAdmin) {
          router.push("/admin")
        } else {
          router.push("/dashboard-usuario")
        }
      }, 1000)
    }
  }, [loginSuccess, userData, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      success("¡Bienvenido!", "Has iniciado sesión correctamente")
      setLoginSuccess(true)
    } catch (loginError: any) {
      console.error("Login error:", loginError)

      let errorMessage = "Credenciales inválidas"

      if (loginError.code === "auth/user-not-found") {
        errorMessage = "Usuario no encontrado"
      } else if (loginError.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta"
      } else if (loginError.code === "auth/invalid-email") {
        errorMessage = "Email inválido"
      } else if (loginError.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos. Intenta más tarde"
      }

      error("Error de autenticación", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo de Paula Pastas */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-20 h-20 flex items-center justify-center">
                <img
                  src="/pplog2.png"
                  alt="Paula Pastas Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              {/* <div className="text-left">
                <span className="font-display text-2xl font-bold text-neutral-900">Paula Pastas</span>
                <p className="text-sm text-neutral-600">Pastas Artesanales</p>
              </div> */}
            </div>
          </div>
          
          <h2 className="font-display text-3xl font-bold text-neutral-900">¡Bienvenido!</h2>
          <p className="mt-2 text-sm text-neutral-600">Inicia sesión para acceder a tu cuenta</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-neutral-600">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-primary-600 hover:text-primary-500 font-medium">
                Registrarse
              </Link>
            </p>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-primary-600 hover:text-primary-500">
              ← Volver al inicio
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
