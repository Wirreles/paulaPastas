import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore"

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

async function fixExistingProducts() {
  try {
    console.log("🔧 Corrigiendo productos existentes...")

    const productosRef = collection(db, "productos")
    const snapshot = await getDocs(productosRef)

    for (const docSnapshot of snapshot.docs) {
      const producto = docSnapshot.data()
      const id = docSnapshot.id

      console.log(`Revisando producto: ${producto.nombre}`)
      console.log(`Categoría: ${producto.categoria}, Subcategoría: ${producto.subcategoria}`)

      // Si el producto no tiene subcategoría, asignar una basada en el nombre o categoría
      if (!producto.subcategoria) {
        let subcategoria = ""

        if (producto.categoria === "rellenas") {
          if (producto.nombre.toLowerCase().includes("raviol")) {
            subcategoria = "ravioles"
          } else if (producto.nombre.toLowerCase().includes("sorrentin")) {
            subcategoria = "sorrentinos"
          } else if (producto.nombre.toLowerCase().includes("lasa")) {
            subcategoria = "lasana"
          } else {
            subcategoria = "ravioles" // default
          }
        } else if (producto.categoria === "sin-relleno") {
          if (producto.nombre.toLowerCase().includes("ñoqui") || producto.nombre.toLowerCase().includes("noqui")) {
            subcategoria = "noquis"
          } else {
            subcategoria = "fideos" // default
          }
        } else if (producto.categoria === "sin-tacc") {
          if (producto.nombre.toLowerCase().includes("raviol")) {
            subcategoria = "ravioles"
          } else {
            subcategoria = "fideos" // default
          }
        }

        if (subcategoria) {
          await updateDoc(doc(db, "productos", id), {
            subcategoria: subcategoria,
            fechaActualizacion: new Date(),
          })
          console.log(`✅ Producto ${producto.nombre} actualizado con subcategoría: ${subcategoria}`)
        }
      } else {
        console.log(`ℹ️ Producto ${producto.nombre} ya tiene subcategoría: ${producto.subcategoria}`)
      }
    }

    console.log("🎉 ¡Corrección de productos completada!")

    // Verificar los productos después de la corrección
    console.log("\n📋 Verificando productos por subcategoría:")
    const finalSnapshot = await getDocs(productosRef)
    const categorias = {}

    finalSnapshot.docs.forEach((doc) => {
      const producto = doc.data()
      const key = `${producto.categoria}/${producto.subcategoria}`
      if (!categorias[key]) categorias[key] = []
      categorias[key].push(producto.nombre)
    })

    Object.entries(categorias).forEach(([key, productos]) => {
      console.log(`${key}: ${productos.length} productos - ${productos.join(", ")}`)
    })
  } catch (error) {
    console.error("❌ Error corrigiendo productos:", error)
  }
}

fixExistingProducts()
