import { useEffect } from 'react'

export function useCanonical(url: string) {
  useEffect(() => {
    // Asegurar que la URL sea absoluta y sin www
    const canonicalUrl = url.startsWith('http') ? url : `https://paulapastas.com${url}`
    const cleanUrl = canonicalUrl.replace('www.paulapastas.com', 'paulapastas.com')

    // Remover todas las etiquetas canónicas existentes
    const existingCanonicals = document.querySelectorAll('link[rel="canonical"]')
    existingCanonicals.forEach(canonical => canonical.remove())

    // Crear nueva etiqueta canónica
    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = cleanUrl
    canonical.setAttribute('data-canonical', 'true') // Para debugging
    
    // Insertar al principio del head para mayor prioridad
    const head = document.head
    const firstChild = head.firstChild
    if (firstChild) {
      head.insertBefore(canonical, firstChild)
    } else {
      head.appendChild(canonical)
    }

    // Log para debugging
    console.log('🔗 Canonical URL set:', cleanUrl)

    // Cleanup al desmontar el componente
    return () => {
      const canonicalToRemove = document.querySelector('link[rel="canonical"][data-canonical="true"]')
      if (canonicalToRemove) {
        canonicalToRemove.remove()
      }
    }
  }, [url])
}
