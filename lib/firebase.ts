import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

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

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Configurar para desarrollo
if (typeof window !== "undefined") {
  // Solo en el cliente
  console.log("🔥 Firebase inicializado en el cliente")
}

export default app
