import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

// Configuración de Firebase (usar la misma que está en firebase-admin.ts)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Inicializar Firebase Admin si no está ya inicializado
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: firebaseConfig.projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = getFirestore()
const auth = getAuth()

async function initNewsletterCollections() {
  try {
    console.log("🚀 Inicializando colecciones del newsletter...")

    // Crear colección de suscripciones con algunos datos de ejemplo
    const suscripcionesRef = db.collection("suscripciones")
    
    // Verificar si ya existen suscripciones
    const existingSuscripciones = await suscripcionesRef.get()
    
    if (existingSuscripciones.empty) {
      console.log("📧 Creando suscripciones de ejemplo...")
      
      const suscripcionesEjemplo = [
        {
          email: "ejemplo1@test.com",
          fechaSuscripcion: new Date("2024-01-15"),
          estado: "activo",
          origen: "web",
          activo: true,
          fechaCreacion: new Date("2024-01-15"),
          fechaActualizacion: new Date("2024-01-15")
        },
        {
          email: "ejemplo2@test.com",
          fechaSuscripcion: new Date("2024-02-20"),
          estado: "activo",
          origen: "admin",
          activo: true,
          fechaCreacion: new Date("2024-02-20"),
          fechaActualizacion: new Date("2024-02-20")
        },
        {
          email: "ejemplo3@test.com",
          fechaSuscripcion: new Date("2024-03-10"),
          estado: "dado-de-baja",
          origen: "web",
          activo: false,
          fechaBaja: new Date("2024-04-01"),
          motivoBaja: "Baja voluntaria",
          fechaCreacion: new Date("2024-03-10"),
          fechaActualizacion: new Date("2024-04-01")
        }
      ]

      for (const suscripcion of suscripcionesEjemplo) {
        await suscripcionesRef.add(suscripcion)
        console.log(`✅ Suscripción creada: ${suscripcion.email}`)
      }
    } else {
      console.log(`📧 Ya existen ${existingSuscripciones.size} suscripciones`)
    }

    // Crear colección de campañas de newsletter
    const campaignsRef = db.collection("newsletter_campaigns")
    
    // Verificar si ya existen campañas
    const existingCampaigns = await campaignsRef.get()
    
    if (existingCampaigns.empty) {
      console.log("📨 Creando campañas de ejemplo...")
      
      const campaignsEjemplo = [
        {
          titulo: "Bienvenida a Paula Pastas",
          contenido: `
            <h1>¡Bienvenido a Paula Pastas!</h1>
            <p>Gracias por suscribirte a nuestro newsletter. Pronto recibirás nuestras mejores ofertas y novedades.</p>
            <p>¡Disfruta de nuestras pastas artesanales!</p>
          `,
          asunto: "¡Bienvenido a Paula Pastas!",
          destinatarios: "nuevos",
          estado: "enviada",
          fechaEnvio: new Date("2024-01-15"),
          estadisticas: {
            enviados: 150,
            entregados: 145,
            abiertos: 89,
            clicks: 23,
            rebotes: 5
          },
          fechaCreacion: new Date("2024-01-15"),
          fechaActualizacion: new Date("2024-01-15")
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
          destinatarios: "activos",
          estado: "programada",
          fechaProgramada: new Date("2024-12-20"),
          fechaCreacion: new Date("2024-12-01"),
          fechaActualizacion: new Date("2024-12-01")
        }
      ]

      for (const campaign of campaignsEjemplo) {
        await campaignsRef.add(campaign)
        console.log(`✅ Campaña creada: ${campaign.titulo}`)
      }
    } else {
      console.log(`📨 Ya existen ${existingCampaigns.size} campañas`)
    }

    console.log("✅ Colecciones del newsletter inicializadas correctamente")
    
    // Mostrar estadísticas
    const totalSuscripciones = await suscripcionesRef.get()
    const totalCampaigns = await campaignsRef.get()
    
    console.log("\n📊 Estadísticas:")
    console.log(`- Total suscripciones: ${totalSuscripciones.size}`)
    console.log(`- Total campañas: ${totalCampaigns.size}`)
    
    // Contar por estado
    const suscripcionesActivas = await suscripcionesRef.where("estado", "==", "activo").get()
    const suscripcionesInactivas = await suscripcionesRef.where("estado", "==", "inactivo").get()
    const suscripcionesBaja = await suscripcionesRef.where("estado", "==", "dado-de-baja").get()
    
    console.log(`- Suscripciones activas: ${suscripcionesActivas.size}`)
    console.log(`- Suscripciones inactivas: ${suscripcionesInactivas.size}`)
    console.log(`- Suscripciones dadas de baja: ${suscripcionesBaja.size}`)

  } catch (error) {
    console.error("❌ Error inicializando colecciones del newsletter:", error)
  } finally {
    process.exit(0)
  }
}

// Ejecutar el script
initNewsletterCollections()
