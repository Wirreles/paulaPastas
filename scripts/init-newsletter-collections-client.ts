import { FirebaseService } from "../lib/firebase-service"

async function initNewsletterCollections() {
  try {
    console.log("🚀 Inicializando colecciones del newsletter usando Firebase Client...")

    // Crear suscripciones de ejemplo usando el servicio del cliente
    const suscripcionesEjemplo = [
      {
        email: "ejemplo1@test.com",
        fechaSuscripcion: new Date("2024-01-15"),
        estado: "activo" as const,
        origen: "web" as const,
        activo: true,
        fechaCreacion: new Date("2024-01-15"),
        fechaActualizacion: new Date("2024-01-15")
      },
      {
        email: "ejemplo2@test.com",
        fechaSuscripcion: new Date("2024-02-20"),
        estado: "activo" as const,
        origen: "admin" as const,
        activo: true,
        fechaCreacion: new Date("2024-02-20"),
        fechaActualizacion: new Date("2024-02-20")
      },
      {
        email: "ejemplo3@test.com",
        fechaSuscripcion: new Date("2024-03-10"),
        estado: "dado-de-baja" as const,
        origen: "web" as const,
        activo: false,
        fechaBaja: new Date("2024-04-01"),
        motivoBaja: "Baja voluntaria",
        fechaCreacion: new Date("2024-03-10"),
        fechaActualizacion: new Date("2024-04-01")
      }
    ]

    console.log("📧 Creando suscripciones de ejemplo...")
    
    for (const suscripcion of suscripcionesEjemplo) {
      try {
        await FirebaseService.createSuscripcion(suscripcion.email, suscripcion.origen)
        console.log(`✅ Suscripción creada: ${suscripcion.email}`)
      } catch (error: any) {
        if (error.message.includes("Ya existe una suscripción")) {
          console.log(`⚠️ La suscripción ${suscripcion.email} ya existe`)
        } else {
          console.error(`❌ Error creando suscripción ${suscripcion.email}:`, error.message)
        }
      }
    }

    // Crear campañas de ejemplo
    const campaignsEjemplo = [
      {
        titulo: "Bienvenida a Paula Pastas",
        contenido: `
          <h1>¡Bienvenido a Paula Pastas!</h1>
          <p>Gracias por suscribirte a nuestro newsletter. Pronto recibirás nuestras mejores ofertas y novedades.</p>
          <p>¡Disfruta de nuestras pastas artesanales!</p>
        `,
        asunto: "¡Bienvenido a Paula Pastas!",
        destinatarios: "nuevos" as const,
        estado: "enviada" as const,
        fechaEnvio: new Date("2024-01-15"),
        estadisticas: {
          enviados: 150,
          entregados: 145,
          abiertos: 89,
          clicks: 23,
          rebotes: 5
        }
      },
      {
        titulo: "Ofertas de Verano",
        contenido: `
          <h1>¡Ofertas Especiales de Verano!</h1>
          <p>Descubre nuestras promociones especiales para el verano.</p>
          <ul>
            <li>20% de descuento en ravioles</li>
            <li>Combo familiar con 15% off</li>
            <li>Envío gratis en pedidos superiores a $5000</li>
          </ul>
        `,
        asunto: "🔥 Ofertas Especiales de Verano - Paula Pastas",
        destinatarios: "activos" as const,
        estado: "programada" as const,
        fechaProgramada: new Date("2024-12-20")
      }
    ]

    console.log("📨 Creando campañas de ejemplo...")
    
    for (const campaign of campaignsEjemplo) {
      try {
        await FirebaseService.createNewsletterCampaign(campaign)
        console.log(`✅ Campaña creada: ${campaign.titulo}`)
      } catch (error: any) {
        console.error(`❌ Error creando campaña ${campaign.titulo}:`, error.message)
      }
    }

    console.log("✅ Colecciones del newsletter inicializadas correctamente")
    
    // Mostrar estadísticas
    try {
      const suscripciones = await FirebaseService.getAllSuscripciones()
      const campaigns = await FirebaseService.getAllNewsletterCampaigns()
      
      console.log("\n📊 Estadísticas:")
      console.log(`- Total suscripciones: ${suscripciones.length}`)
      console.log(`- Total campañas: ${campaigns.length}`)
      
      // Contar por estado
      const suscripcionesActivas = suscripciones.filter(s => s.estado === "activo").length
      const suscripcionesInactivas = suscripciones.filter(s => s.estado === "inactivo").length
      const suscripcionesBaja = suscripciones.filter(s => s.estado === "dado-de-baja").length
      
      console.log(`- Suscripciones activas: ${suscripcionesActivas}`)
      console.log(`- Suscripciones inactivas: ${suscripcionesInactivas}`)
      console.log(`- Suscripciones dadas de baja: ${suscripcionesBaja}`)
    } catch (error) {
      console.log("⚠️ No se pudieron obtener las estadísticas:", error)
    }

  } catch (error) {
    console.error("❌ Error inicializando colecciones del newsletter:", error)
  } finally {
    process.exit(0)
  }
}

// Ejecutar el script
initNewsletterCollections()

