import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
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
const auth = getAuth(app)
const db = getFirestore(app)

const testUsers = [
  {
    email: "cliente1@test.com",
    password: "cliente123",
    nombre: "María González",
    rol: "cliente"
  },
  {
    email: "cliente2@test.com", 
    password: "cliente123",
    nombre: "Juan Pérez",
    rol: "cliente"
  },
  {
    email: "admin@comidacasera.com",
    password: "admin123",
    nombre: "Administrador",
    rol: "admin"
  }
]

async function createTestUsers() {
  console.log("🚀 Creando usuarios de prueba...")

  for (const userData of testUsers) {
    try {
      console.log(`\n📝 Creando usuario: ${userData.email}`)

      // Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
      const user = userCredential.user
      console.log(`✅ Usuario creado en Auth: ${user.uid}`)

      // Crear documento en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        email: user.email,
        nombre: userData.nombre,
        rol: userData.rol,
        fechaCreacion: new Date(),
      })

      console.log(`✅ Documento creado en Firestore para: ${userData.email}`)
      console.log(`📋 Rol: ${userData.rol}`)
      console.log(`🔑 Password: ${userData.password}`)

    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        console.log(`⚠️  Usuario ${userData.email} ya existe`)
      } else {
        console.error(`❌ Error creando usuario ${userData.email}:`, error.message)
      }
    }
  }

  console.log("\n🎉 Proceso completado!")
  console.log("\n📋 Resumen de usuarios:")
  testUsers.forEach(user => {
    console.log(`• ${user.email} (${user.rol}) - Password: ${user.password}`)
  })
}

createTestUsers() 