import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc } from "firebase/firestore"

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

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const productos = [
  {
    id: "ravioles-de-carne",
    nombre: "Ravioles de Carne",
    slug: "ravioles-de-carne",
    descripcion:
      "Ravioles artesanales rellenos de carne vacuna, cebolla y especias. Masa fresca elaborada diariamente.",
    precio: 2500,
    categoria: "rellenas",
    subcategoria: "ravioles", // OBLIGATORIO
    imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
    ingredientes: ["Masa de huevo", "Carne vacuna", "Cebolla", "Ajo", "Perejil", "Especias"],
    disponible: true,
    destacado: true,
    orden: 1,
    porciones: 4,
    tiempoPreparacion: "8-10 minutos",
    seoTitle: "Ravioles de Carne Caseros - Artesanales | Comida Casera Rosario",
    seoDescription:
      "Ravioles de carne artesanales con masa fresca. Relleno casero de carne vacuna y especias. Delivery en Rosario. $2500",
    seoKeywords: ["ravioles de carne", "ravioles caseros", "pasta rellena", "delivery rosario"],
  },
  {
    id: "ravioles-de-osobuco",
    nombre: "Ravioles de Osobuco",
    slug: "ravioles-de-osobuco",
    descripcion: "Ravioles gourmet rellenos de osobuco braseado con verduras y hierbas aromáticas.",
    precio: 3200,
    categoria: "rellenas",
    subcategoria: "ravioles",
    imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
    ingredientes: ["Masa de huevo", "Osobuco", "Zanahoria", "Apio", "Cebolla", "Vino tinto", "Hierbas"],
    disponible: true,
    destacado: true,
    orden: 2,
    porciones: 4,
    tiempoPreparacion: "8-10 minutos",
  },
  {
    id: "sorrentinos-jamon-queso",
    nombre: "Sorrentinos de Jamón y Queso",
    slug: "sorrentinos-jamon-queso",
    descripcion: "Sorrentinos grandes rellenos de jamón cocido y queso cremoso. Perfectos para toda la familia.",
    precio: 2800,
    categoria: "rellenas",
    subcategoria: "sorrentinos",
    imagen: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    ingredientes: ["Masa de huevo", "Jamón cocido", "Queso cremoso", "Ricota", "Nuez moscada"],
    disponible: true,
    destacado: true,
    orden: 3,
    porciones: 4,
    tiempoPreparacion: "10-12 minutos",
  },
  {
    id: "lasagna-de-carne",
    nombre: "Lasagna de Carne",
    slug: "lasagna-de-carne",
    descripcion: "Lasagna tradicional con capas de pasta, salsa bolognesa casera y queso gratinado.",
    precio: 3500,
    categoria: "rellenas",
    subcategoria: "lasagna",
    imagen: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop",
    ingredientes: [
      "Pasta de lasagna",
      "Carne picada",
      "Salsa de tomate",
      "Queso mozzarella",
      "Queso parmesano",
      "Bechamel",
    ],
    disponible: true,
    destacado: true,
    orden: 4,
    porciones: 6,
    tiempoPreparacion: "Listo para hornear",
  },
  {
    id: "noquis-de-papa",
    nombre: "Ñoquis de Papa",
    slug: "noquis-de-papa",
    descripcion: "Ñoquis tradicionales hechos con papas frescas y la receta de la nonna.",
    precio: 2200,
    categoria: "sin-relleno",
    subcategoria: "noquis",
    imagen: "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400&h=300&fit=crop",
    ingredientes: ["Papa", "Harina", "Huevo", "Sal"],
    disponible: true,
    destacado: false,
    orden: 5,
    porciones: 4,
    tiempoPreparacion: "5-7 minutos",
  },
  {
    id: "fideos-caseros",
    nombre: "Fideos Caseros",
    slug: "fideos-caseros",
    descripcion: "Fideos frescos elaborados diariamente con harina 00 y huevos de granja.",
    precio: 1800,
    categoria: "sin-relleno",
    subcategoria: "fideos",
    imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop",
    ingredientes: ["Harina 00", "Huevos", "Aceite de oliva", "Sal"],
    disponible: true,
    destacado: false,
    orden: 6,
    porciones: 4,
    tiempoPreparacion: "3-5 minutos",
  },
  {
    id: "ravioles-sin-tacc",
    nombre: "Ravioles Sin TACC",
    slug: "ravioles-sin-tacc",
    descripcion: "Ravioles libres de gluten elaborados con harina certificada sin TACC.",
    precio: 3200,
    categoria: "sin-tacc",
    subcategoria: "ravioles",
    imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
    ingredientes: ["Harina sin TACC", "Huevos", "Ricota", "Espinaca"],
    disponible: true,
    destacado: false,
    orden: 7,
    porciones: 4,
    tiempoPreparacion: "8-10 minutos",
  },
  {
    id: "ravioles-de-ricota-espinaca",
    nombre: "Ravioles de Ricota y Espinaca",
    slug: "ravioles-de-ricota-espinaca",
    descripcion: "Ravioles vegetarianos rellenos de ricota fresca y espinaca salteada con ajo.",
    precio: 2400,
    categoria: "rellenas",
    subcategoria: "ravioles",
    imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
    ingredientes: ["Masa de huevo", "Ricota", "Espinaca", "Ajo", "Cebolla", "Nuez moscada"],
    disponible: true,
    destacado: false,
    orden: 8,
    porciones: 4,
    tiempoPreparacion: "8-10 minutos",
  },
  {
    id: "ravioles-de-pollo-verdeo",
    nombre: "Ravioles de Pollo y Verdeo",
    slug: "ravioles-de-pollo-verdeo",
    descripcion: "Ravioles rellenos de pollo desmenuzado con cebolla de verdeo y especias.",
    precio: 2600,
    categoria: "rellenas",
    subcategoria: "ravioles",
    imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
    ingredientes: ["Masa de huevo", "Pollo", "Cebolla de verdeo", "Apio", "Zanahoria", "Perejil"],
    disponible: true,
    destacado: false,
    orden: 9,
    porciones: 4,
    tiempoPreparacion: "8-10 minutos",
  },
  {
    id: "ravioles-fritos-clasicos", // Nuevo producto
    nombre: "Ravioles Fritos Clásicos",
    slug: "ravioles-fritos-clasicos",
    descripcion: "Ravioles de carne fritos, crocantes por fuera y jugosos por dentro. ¡Ideales para picar!",
    precio: 2000,
    categoria: "sin-relleno",
    subcategoria: "ravioles-fritos", // Nueva subcategoría
    imagen: "/placeholder.svg?height=400&width=300",
    ingredientes: ["Masa de huevo", "Carne vacuna", "Cebolla", "Especias", "Aceite para freír"],
    disponible: true,
    destacado: true,
    orden: 10,
    porciones: 2,
    tiempoPreparacion: "6 minutos",
    seoTitle: "Ravioles Fritos Clásicos - Crocantes y Deliciosos | Comida Casera Rosario",
    seoDescription: "Descubre nuestros ravioles fritos clásicos, perfectos para picadas y entradas. ¡Pídelos ya!",
    seoKeywords: ["ravioles fritos", "ravioles para picar", "pasta frita", "delivery rosario"],
  },
  {
    id: "salsa-bolognesa",
    nombre: "Salsa Bolognesa",
    slug: "salsa-bolognesa",
    descripcion: "Clásica salsa bolognesa casera con carne picada, tomate y verduras frescas.",
    precio: 1200,
    categoria: "salsas",
    subcategoria: "salsas-clasicas",
    imagen: "/placeholder.svg?height=300&width=300&text=Salsa Bolognesa",
    ingredientes: ["Tomate", "Carne picada", "Cebolla", "Zanahoria", "Apio", "Vino tinto", "Especias"],
    disponible: true,
    destacado: false,
    orden: 1,
    porciones: 2,
    tiempoPreparacion: "Lista para calentar",
  },
  {
    id: "salsa-pesto",
    nombre: "Salsa Pesto Genovés",
    slug: "salsa-pesto",
    descripcion: "Auténtico pesto genovés con albahaca fresca, piñones, parmesano y aceite de oliva extra virgen.",
    precio: 1500,
    categoria: "salsas",
    subcategoria: "salsas-clasicas",
    imagen: "/placeholder.svg?height=300&width=300&text=Salsa Pesto",
    ingredientes: ["Albahaca", "Piñones", "Parmesano", "Ajo", "Aceite de oliva"],
    disponible: true,
    destacado: false,
    orden: 2,
    porciones: 2,
    tiempoPreparacion: "Lista para servir",
  },
  {
    id: "salsa-cuatro-quesos",
    nombre: "Salsa Cuatro Quesos",
    slug: "salsa-cuatro-quesos",
    descripcion: "Cremosa salsa con una mezcla de cuatro quesos: mozzarella, parmesano, provolone y roquefort.",
    precio: 1400,
    categoria: "salsas",
    subcategoria: "salsas-gourmet",
    imagen: "/placeholder.svg?height=300&width=300&text=Salsa Cuatro Quesos",
    ingredientes: ["Crema", "Mozzarella", "Parmesano", "Provolone", "Roquefort"],
    disponible: true,
    destacado: false,
    orden: 3,
    porciones: 2,
    tiempoPreparacion: "Lista para calentar",
  },
]

