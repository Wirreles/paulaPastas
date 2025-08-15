import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoService } from "@/lib/mercadopago-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar que sea una notificación de pago
    if (body.type !== 'payment') {
      return NextResponse.json({ success: true, message: "Webhook ignorado - no es notificación de pago" })
    }

    // Validar que tenga el ID del pago
    if (!body.data?.id) {
      return NextResponse.json({ success: true, message: "Webhook ignorado - no tiene ID del pago" })
    }

    // Procesar el webhook usando el servicio integrado
    await MercadoPagoService.handleWebhook(body)
    
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error procesando webhook:", error)
    
    return NextResponse.json(
      { 
        error: "Error procesando webhook",
        details: error instanceof Error ? error.message : "Error desconocido"
      }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Webhook endpoint activo",
    status: "operational"
  })
} 