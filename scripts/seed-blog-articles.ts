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

// Datos de artículos del blog
const blogArticles = [
  {
    id: "como-hacer-salsas-caseras",
    title: "Cómo hacer salsas caseras que enamoran",
    slug: "como-hacer-salsas-caseras",
    excerpt: "Descubrí los secretos de las salsas caseras que transforman cualquier pasta en una experiencia gourmet.",
    content: `
      <h2>Los fundamentos de una buena salsa</h2>
      <p>Una salsa casera bien elaborada puede transformar completamente el sabor de tus pastas. No se trata solo de mezclar ingredientes, sino de entender las técnicas que hacen que cada salsa sea única y memorable.</p>
      
      <h3>Ingredientes de calidad</h3>
      <p>El primer paso para una salsa excepcional es usar ingredientes de la mejor calidad posible. Tomates frescos, hierbas aromáticas recién cortadas, y aceite de oliva extra virgen son la base de cualquier salsa que se precie.</p>
      
      <h3>Técnicas de cocción</h3>
      <p>La paciencia es clave. Una salsa que se cocina a fuego lento durante el tiempo adecuado desarrolla sabores más profundos y complejos. No tengas prisa, deja que los ingredientes se integren naturalmente.</p>
      
      <h2>Recetas básicas para empezar</h2>
      <p>Aquí te compartimos algunas recetas básicas que puedes adaptar según tus preferencias y los ingredientes que tengas disponibles.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop",
    category: "recetas" as const,
    readingTime: 8,
    author: "Paula Pastas",
    publishedAt: new Date("2024-03-15"),
    isPublished: true,
    seoTitle: "Cómo hacer salsas caseras que enamoran | Paula Pastas",
    seoDescription: "Descubrí los secretos de las salsas caseras que transforman cualquier pasta en una experiencia gourmet. Recetas y técnicas paso a paso.",
    seoKeywords: ["salsas caseras", "recetas pasta", "cocina italiana", "gourmet", "paula pastas"],
    order: 1,
  },
  {
    id: "rituales-comida-experiencia",
    title: "Los rituales que transforman una comida en experiencia",
    slug: "rituales-comida-experiencia",
    excerpt: "Descubrí cómo pequeños rituales pueden convertir una simple cena en un momento inolvidable lleno de sabor y conexión.",
    content: `
      <h2>El poder de los rituales culinarios</h2>
      <p>No se trata solo de comer, se trata de crear momentos. Los rituales alrededor de la comida tienen el poder de transformar una simple ingesta de alimentos en una experiencia sensorial completa.</p>
      
      <h3>Preparar la mesa con intención</h3>
      <p>La presentación es fundamental. Una mesa bien preparada, con platos hermosos y una disposición cuidadosa de los elementos, prepara el terreno para una experiencia gastronómica memorable.</p>
      
      <h3>El ritual de la cocina</h3>
      <p>Cocinar no es solo preparar comida, es un acto de amor y creatividad. Tomarse el tiempo para seleccionar ingredientes, prepararlos con cuidado y cocinarlos con atención plena transforma el proceso en una meditación activa.</p>
      
      <h2>Crear conexión a través de la comida</h2>
      <p>Los rituales culinarios tienen el poder de conectar personas, crear recuerdos y fortalecer vínculos. Una cena compartida puede ser el momento perfecto para conversaciones profundas y risas compartidas.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop",
    category: "lifestyle" as const,
    readingTime: 6,
    author: "Paula Pastas",
    publishedAt: new Date("2024-03-10"),
    isPublished: true,
    seoTitle: "Los rituales que transforman una comida en experiencia | Paula Pastas",
    seoDescription: "Descubrí cómo pequeños rituales pueden convertir una simple cena en un momento inolvidable lleno de sabor y conexión.",
    seoKeywords: ["rituales culinarios", "experiencia gastronómica", "cocina consciente", "momentos especiales"],
    order: 2,
  },
  {
    id: "guia-ingredientes-nobles",
    title: "Guía completa para seleccionar ingredientes nobles",
    slug: "guia-ingredientes-nobles",
    excerpt: "Aprende a identificar y seleccionar los mejores ingredientes para elevar tus platos a un nivel gourmet.",
    content: `
      <h2>¿Qué hace que un ingrediente sea noble?</h2>
      <p>Un ingrediente noble no es necesariamente el más caro, sino aquel que ha sido cultivado, seleccionado y procesado con el máximo cuidado y respeto por su naturaleza.</p>
      
      <h3>Harinas de calidad</h3>
      <p>Para las pastas, la harina es fundamental. Busca harinas 00 o 000 para pastas frescas, que tienen el contenido de gluten ideal para una textura perfecta.</p>
      
      <h3>Huevos frescos</h3>
      <p>Los huevos de granja, de gallinas alimentadas naturalmente, no solo son más nutritivos sino que aportan un sabor más rico y una textura superior a tus preparaciones.</p>
      
      <h3>Hierbas y especias</h3>
      <p>Las hierbas frescas y las especias de calidad pueden transformar completamente un plato. Aprende a reconocer las mejores opciones y cómo conservarlas.</p>
      
      <h2>Dónde encontrar ingredientes nobles</h2>
      <p>Te compartimos nuestros lugares favoritos para encontrar ingredientes de la mejor calidad en Rosario y alrededores.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800&h=600&fit=crop",
    category: "consejos" as const,
    readingTime: 7,
    author: "Paula Pastas",
    publishedAt: new Date("2024-03-05"),
    isPublished: true,
    seoTitle: "Guía completa para seleccionar ingredientes nobles | Paula Pastas",
    seoDescription: "Aprende a identificar y seleccionar los mejores ingredientes para elevar tus platos a un nivel gourmet.",
    seoKeywords: ["ingredientes nobles", "cocina gourmet", "calidad alimentaria", "selección ingredientes"],
    order: 3,
  },
  {
    id: "conservar-pastas-frescas",
    title: "Trucos para conservar pastas frescas como el primer día",
    slug: "conservar-pastas-frescas",
    excerpt: "Descubrí los secretos para mantener tus pastas frescas con la misma textura y sabor que el día que las compraste.",
    content: `
      <h2>El arte de conservar pastas frescas</h2>
      <p>Las pastas frescas son delicadas y requieren cuidados especiales para mantener su textura y sabor. Con estos trucos, podrás disfrutarlas como si acabaran de ser elaboradas.</p>
      
      <h3>Congelación correcta</h3>
      <p>La congelación es el método más efectivo para conservar pastas frescas. Asegúrate de que estén completamente secas antes de congelarlas y usa bolsas herméticas para evitar quemaduras por frío.</p>
      
      <h3>Refrigeración temporal</h3>
      <p>Si planeas consumir las pastas en los próximos días, la refrigeración es una buena opción. Mantenlas en un recipiente hermético y consúmelas dentro de los 3-4 días.</p>
      
      <h3>Descongelación adecuada</h3>
      <p>La forma de descongelar las pastas es crucial. Nunca las descongeles a temperatura ambiente, mejor déjalas en la heladera durante la noche o cocínalas directamente desde el freezer.</p>
      
      <h2>Errores comunes a evitar</h2>
      <p>Te contamos los errores más frecuentes que pueden arruinar tus pastas frescas y cómo evitarlos.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
    category: "consejos" as const,
    readingTime: 5,
    author: "Paula Pastas",
    publishedAt: new Date("2024-02-28"),
    isPublished: true,
    seoTitle: "Trucos para conservar pastas frescas como el primer día | Paula Pastas",
    seoDescription: "Descubrí los secretos para mantener tus pastas frescas con la misma textura y sabor que el día que las compraste.",
    seoKeywords: ["conservar pastas", "pastas frescas", "congelación", "refrigeración", "trucos cocina"],
    order: 4,
  },
  {
    id: "historia-pastas-argentina",
    title: "La historia de las pastas en Argentina: tradición e innovación",
    slug: "historia-pastas-argentina",
    excerpt: "Descubrí cómo las pastas llegaron a Argentina y se convirtieron en parte fundamental de nuestra cultura gastronómica.",
    content: `
      <h2>Las raíces italianas en Argentina</h2>
      <p>La historia de las pastas en Argentina está íntimamente ligada a la inmigración italiana de finales del siglo XIX y principios del XX. Los inmigrantes trajeron consigo no solo las recetas, sino toda una cultura gastronómica que se adaptó y evolucionó en nuestro país.</p>
      
      <h3>La adaptación local</h3>
      <p>Las pastas italianas encontraron en Argentina ingredientes locales que las enriquecieron. La combinación de técnicas tradicionales con productos autóctonos dio origen a preparaciones únicas que hoy forman parte de nuestra identidad culinaria.</p>
      
      <h3>La evolución de las recetas</h3>
      <p>Con el tiempo, las recetas familiares se fueron adaptando a los ingredientes disponibles y a los gustos locales. Surgieron preparaciones como los sorrentinos, que aunque inspirados en los ravioles italianos, tienen características propias.</p>
      
      <h2>Las pastas hoy</h2>
      <p>Hoy en día, las pastas siguen siendo fundamentales en la mesa argentina, pero con un enfoque moderno que combina tradición e innovación.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop",
    category: "cultura" as const,
    readingTime: 9,
    author: "Paula Pastas",
    publishedAt: new Date("2024-02-20"),
    isPublished: true,
    seoTitle: "La historia de las pastas en Argentina: tradición e innovación | Paula Pastas",
    seoDescription: "Descubrí cómo las pastas llegaron a Argentina y se convirtieron en parte fundamental de nuestra cultura gastronómica.",
    seoKeywords: ["historia pastas", "cultura argentina", "inmigración italiana", "gastronomía argentina"],
    order: 5,
  },
  {
    id: "cena-romantica-pastas",
    title: "Ideas para una cena romántica con pastas artesanales",
    slug: "cena-romantica-pastas",
    excerpt: "Crea momentos mágicos con estas ideas para una cena romántica perfecta usando pastas artesanales como protagonista.",
    content: `
      <h2>El romance de las pastas artesanales</h2>
      <p>No hay nada más romántico que compartir una comida elaborada con amor y dedicación. Las pastas artesanales, con su textura delicada y sabores auténticos, son perfectas para crear momentos especiales.</p>
      
      <h3>Ambiente y decoración</h3>
      <p>La presentación es fundamental. Velas, flores frescas, música suave y una mesa bien preparada crean el ambiente perfecto para una cena romántica memorable.</p>
      
      <h3>Menú romántico</h3>
      <p>Te sugerimos combinaciones de pastas y salsas que son perfectas para una cena romántica. Desde ravioles rellenos hasta fideos con salsas cremosas, cada opción está pensada para sorprender y deleitar.</p>
      
      <h3>El ritual de la cena</h3>
      <p>Tomarse el tiempo para cocinar juntos, compartir el proceso y disfrutar de cada bocado crea una conexión especial que va más allá de la comida.</p>
      
      <h2>Recetas especiales</h2>
      <p>Te compartimos algunas recetas especialmente seleccionadas para crear momentos románticos inolvidables.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop",
    category: "lifestyle" as const,
    readingTime: 6,
    author: "Paula Pastas",
    publishedAt: new Date("2024-02-15"),
    isPublished: true,
    seoTitle: "Ideas para una cena romántica con pastas artesanales | Paula Pastas",
    seoDescription: "Crea momentos mágicos con estas ideas para una cena romántica perfecta usando pastas artesanales como protagonista.",
    seoKeywords: ["cena romántica", "pastas artesanales", "momentos especiales", "romance", "cocina romántica"],
    order: 6,
  },
]

async function seedBlogArticles() {
  console.log("🌱 Iniciando carga de datos de artículos del blog...")

  try {
    for (const article of blogArticles) {
      await setDoc(doc(db, "blogArticles", article.id), article)
      console.log(`✅ Artículo cargado: ${article.title}`)
    }

    console.log("🎉 ¡Datos de artículos del blog cargados exitosamente!")
  } catch (error) {
    console.error("❌ Error al cargar los artículos:", error)
  }
}

seedBlogArticles() 