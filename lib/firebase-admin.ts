import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// Usar las mismas credenciales que están en el cliente
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

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: firebaseConfig.projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

export const adminAuth = getAuth()
export const adminDb = getFirestore()
