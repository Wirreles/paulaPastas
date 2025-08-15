"use client"

import { useState } from "react"
import { Eye, EyeOff, Info } from "lucide-react"

interface ImageDebugInfoProps {
  src: string | undefined
  alt: string
  componentName: string
  className?: string
}

export function ImageDebugInfo({ src, alt, componentName, className = "" }: ImageDebugInfoProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const isFirebaseImage = (url: string): boolean => {
    return url.includes('firebasestorage.googleapis.com')
  }

  const getImageType = (url: string): string => {
    if (!url) return "Sin imagen"
    if (isFirebaseImage(url)) return "Firebase Storage (sin optimización)"
    return "Dominio optimizable (con next/image)"
  }

  const getStatusColor = (url: string): string => {
    if (!url) return "bg-gray-500"
    if (isFirebaseImage(url)) return "bg-green-500"
    return "bg-blue-500"
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Botón de toggle */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Mostrar/Ocultar Debug de Imágenes"
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>

      {/* Panel de información */}
      {isVisible && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 mt-2 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <Info className="w-4 h-4 mr-2 text-blue-500" />
              Debug de Imágenes
            </h3>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showDebug ? "Ocultar" : "Mostrar"} Detalles
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(src || '')}`}></div>
              <span className="text-xs text-gray-700">
                {getImageType(src || '')}
              </span>
            </div>

            {showDebug && (
              <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                <div>
                  <strong>Componente:</strong> {componentName}
                </div>
                <div>
                  <strong>Alt:</strong> {alt.substring(0, 30)}...
                </div>
                {src && (
                  <div>
                    <strong>URL:</strong> {src.substring(0, 40)}...
                  </div>
                )}
                <div>
                  <strong>Estado:</strong> {src ? "✅ Cargada" : "❌ Sin imagen"}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Solo visible en desarrollo
          </div>
        </div>
      )}
    </div>
  )
}
