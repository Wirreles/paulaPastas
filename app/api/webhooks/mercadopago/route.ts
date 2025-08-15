import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoService } from "@/lib/mercadopago-service"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 === WEBHOOK MERCADOPAGO INICIADO ===")
    console.log("🔄 Timestamp:", new Date().toISOString())
    console.log("🔄 Headers recibidos:", Object.fromEntries(request.headers.entries()))
    console.log("🔄 URL del webhook:", request.url)
    
    const body = await request.json()
    console.log("🔄 Body del webhook:", JSON.stringify(body, null, 2))
    console.log("🔄 Tipo de notificación:", body.type)
    console.log("🔄 ID del pago:", body.data?.id)
    console.log("🔄 Estructura completa:", {
      hasType: !!body.type,
      hasData: !!body.data,
      hasId: !!body.data?.id,
      bodyKeys: Object.keys(body)
    })

    // Validar que sea una notificación de pago
    if (body.type !== 'payment') {
      console.log("⚠️ Webhook ignorado - no es notificación de pago")
      return NextResponse.json({ success: true, message: "Webhook ignorado - no es notificación de pago" })
    }

    // Validar que tenga el ID del pago
    if (!body.data?.id) {
      console.log("⚠️ Webhook ignorado - no tiene ID del pago")
      return NextResponse.json({ success: true, message: "Webhook ignorado - no tiene ID del pago" })
    }

    // Procesar el webhook usando el servicio integrado
    console.log("🔄 Procesando webhook con MercadoPagoService...")
    console.log("🔄 ID del pago a procesar:", body.data.id)
    
    const startTime = Date.now()
    await MercadoPagoService.handleWebhook(body)
    const processingTime = Date.now() - startTime
    
    console.log("✅ === WEBHOOK PROCESADO EXITOSAMENTE ===")
    console.log("✅ Tiempo de procesamiento:", processingTime, "ms")
    return NextResponse.json({ success: true, processingTime })

  } catch (error) {
    console.error("❌ === ERROR EN WEBHOOK ===")
    console.error("❌ Timestamp del error:", new Date().toISOString())
    console.error("❌ Error completo:", error)
    console.error("❌ Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    console.error("❌ Mensaje:", error instanceof Error ? error.message : "Error desconocido")
    console.error("❌ Tipo de error:", typeof error)
    
    return NextResponse.json(
      { 
        error: "Error procesando webhook",
        details: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
        type: typeof error
      }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  console.log("🔍 Webhook endpoint verificado - GET request recibido")
  
  // Test básico del servicio
  try {
    console.log("🔍 Verificando configuración del servicio...")
    console.log("🔍 NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL)
    console.log("🔍 NODE_ENV:", process.env.NODE_ENV)
    
    return NextResponse.json({ 
      message: "Webhook endpoint activo",
      timestamp: new Date().toISOString(),
      status: "operational",
      environment: process.env.NODE_ENV,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "No configurado",
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
      testInstructions: "Para probar el webhook, haz un POST a este endpoint con datos simulados de MercadoPago"
    })
  } catch (error) {
    console.error("❌ Error en test del webhook:", error)
    return NextResponse.json({ 
      error: "Error en test del webhook",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}

// Endpoint de test para simular webhook
export async function PUT(request: NextRequest) {
  try {
    console.log("🧪 === TEST WEBHOOK INICIADO ===")
    
    const testData = {
      type: 'payment',
      data: {
        id: '123456789'
      }
    }
    
    console.log("🧪 Datos de test:", JSON.stringify(testData, null, 2))
    console.log("🧪 Simulando webhook de MercadoPago...")
    
    // Simular el webhook
    await MercadoPagoService.handleWebhook(testData)
    
    console.log("✅ === TEST WEBHOOK COMPLETADO ===")
    return NextResponse.json({ 
      success: true, 
      message: "Test webhook ejecutado correctamente",
      testData
    })
    
  } catch (error) {
    console.error("❌ === ERROR EN TEST WEBHOOK ===")
    console.error("❌ Error:", error)
    
    return NextResponse.json({ 
      error: "Error en test webhook",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
} 