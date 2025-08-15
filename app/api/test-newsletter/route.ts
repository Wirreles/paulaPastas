import { NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase-service"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    console.log("🧪 === TEST NEWSLETTER INICIADO ===")
    console.log("🧪 Email de prueba:", email)

    // 1. Crear suscripción de prueba
    console.log("🧪 1. Creando suscripción...")
    const suscripcionId = await FirebaseService.createSuscripcion(email, "admin")
    console.log("✅ Suscripción creada:", suscripcionId)

    // 2. Generar cupón de bienvenida
    console.log("🧪 2. Generando cupón de bienvenida...")
    const cuponId = await FirebaseService.generateWelcomeCoupon(email)
    console.log("✅ Cupón generado:", cuponId)

    // 3. Obtener el cupón
    console.log("🧪 3. Obteniendo cupón...")
    const cupon = await FirebaseService.getCouponById(cuponId)
    console.log("✅ Cupón obtenido:", cupon)

    // 4. Enviar email de bienvenida
    console.log("🧪 4. Enviando email de bienvenida...")
    const emailResult = await emailService.sendWelcomeEmail(email, cupon.codigo)
    console.log("✅ Resultado del email:", emailResult)

    return NextResponse.json({
      success: true,
      message: "Test completado exitosamente",
      data: {
        suscripcionId,
        cuponId,
        cuponCodigo: cupon.codigo,
        emailEnviado: emailResult.success,
        emailError: emailResult.error
      }
    })

  } catch (error) {
    console.error("❌ Error en test:", error)
    return NextResponse.json({
      error: "Error en test",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Endpoint de test para newsletter con cupón automático",
    usage: "POST con { email: 'test@example.com' }"
  })
}
