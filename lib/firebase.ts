import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeAuth, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  indexedDBLocalPersistence 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 1. Inicialización de la App (más limpia)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. MEJORA CLAVE: Inicializar Auth sin el iframe
// Usamos initializeAuth en lugar de getAuth para tener control total.
const auth = initializeAuth(app, {
  // Priorizamos IndexedDB (más rápido y moderno) sobre LocalStorage
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  // Deshabilitamos el gestor de redirecciones por defecto que carga el iframe.js
  // Si necesitas login con Google/Facebook via Redirect, esto se configura aparte,
  // pero para email/password o Popup, esto elimina el código innecesario.
  popupRedirectResolver: undefined, 
});

// 3. Inicializar otros servicios
const db = getFirestore(app);
const storage = getStorage(app);

// 4. Exportaciones limpias
export { app, auth, db, storage };

// Log de desarrollo (opcional)
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  console.log("🔥 Firebase optimizado (No-Iframe mode)");
}

export default app;