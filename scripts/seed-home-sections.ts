import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDOV0_TrEFns6Ci9swe_8DtSoEwoy0ffkM",
  authDomain: "inawin-303e7.firebaseapp.com",
  databaseURL: "https://inawin-303e7-default-rtdb.firebaseio.com",
  projectId: "inawin-303e7",
  storageBucket: "inawin-303e7.appspot.com",
  messagingSenderId: "910283475839",
  appId: "1:910283475839:web:382d619f50b6d79b9ae84a",
  measurementId: "G-VM9ZSEMZK6",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const homeSectionsData = [
  {
    id: "hero-main-image",
    name: "Imagen Principal del Hero",
    description: "Imagen de fondo de la sección principal del Home.",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-nmLjf9lsrVLLoGPi3tAkPCsmrkFXUx.png",
    order: 1,
    sectionId: "hero",
  },
  {
    id: "dishes-gallery-1",
    name: "Plato Galería 1",
    description: "Primera imagen de la sección 'Platos que hablan por sí solos'.",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1b2pJ8HfUPa9icBz9wQeeCBWDw3QGt.png", // Usando la imagen proporcionada por el usuario
    order: 1,
    sectionId: "dishes-gallery",
    elementId: "dishes-gallery-1",
  },
  {
    id: "dishes-gallery-2",
    name: "Plato Galería 2",
    description: "Segunda imagen de la sección 'Platos que hablan por sí solos'.",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1b2pJ8HfUPa9icBz9wQeeCBWDw3QGt.png", // Usando la imagen proporcionada por el usuario
    order: 2,
    sectionId: "dishes-gallery",
    elementId: "dishes-gallery-2",
  },
  {
    id: "dishes-gallery-3",
    name: "Plato Galería 3",
    description: "Tercera imagen de la sección 'Platos que hablan por sí solos'.",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1b2pJ8HfUPa9icBz9wQeeCBWDw3QGt.png", // Usando la imagen proporcionada por el usuario
    order: 3,
    sectionId: "dishes-gallery",
    elementId: "dishes-gallery-3",
  },
  {
    id: "dishes-gallery-4",
    name: "Plato Galería 4",
    description: "Cuarta imagen de la sección 'Platos que hablan por sí solos'.",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1b2pJ8HfUPa9icBz9wQeeCBWDw3QGt.png", // Usando la imagen proporcionada por el usuario
    order: 4,
    sectionId: "dishes-gallery",
    elementId: "dishes-gallery-4",
  },
  {
    id: "dishes-gallery-5",
    name: "Plato Galería 5",
    description: "Quinta imagen de la sección 'Platos que hablan por sí solos'.",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1b2pJ8HfUPa9icBz9wQeeCBWDw3QGt.png", // Usando la imagen proporcionada por el usuario
    order: 5,
    sectionId: "dishes-gallery",
    elementId: "dishes-gallery-5",
  },
  {
    id: "dishes-gallery-6",
    name: "Plato Galería 6",
    description: "Sexta imagen de la sección 'Platos que hablan por sí solos'.",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1b2pJ8HfUPa9icBz9wQeeCBWDw3QGt.png", // Usando la imagen proporcionada por el usuario
    order: 6,
    sectionId: "dishes-gallery",
    elementId: "dishes-gallery-6",
  },
  {
    id: "quality-assured-image",
    name: "Imagen Calidad Asegurada",
    description: "Imagen de la sección 'Calidad asegurada'.",
    imageUrl: "/placeholder.svg?height=400&width=600",
    order: 1,
    sectionId: "quality-assured",
  },
  {
    id: "home-category-sorrentinos",
    name: "Categoría Home: Sorrentinos",
    description: "Imagen para la tarjeta de Sorrentinos en la sección '¿Qué pasta casera te gustaría comer hoy?'.",
    imageUrl: "/placeholder.svg?height=300&width=400",
    order: 1,
    sectionId: "home-categories",
    elementId: "sorrentinos",
  },
  {
    id: "home-category-noquis",
    name: "Categoría Home: Ñoquis",
    description: "Imagen para la tarjeta de Ñoquis en la sección '¿Qué pasta casera te gustaría comer hoy?'.",
    imageUrl: "/placeholder.svg?height=300&width=400",
    order: 2,
    sectionId: "home-categories",
    elementId: "noquis",
  },
  {
    id: "home-category-ravioles",
    name: "Categoría Home: Ravioles",
    description: "Imagen para la tarjeta de Ravioles en la sección '¿Qué pasta casera te gustaría comer hoy?'.",
    imageUrl: "/placeholder.svg?height=300&width=400",
    order: 3,
    sectionId: "home-categories",
    elementId: "ravioles",
  },
  {
    id: "home-category-lasagna",
    name: "Categoría Home: Lasagna",
    description: "Imagen para la tarjeta de Lasagna en la sección '¿Qué pasta casera te gustaría comer hoy?'.",
    imageUrl: "/placeholder.svg?height=300&width=400",
    order: 4,
    sectionId: "home-categories",
    elementId: "lasagna",
  },
  {
    id: "home-category-fideos",
    name: "Categoría Home: Fideos",
    description: "Imagen para la tarjeta de Fideos en la sección '¿Qué pasta casera te gustaría comer hoy?'.",
    imageUrl: "/placeholder.svg?height=300&width=400",
    order: 5,
    sectionId: "home-categories",
    elementId: "fideos",
  },
]

async function seedHomeSections() {
  try {
    console.log("🌱 Iniciando carga de datos de secciones del Home...")

    for (const section of homeSectionsData) {
      await setDoc(doc(db, "homeSections", section.id), section)
      console.log(`✅ Sección cargada: ${section.name}`)
    }

    console.log("🎉 ¡Datos de secciones del Home cargados exitosamente!")
  } catch (error) {
    console.error("❌ Error cargando datos de secciones del Home:", error)
  }
}

seedHomeSections()
