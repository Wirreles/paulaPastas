import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
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
