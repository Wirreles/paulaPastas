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

async function createAdmin() {
  try {
    console.log("Creando usuario administrador...")

    // Crear usuario en Auth
    const userCredential = await createUserWithEmailAndPassword(auth, "admin@comidacasera.com", "admin123")

    const user = userCredential.user
    console.log("Usuario creado en Auth:", user.uid)

    // Crear documento en Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      uid: user.uid,
      email: user.email,
      nombre: "Administrador",
      rol: "admin",
      fechaCreacion: new Date(),
    })

    console.log("✅ Usuario administrador creado exitosamente!")
    console.log("Email: admin@comidacasera.com")
    console.log("Password: admin123")
  } catch (error: any) {
    console.error("❌ Error creando administrador:", error.message)
  }
}

createAdmin()
