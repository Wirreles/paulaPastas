"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function CheckoutPendingContent() {
  const searchParams = useSearchParams()
  
  const paymentId = searchParams.get("payment_id")
  const preferenceId = searchParams.get("preference_id")
  const externalReference = searchParams.get("external_reference")

  return (
    <div className="min-h-[calc(100vh-120px)] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center p-8">
          <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <CardTitle className="text-3xl font-bold mb-4 text-yellow-800">
            Pago Pendiente
          </CardTitle>
          
          <CardContent className="space-y-6">
            <p className="text-neutral-700 text-lg">
              Tu pago está siendo procesado. Te notificaremos cuando se confirme.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">⏳ Estado del pago</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                {externalReference && (
                  <p><strong>Referencia:</strong> {externalReference}</p>
                )}
                {paymentId && (
                  <p><strong>ID de Pago:</strong> {paymentId}</p>
                )}
                {preferenceId && (
                  <p><strong>ID de Preferencia:</strong> {preferenceId}</p>
                )}
                <p><strong>Estado:</strong> Pendiente de confirmación</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">📋 ¿Qué significa esto?</h4>
              <div className="text-sm text-blue-700 space-y-2">
                <p>• Tu pago está siendo revisado por el sistema</p>
                <p>• Puede tardar unos minutos en confirmarse</p>
                <p>• Te enviaremos una notificación cuando esté listo</p>
                <p>• Mientras tanto, tu pedido está reservado</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Posibles resultados</h4>
              <div className="text-sm text-green-700 space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Pago aprobado - Tu pedido se procesará normalmente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Pago rechazado - Te contactaremos para coordinar</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/checkout">
                <Button variant="outline" className="w-full sm:w-auto">
                  Volver al checkout
                </Button>
              </Link>
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

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-120px)] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center p-8">
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-yellow-200 rounded-full mx-auto mb-6"></div>
              <div className="h-8 bg-yellow-200 rounded mb-4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-neutral-200 rounded"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    }>
      <CheckoutPendingContent />
    </Suspense>
  )
} 