const zonas = [
  {
    id: "vgg",
    nombre: "Villa Gobernador Gálvez",
    slug: "vgg",
    descripcion: "Delivery gratuito en VGG. Entrega en 45-60 minutos.",
    costoEnvio: 0,
    tiempoEntrega: "45-60 minutos",
    horarios: [
      { dia: "Lunes a Viernes", desde: "18:00", hasta: "23:00" },
      { dia: "Sábados y Domingos", desde: "12:00", hasta: "23:00" },
    ],
    disponible: true,
    barrios: ["Centro VGG", "Barrio Norte", "Barrio Sur", "Villa Manuelita"],
  },
  {
    id: "rosario-centro",
    nombre: "Rosario Centro",
    slug: "rosario-centro",
    descripcion: "Delivery en el centro de Rosario. Entrega en 30-45 minutos.",
    costoEnvio: 500,
    tiempoEntrega: "30-45 minutos",
    horarios: [
      { dia: "Lunes a Viernes", desde: "18:00", hasta: "23:00" },
      { dia: "Sábados y Domingos", desde: "12:00", hasta: "23:00" },
    ],
    disponible: true,
    barrios: ["Centro", "Pichincha", "Echesortu", "Remedios de Escalada"],
  },
  {
    id: "zona-sur",
    nombre: "Zona Sur",
    slug: "zona-sur",
    descripcion: "Delivery en zona sur de Rosario. Entrega en 50-70 minutos.",
    costoEnvio: 800,
    tiempoEntrega: "50-70 minutos",
    horarios: [
      { dia: "Lunes a Viernes", desde: "18:00", hasta: "23:00" },
      { dia: "Sábados y Domingos", desde: "12:00", hasta: "23:00" },
    ],
    disponible: true,
    barrios: ["Fisherton", "Parque Casado", "Bella Vista"],
  },
  {
    id: "zona-oeste",
    nombre: "Zona Oeste",
    slug: "zona-oeste",
    descripcion: "Delivery en zona oeste de Rosario. Entrega en 60-80 minutos.",
    costoEnvio: 1000,
    tiempoEntrega: "60-80 minutos",
    horarios: [
      { dia: "Lunes a Viernes", desde: "18:00", hasta: "23:00" },
      { dia: "Sábados y Domingos", desde: "12:00", hasta: "23:00" },
    ],
    disponible: true,
    barrios: ["Godoy Cruz", "Lisandro de la Torre", "Rucci"],
  },
]

