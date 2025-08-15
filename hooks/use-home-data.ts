import { useState, useEffect, useCallback, useMemo } from 'react'
import { FirebaseService } from '@/lib/firebase-service'
import type { HomeSection } from '@/lib/types'

// Cache local para evitar consultas repetidas
const homeDataCache = {
  productos: null as any[] | null,
  reviews: null as any[] | null,
  homeSections: null as HomeSection[] | null,
  lastFetch: {
    productos: 0,
    reviews: 0,
    homeSections: 0,
  }
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useHomeData() {
  const [productosDestacados, setProductosDestacados] = useState<any[]>([])
  const [homeSections, setHomeSections] = useState<HomeSection[]>([])
  const [reviewsDestacadas, setReviewsDestacadas] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [isLoadingSections, setIsLoadingSections] = useState(true)

  // Función optimizada para cargar productos
  const loadProducts = useCallback(async () => {
    const now = Date.now()
    
    if (homeDataCache.productos && (now - homeDataCache.lastFetch.productos) < CACHE_DURATION) {
      console.log("📦 Usando productos del cache")
      setProductosDestacados(homeDataCache.productos)
      setIsLoadingProducts(false)
      return
    }

    try {
      console.log("🔄 Cargando productos desde Firebase...")
      setIsLoadingProducts(true)
      const data = await FirebaseService.getProductosDestacados()
      
      homeDataCache.productos = data
      homeDataCache.lastFetch.productos = now
      
      setProductosDestacados(data)
    } catch (error) {
      console.error("❌ Error cargando productos:", error)
      setProductosDestacados([])
    } finally {
      setIsLoadingProducts(false)
    }
  }, [])

  // Función optimizada para cargar reseñas
  const loadReviews = useCallback(async () => {
    const now = Date.now()
    
    if (homeDataCache.reviews && (now - homeDataCache.lastFetch.reviews) < CACHE_DURATION) {
      console.log("⭐ Usando reseñas del cache")
      setReviewsDestacadas(homeDataCache.reviews)
      setIsLoadingReviews(false)
      return
    }

    try {
      console.log("🔄 Cargando reseñas desde Firebase...")
      setIsLoadingReviews(true)
      const allReviews = await FirebaseService.getAllReviews()
      
      const reviewsFiltradas = allReviews.filter(review => 
        review.aprobada === true && review.destacada === true
      )
      
      // Usar reseñas filtradas o fallback estático
      const finalReviews = reviewsFiltradas.length > 0 ? reviewsFiltradas : []
      
      homeDataCache.reviews = finalReviews
      homeDataCache.lastFetch.reviews = now
      
      setReviewsDestacadas(finalReviews)
    } catch (error) {
      console.error("❌ Error cargando reseñas:", error)
      setReviewsDestacadas([])
    } finally {
      setIsLoadingReviews(false)
    }
  }, [])

  // Función optimizada para cargar secciones del home
  const loadHomeSections = useCallback(async () => {
    const now = Date.now()
    
    if (homeDataCache.homeSections && (now - homeDataCache.lastFetch.homeSections) < CACHE_DURATION) {
      console.log("🏠 Usando secciones del cache")
      setHomeSections(homeDataCache.homeSections)
      setIsLoadingSections(false)
      return
    }

    try {
      console.log("🔄 Cargando secciones del home...")
      setIsLoadingSections(true)
      const data = await FirebaseService.getHomeSections()
      
      homeDataCache.homeSections = data
      homeDataCache.lastFetch.homeSections = now
      
      setHomeSections(data)
    } catch (error) {
      console.error("❌ Error cargando secciones:", error)
      setHomeSections([])
    } finally {
      setIsLoadingSections(false)
    }
  }, [])

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        loadProducts(),
        loadReviews(),
        loadHomeSections()
      ])
    }
    
    loadAllData()
  }, [loadProducts, loadReviews, loadHomeSections])

  // Memoizar datos calculados
  const productosLimitados = useMemo(() => {
    return productosDestacados.slice(0, 6)
  }, [productosDestacados])

  const reviewsLimitadas = useMemo(() => {
    return reviewsDestacadas.slice(0, 6)
  }, [reviewsDestacadas])

  const isLoading = useMemo(() => {
    return isLoadingProducts || isLoadingReviews || isLoadingSections
  }, [isLoadingProducts, isLoadingReviews, isLoadingSections])

  return {
    productosDestacados: productosLimitados,
    homeSections,
    reviewsDestacadas: reviewsLimitadas,
    isLoading,
    isLoadingProducts,
    isLoadingReviews,
    isLoadingSections,
    // Funciones para recargar datos si es necesario
    reloadProducts: loadProducts,
    reloadReviews: loadReviews,
    reloadSections: loadHomeSections,
  }
}
