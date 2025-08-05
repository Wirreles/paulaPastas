"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Obtener datos adicionales del usuario
        const userDoc = await getDoc(doc(db, "usuarios", user.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data() as Usuario)
        }
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Obtener datos adicionales del usuario inmediatamente después del login
    const userDoc = await getDoc(doc(db, "usuarios", user.uid))
    if (userDoc.exists()) {
      setUserData(userDoc.data() as Usuario)
    }
  }

  const register = async (email: string, password: string, nombre: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Crear documento en Firestore con rol de cliente por defecto
    await setDoc(doc(db, "usuarios", user.uid), {
      uid: user.uid,
      email: user.email,
      nombre: nombre,
      rol: "cliente", // Por defecto todos los registros son clientes
      fechaCreacion: new Date(),
    })
  }

  const logout = async () => {
    await signOut(auth)
  }

  const isAdmin = userData?.rol === "admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        login,
        register,
        logout,
        isAdmin,
      }}
    >
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
