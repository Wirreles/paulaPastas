import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore"

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

async function fixProductosIngredientes() {
  try {
    console.log("🔧 Corrigiendo productos con ingredientes vacíos...")

    const productosRef = collection(db, "productos")
    const snapshot = await getDocs(productosRef)

    for (const docSnapshot of snapshot.docs) {
      const producto = docSnapshot.data()
      const id = docSnapshot.id

      console.log(`\n📦 Revisando producto: ${producto.nombre}`)
      console.log(`   Categoría: ${producto.categoria}`)
      console.log(`   Subcategoría: ${producto.subcategoria}`)
      console.log(`   Ingredientes actuales:`, producto.ingredientes)

      // Si no tiene ingredientes o está vacío, agregar ingredientes por defecto
      if (!producto.ingredientes || producto.ingredientes.length === 0) {
        let ingredientes = []

        if (producto.nombre.toLowerCase().includes("raviol")) {
          if (producto.nombre.toLowerCase().includes("carne")) {
            ingredientes = ["Masa de huevo", "Carne vacuna", "Cebolla", "Ajo", "Perejil", "Especias"]
          } else if (producto.nombre.toLowerCase().includes("osobuco")) {
            ingredientes = ["Masa de huevo", "Osobuco", "Zanahoria", "Apio", "Cebolla", "Vino tinto", "Hierbas"]
          } else if (producto.nombre.toLowerCase().includes("ricota")) {
            ingredientes = ["Masa de huevo", "Ricota", "Espinaca", "Ajo", "Cebolla", "Nuez moscada"]
          } else if (producto.nombre.toLowerCase().includes("pollo")) {
            ingredientes = ["Masa de huevo", "Pollo", "Cebolla de verdeo", "Apio", "Zanahoria", "Perejil"]
          } else {
            ingredientes = ["Masa de huevo", "Relleno casero", "Especias", "Hierbas aromáticas"]
          }
        } else if (producto.nombre.toLowerCase().includes("sorrentin")) {
          ingredientes = ["Masa de huevo", "Jamón cocido", "Queso cremoso", "Ricota", "Nuez moscada"]
        } else if (producto.nombre.toLowerCase().includes("lasa")) {
          ingredientes = [
            "Pasta de lasagna",
            "Carne picada",
            "Salsa de tomate",
            "Queso mozzarella",
            "Queso parmesano",
            "Bechamel",
          ]
        } else if (producto.nombre.toLowerCase().includes("ñoqui") || producto.nombre.toLowerCase().includes("noqui")) {
          ingredientes = ["Papa", "Harina", "Huevo", "Sal"]
        } else if (producto.nombre.toLowerCase().includes("fideos")) {
          ingredientes = ["Harina 00", "Huevos", "Aceite de oliva", "Sal"]
        } else {
          ingredientes = ["Ingredientes frescos", "Elaboración artesanal"]
        }

        await updateDoc(doc(db, "productos", id), {
          ingredientes: ingredientes,
          fechaActualizacion: new Date(),
        })

        console.log(`✅ Ingredientes agregados:`, ingredientes)
      } else {
        console.log(`ℹ️ Ya tiene ingredientes`)
      }
    }

    console.log("\n🎉 ¡Corrección de ingredientes completada!")

    // Verificar los productos después de la corrección
    console.log("\n📋 Verificando productos finales:")
    const finalSnapshot = await getDocs(productosRef)

    finalSnapshot.docs.forEach((doc) => {
      const producto = doc.data()
      console.log(`\n${producto.nombre}:`)
      console.log(`  Categoría: ${producto.categoria}`)
      console.log(`  Subcategoría: ${producto.subcategoria}`)
      console.log(`  Ingredientes: ${producto.ingredientes?.length || 0} items`)
    })
  } catch (error) {
    console.error("❌ Error corrigiendo productos:", error)
  }
}

fixProductosIngredientes()
