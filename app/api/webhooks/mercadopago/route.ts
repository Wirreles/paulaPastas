import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoService } from "@/lib/mercadopago-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🔄 Webhook MercadoPago recibido:", body)

    // Procesar el webhook usando el servicio integrado
    await MercadoPagoService.handleWebhook(body)

    console.log("✅ Webhook procesado exitosamente")
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("❌ Error procesando webhook:", error)
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
  return NextResponse.json({ message: "Webhook endpoint activo" })
} 