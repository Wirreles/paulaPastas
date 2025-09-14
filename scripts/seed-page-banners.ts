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

// Datos de banners para todas las categorías y subcategorías
const pageBanners = [
  // CATEGORÍAS PRINCIPALES
  {
    id: "banner-rellenas",
    name: "Banner Pastas Rellenas",
    description: "Banner principal de la página de Pastas Rellenas",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=600&fit=crop",
    title: "Pastas rellenas caseras artesanales",
    subtitle: "Sabores que sorprenden, texturas que enamoran. Ravioles, sorrentinos y lasagna elaboradas con ingredientes frescos, verduras asadas, vegetales frescos y combinaciones que invitan a imaginar una cena inolvidable. Lo difícil ya está hecho — solo tenes que elegir.",
    pageType: "categoria" as const,
    categoria: "rellenas",
    slug: "rellenas",
    order: 1,
  },
  {
    id: "banner-sin-relleno",
    name: "Banner Pastas Sin Relleno",
    description: "Banner principal de la página de Pastas Sin Relleno",
    imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&h=600&fit=crop",
    title: "Pastas sin relleno caseras artesanales",
    subtitle: "Fideos frescos y ñoquis elaborados diariamente con harina de primera calidad y huevos de granja. La base perfecta para tus salsas favoritas.",
    pageType: "categoria" as const,
    categoria: "sin-relleno",
    slug: "sin-relleno",
    order: 2,
  },
  {
    id: "banner-sin-tacc",
    name: "Banner Pastas Sin TACC",
    description: "Banner principal de la página de Pastas Sin TACC",
    imageUrl: "/placeholder.svg?height=600&width=1200",
    title: "Pastas sin TACC artesanales en Rosario",
    subtitle: "Si estás buscando pastas sin gluten con sabor casero y gourmet en Rosario, llegaste al lugar indicado. En Paula Pastas nos importa acompañar tu mesa.",
    pageType: "categoria" as const,
    categoria: "sin-tacc",
    slug: "sin-tacc",
    order: 3,
  },

  // SUBCATEGORÍAS DE RELLENAS
  {
    id: "banner-lasagna",
    name: "Banner Lasagna",
    description: "Banner de la página de Lasagna",
    imageUrl: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=1200&h=600&fit=crop",
    title: "Lasagna Caseras",
    subtitle: "Lasagna artesanales con capas perfectas de pasta fresca, rellenos caseros y quesos de primera calidad. Listas para hornear en tu casa.",
    pageType: "subcategoria" as const,
    categoria: "rellenas",
    subcategoria: "lasagna",
    slug: "rellenas/lasagna",
    order: 4,
  },
  {
    id: "banner-ravioles",
    name: "Banner Ravioles",
    description: "Banner de la página de Ravioles",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=600&fit=crop",
    title: "Ravioles Artesanales",
    subtitle: "Ravioles elaborados con masa fresca y rellenos tradicionales. Cada pieza es trabajada a mano siguiendo recetas familiares de generaciones.",
    pageType: "subcategoria" as const,
    categoria: "rellenas",
    subcategoria: "ravioles",
    slug: "rellenas/ravioles",
    order: 5,
  },
  {
    id: "banner-sorrentinos",
    name: "Banner Sorrentinos",
    description: "Banner de la página de Sorrentinos",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1200&h=600&fit=crop",
    title: "Sorrentinos Caseros",
    subtitle: "Sorrentinos grandes con rellenos abundantes y sabrosos. Perfectos para compartir en familia con tus salsas favoritas.",
    pageType: "subcategoria" as const,
    categoria: "rellenas",
    subcategoria: "sorrentinos",
    slug: "rellenas/sorrentinos",
    order: 6,
  },

  // SUBCATEGORÍAS DE SIN RELLENO
  {
    id: "banner-noquis",
    name: "Banner Ñoquis",
    description: "Banner de la página de Ñoquis",
    imageUrl: "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=1200&h=600&fit=crop",
    title: "Ñoquis de Papa",
    subtitle: "Ñoquis tradicionales elaborados con papas frescas y la receta secreta de la nonna. Suaves, esponjosos y llenos de sabor.",
    pageType: "subcategoria" as const,
    categoria: "sin-relleno",
    subcategoria: "noquis",
    slug: "sin-relleno/noquis",
    order: 7,
  },
  {
    id: "banner-fideos",
    name: "Banner Fideos",
    description: "Banner de la página de Fideos",
    imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&h=600&fit=crop",
    title: "Fideos Frescos",
    subtitle: "Fideos elaborados diariamente con harina 00 y huevos de granja. La base perfecta para cualquier salsa.",
    pageType: "subcategoria" as const,
    categoria: "sin-relleno",
    subcategoria: "fideos",
    slug: "sin-relleno/fideos",
    order: 8,
  },
  {
    id: "banner-ravioles-fritos",
    name: "Banner Ravioles Fritos",
    description: "Banner de la página de Ravioles Fritos",
    imageUrl: "/placeholder.svg?height=600&width=1200",
    title: "Ravioles Fritos",
    subtitle: "Crocantes por fuera, cremosos por dentro. Perfectos para picadas, encuentros o para darte un gusto diferente.",
    pageType: "subcategoria" as const,
    categoria: "sin-relleno",
    subcategoria: "ravioles-fritos",
    slug: "sin-relleno/ravioles-fritos",
    order: 9,
  },

  // PÁGINAS ESPECIALES
  {
    id: "banner-salsas",
    name: "Banner Salsas",
    description: "Banner de la página de Salsas",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=630&fit=crop",
    title: "Salsas caseras",
    subtitle: "Descubrí nuestras salsas pensadas para potenciar el sabor de cada pasta. Hechas en casa, sin conservantes ni apuros.",
    pageType: "especial" as const,
    slug: "salsas",
    order: 10,
  },
]

async function seedPageBanners() {
  console.log("🌱 Iniciando carga de datos de banners de páginas...")

  try {
    for (const banner of pageBanners) {
      await setDoc(doc(db, "pageBanners", banner.id), banner)
      console.log(`✅ Banner cargado: ${banner.name}`)
    }

    console.log("🎉 ¡Datos de banners de páginas cargados exitosamente!")
  } catch (error) {
    console.error("❌ Error al cargar los banners:", error)
  }
}

seedPageBanners() 