const packs = [
  {
    id: "pack-raviolada",
    nombre: "Pack Raviolada",
    slug: "pack-raviolada",
    descripcion: "2 docenas de ravioles + salsa + queso rallado. Perfecto para 6-8 personas.",
    precio: 4500,
    precioOriginal: 5200,
    productos: ["ravioles-de-carne"],
    imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
    disponible: true,
    orden: 1,
  },
]

async function seedData() {
  try {
    console.log("🌱 Iniciando carga de datos...")

    // Cargar productos
    console.log("📦 Cargando productos...")
    for (const producto of productos) {
      await setDoc(doc(db, "productos", producto.id), {
        ...producto,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      })
      console.log(`✅ Producto cargado: ${producto.nombre}`)
    }

    // Cargar zonas
    console.log("🗺️ Cargando zonas...")
    for (const zona of zonas) {
      await setDoc(doc(db, "zonas", zona.id), zona)
      console.log(`✅ Zona cargada: ${zona.nombre}`)
    }

    // Cargar packs
    console.log("📦 Cargando packs...")
    for (const pack of packs) {
      await setDoc(doc(db, "packs", pack.id), pack)
      console.log(`✅ Pack cargado: ${pack.nombre}`)
    }

    console.log("🎉 ¡Datos cargados exitosamente!")
  } catch (error) {
    console.error("❌ Error cargando datos:", error)
  }
}

seedData()
