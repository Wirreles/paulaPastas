"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { XCircle, RefreshCw, Home } from "lucide-react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function CheckoutFailureContent() {
  const searchParams = useSearchParams()
  
  const paymentId = searchParams.get("payment_id")
  const preferenceId = searchParams.get("preference_id")
  const externalReference = searchParams.get("external_reference")

  return (
    <div className="min-h-[calc(100vh-120px)] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center p-8">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <CardTitle className="text-3xl font-bold mb-4 text-red-800">
            Pago Fallido
          </CardTitle>
          
          <CardContent className="space-y-6">
            <p className="text-neutral-700 text-lg">
              Lo sentimos, hubo un problema al procesar tu pago. No te preocupes, tu pedido no se ha procesado.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Detalles del error</h4>
              <div className="text-sm text-red-700 space-y-1">
                {externalReference && (
                  <p><strong>Referencia:</strong> {externalReference}</p>
                )}
                {paymentId && (
                  <p><strong>ID de Pago:</strong> {paymentId}</p>
                )}
                {preferenceId && (
                  <p><strong>ID de Preferencia:</strong> {preferenceId}</p>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 ¿Qué puedes hacer?</h4>
              <div className="text-sm text-yellow-700 space-y-2">
                <p>• Verificar que tu tarjeta tenga fondos suficientes</p>
                <p>• Intentar con otro método de pago</p>
                <p>• Contactarnos por WhatsApp para coordinar el pago</p>
                <p>• Volver a intentar el pago</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/checkout">
                <Button variant="outline" className="w-full sm:w-auto">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Intentar nuevamente
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
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

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-120px)] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center p-8">
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-red-200 rounded-full mx-auto mb-6"></div>
              <div className="h-8 bg-red-200 rounded mb-4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-neutral-200 rounded"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    }>
      <CheckoutFailureContent />
    </Suspense>
  )
} 