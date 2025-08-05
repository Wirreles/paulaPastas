"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Package, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { FirebaseService } from "@/lib/firebase-service"
import Link from "next/link"

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const paymentId = searchParams.get("payment_id")
  const preferenceId = searchParams.get("preference_id")
  const externalReference = searchParams.get("external_reference")

  useEffect(() => {
    const loadOrderData = async () => {
      if (externalReference) {
        try {
          // Aquí podrías buscar el pedido por external_reference
          // Por ahora mostraremos los datos básicos
          setOrderData({
            externalReference,
            paymentId,
            preferenceId,
          })
        } catch (error) {
          console.error("Error cargando datos del pedido:", error)
        }
      }
      setLoading(false)
    }

    loadOrderData()
  }, [externalReference, paymentId, preferenceId])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center p-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <CardTitle className="text-3xl font-bold mb-4 text-green-800">
            ¡Pago Exitoso!
          </CardTitle>
          
          <CardContent className="space-y-6">
            <p className="text-neutral-700 text-lg">
              Tu pago ha sido procesado correctamente. ¡Gracias por tu compra!
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">📋 Detalles del pedido</h4>
              <div className="text-sm text-green-700 space-y-1">
                {orderData?.externalReference && (
                  <p><strong>Referencia:</strong> {orderData.externalReference}</p>
                )}
                {paymentId && (
                  <p><strong>ID de Pago:</strong> {paymentId}</p>
                )}
                {preferenceId && (
                  <p><strong>ID de Preferencia:</strong> {preferenceId}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">📞 Próximos pasos</h4>
              <div className="text-sm text-blue-700 space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Te contactaremos por WhatsApp para coordinar la entrega</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Tu pedido será preparado y enviado según el horario elegido</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user && (
                <Link href="/dashboard-usuario">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Ver mis pedidos
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button className="w-full sm:w-auto">
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
} 