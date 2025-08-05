import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoService } from "@/lib/mercadopago-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, userData, deliveryOption, deliverySlot, comments, isUserLoggedIn, userId, selectedAddressId, selectedAddressData } = body

    // Validaciones básicas
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items requeridos" }, { status: 400 })
    }

    if (!userData || !userData.email || !userData.name || !userData.phone) {
      return NextResponse.json({ error: "Datos de usuario incompletos" }, { status: 400 })
    }

    // Crear preferencia usando el servicio integrado
    const result = await MercadoPagoService.createProductPreference({
      items,
      userData,
      deliveryOption,
      deliverySlot,
      comments,
      isUserLoggedIn,
      userId,
      selectedAddressId,
      selectedAddressData
    })

    return NextResponse.json({
      id: result.id,
      initPoint: result.initPoint,
      sandboxInitPoint: result.sandboxInitPoint,
      externalReference: result.externalReference
    })

  } catch (error) {
    console.error("❌ Error en create-preference:", error)
    return NextResponse.json(
      { 
        error: "Error al crear preferencia de pago",
        details: error instanceof Error ? error.message : "Error desconocido"
      }, 
      { status: 500 }
    )
  }
} 