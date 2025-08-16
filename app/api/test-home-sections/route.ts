import { NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase-service"

export async function GET() {
  try {
    console.log("🧪 === TEST HOME SECTIONS INICIADO ===")
    
    // Test 1: Verificar conexión básica
    console.log("🧪 1. Verificando conexión con Firebase...")
    
    // Test 2: Obtener secciones del home
    console.log("🧪 2. Obteniendo secciones del home...")
    const homeSections = await FirebaseService.getHomeSections()
    console.log("✅ Secciones obtenidas:", homeSections.length)
    
    // Test 3: Verificar estructura de datos
    const sectionsWithDetails = homeSections.map(section => ({
      id: section.id,
      name: section.name,
      description: section.description,
      imageUrl: section.imageUrl,
      order: section.order,
      sectionId: section.sectionId,
      elementId: section.elementId
    }))
    
    console.log("📋 Detalle de secciones:", sectionsWithDetails)
    
    return NextResponse.json({
      success: true,
      message: "Test de home sections completado",
      data: {
        totalSections: homeSections.length,
        sections: sectionsWithDetails,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error("❌ === ERROR EN TEST HOME SECTIONS ===")
    console.error("❌ Error:", error)
    
    return NextResponse.json({
      error: "Error en test de home sections",
      details: error instanceof Error ? error.message : "Error desconocido",
      stack: error instanceof Error ? error.stack : "No stack trace"
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === "clear-cache") {
      console.log("🧪 Limpiando cache de home sections...")
      // Aquí podrías limpiar el cache si implementas una función para eso
      return NextResponse.json({
        success: true,
        message: "Cache limpiado (si estuviera implementado)"
      })
    }
    
    return NextResponse.json({
      error: "Acción no válida",
      validActions: ["clear-cache"]
    }, { status: 400 })
    
  } catch (error) {
    console.error("❌ Error en POST test:", error)
    return NextResponse.json({
      error: "Error en POST test"
    }, { status: 500 })
  }
}

