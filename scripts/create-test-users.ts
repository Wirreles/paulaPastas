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