"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/lib/toast-context"

export default function RegisterPage() {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const { success, error } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validaciones
    if (password !== confirmPassword) {
      error("Error de validación", "Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      error("Error de validación", "La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      await register(email, password, nombre)
      success("¡Registro exitoso!", "Tu cuenta ha sido creada correctamente")

      // Pequeño delay para mostrar el toast antes de redirigir
      setTimeout(() => {
        router.push("/dashboard-usuario")
      }, 1000)
    } catch (registerError: any) {
      console.error("Register error:", registerError)

      let errorMessage = "Error al crear la cuenta"

      if (registerError.code === "auth/email-already-in-use") {
        errorMessage = "Este email ya está registrado"
      } else if (registerError.code === "auth/invalid-email") {
        errorMessage = "Email inválido"
      } else if (registerError.code === "auth/weak-password") {
        errorMessage = "La contraseña es muy débil"
      } else if (registerError.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos. Intenta más tarde"
      }

      error("Error de registro", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 gradient-primary rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold text-neutral-900">Crear Cuenta</h2>
          <p className="mt-2 text-sm text-neutral-600">Únete a Paula Pastas y disfruta de nuestras delicias</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-neutral-700 mb-1">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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
                  Creando cuenta...
                </div>
              ) : (
                "Crear Cuenta"
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-neutral-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                Iniciar sesión
              </Link>
            </p>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-primary-600 hover:text-primary-500">
              ← Volver al inicio
            </Link>
          </div>
        </form>

        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <h3 className="text-sm font-medium text-primary-800 mb-2">Beneficios de registrarte:</h3>
          <ul className="text-xs text-primary-700 space-y-1">
            <li>• Historial de pedidos</li>
            <li>• Direcciones guardadas</li>
            <li>• Ofertas exclusivas</li>
            <li>• Proceso de compra más rápido</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 