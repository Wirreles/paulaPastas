"use client"

import React, { createContext, useContext, useEffect, useState, useMemo } from "react"
// 1. IMPORTANTE: Eliminamos los imports pesados de 'firebase/auth' de aquí arriba.
// Solo dejamos los tipos y lo que sea indispensable.
import type { User } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "./firebase"
import type { Usuario } from "./types"

interface AuthContextType {
  user: User | null
  userData: Usuario | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, nombre: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 2. CARGA DINÁMICA: Firebase Auth se descarga solo cuando el componente se monta.
    const initAuth = async () => {
      try {
        const { getAuth, onAuthStateChanged } = await import("firebase/auth")
        const { auth } = await import("./firebase") // Importamos la instancia de auth dinámicamente

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          setUser(firebaseUser)

          if (firebaseUser) {
            const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid))
            if (userDoc.exists()) {
              setUserData(userDoc.data() as Usuario)
            }
          } else {
            setUserData(null)
          }
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error("Error inicializando Auth:", error)
        setLoading(false)
      }
    }

    const authPromise = initAuth()

    // Cleanup: esperamos a que la promesa resuelva para ejecutar el unsubscribe
    return () => {
      authPromise.then(unsubscribe => unsubscribe && unsubscribe())
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { signInWithEmailAndPassword, getAuth } = await import("firebase/auth")
    const { auth } = await import("./firebase")

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid))
    if (userDoc.exists()) {
      setUserData(userDoc.data() as Usuario)
    }
  }

  const register = async (email: string, password: string, nombre: string) => {
    const { createUserWithEmailAndPassword } = await import("firebase/auth")
    const { auth } = await import("./firebase")

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    await setDoc(doc(db, "usuarios", firebaseUser.uid), {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      nombre: nombre,
      rol: "cliente",
      fechaCreacion: new Date(),
    })
  }

  const logout = async () => {
    try {
      const { signOut } = await import("firebase/auth")
      const { auth } = await import("./firebase")

      setUser(null)
      setUserData(null)
      await signOut(auth)

      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // 3. OPTIMIZACIÓN DE RENDIMIENTO: Evita re-renders innecesarios en los componentes hijos
  const isAdmin = useMemo(() => userData?.rol === "admin", [userData])

  const value = useMemo(() => ({
    user,
    userData,
    loading,
    login,
    register,
    logout,
    isAdmin,
  }), [user, userData, loading, isAdmin])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}