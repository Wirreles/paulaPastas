import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  getDoc,
  setDoc,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "./firebase" // Asegúrate de que 'storage' se exporta desde firebase.ts
import type {
  Producto,
  Pack,
  ZonaEntrega,
  Categoria,
  HomeSection,
  Order, // Importar Order
  PageBanner,
  BlogArticle,
  Usuario, // Importar Usuario
  Review, // Importar Review
  Suscripcion, // Importar Suscripcion
  NewsletterCampaign, // Importar NewsletterCampaign
} from "./types"
import { Logger } from "./logger"

// Cache para optimizar consultas
interface CacheEntry<T> {
  data: T
  timestamp: number
}

class Cache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutos

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
        Logger.debug(`🗑️ Cache invalidado: ${key}`)
      }
    }
  }

  invalidateAll(): void {
    this.cache.clear()
    Logger.debug("🗑️ Cache completamente limpiado")
  }
}

const cache = new Cache()

export class FirebaseService {
  // Productos con cache
  static async getProductos(categoria?: string): Promise<Producto[]> {
    const cacheKey = `productos_${categoria || 'all'}`
    const cached = cache.get<Producto[]>(cacheKey)
    if (cached) {
      Logger.debug(`📦 Cache hit: getProductos(${categoria || 'all'})`)
      return cached
    }

    try {
      const productosRef = collection(db, "productos")
      let q = query(productosRef)

      if (categoria) {
        q = query(productosRef, where("categoria", "==", categoria))
      }

      const snapshot = await getDocs(q)
      const productos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Producto)

      // Ordenar por el campo orden si existe, sino por fecha de creación
      productos.sort((a, b) => {
        if (a.orden !== undefined && b.orden !== undefined) {
          return a.orden - b.orden
        }
        if (a.orden !== undefined) return -1
        if (b.orden !== undefined) return 1
        // Si ninguno tiene orden, ordenar por nombre
        return a.nombre.localeCompare(b.nombre)
      })

      Logger.debug(`📦 FirebaseService.getProductos(${categoria}): Encontrados ${productos.length} productos`)
      cache.set(cacheKey, productos)
      return productos
    } catch (error) {
      Logger.error("❌ Error en getProductos:", error)
      return []
    }
  }

  // Función específica para obtener productos por subcategoría con cache
  static async getProductosPorSubcategoria(categoria: string, subcategoria: string): Promise<Producto[]> {
    const cacheKey = `productos_${categoria}_${subcategoria}`
    const cached = cache.get<Producto[]>(cacheKey)
    if (cached) {
      Logger.debug(`📦 Cache hit: getProductosPorSubcategoria(${categoria}, ${subcategoria})`)
      return cached
    }

    try {
      Logger.debug(`🔍 Buscando productos para categoria: "${categoria}", subcategoria: "${subcategoria}"`)

      const productosRef = collection(db, "productos")
      const q = query(productosRef, where("categoria", "==", categoria))

      const snapshot = await getDocs(q)
      const todosLosProductos = snapshot.docs.map((doc) => {
        const data = doc.data()
        return { id: doc.id, ...data } as Producto
      })

      Logger.debug(`📦 Productos encontrados en categoria "${categoria}":`, todosLosProductos.length)

      // Filtrar por subcategoría
      const productosFiltrados = todosLosProductos.filter((p) => p.subcategoria === subcategoria)

      Logger.debug(`✅ Productos filtrados para subcategoria "${subcategoria}":`, productosFiltrados.length)
      
      cache.set(cacheKey, productosFiltrados)
      return productosFiltrados
    } catch (error) {
      Logger.error("❌ Error fetching productos por subcategoria:", error)
      return []
    }
  }

  static async getProducto(slug: string): Promise<Producto | null> {
    const cacheKey = `producto_${slug}`
    const cached = cache.get<Producto>(cacheKey)
    if (cached) {
      Logger.debug(`📦 Cache hit: getProducto(${slug})`)
      return cached
    }

    try {
      const q = query(collection(db, "productos"), where("slug", "==", slug))
      const snapshot = await getDocs(q)

      if (snapshot.empty) return null

      const doc = snapshot.docs[0]
      const producto = { id: doc.id, ...doc.data() } as Producto
      cache.set(cacheKey, producto)
      return producto
    } catch (error) {
      Logger.error("❌ Error en getProducto:", error)
      return null
    }
  }

  static async getProductosDestacados(): Promise<Producto[]> {
    const cacheKey = 'productos_destacados'
    const cached = cache.get<Producto[]>(cacheKey)
    if (cached) {
      Logger.debug("📦 Cache hit: getProductosDestacados")
      return cached
    }

    try {
      Logger.debug("🔍 FirebaseService: Buscando productos destacados...")
      const q = query(collection(db, "productos"), where("destacado", "==", true), orderBy("orden", "asc"))
      const snapshot = await getDocs(q)
      const productos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Producto)
      
      Logger.debug("📦 FirebaseService: Productos destacados encontrados:", productos.length)
      cache.set(cacheKey, productos)
      return productos
    } catch (error) {
      Logger.error("❌ Error en getProductosDestacados:", error)
      return []
    }
  }

  static async addProducto(producto: Omit<Producto, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "productos"), {
        ...producto,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
      })
      
      // Invalidar cache relacionado con productos
      cache.invalidate('productos')
      
      return docRef.id
    } catch (error) {
      Logger.error("❌ Error en addProducto:", error)
      throw error
    }
  }

  static async updateProducto(id: string, producto: Partial<Producto>): Promise<void> {
    try {
      const docRef = doc(db, "productos", id)
      await updateDoc(docRef, {
        ...producto,
        fechaActualizacion: serverTimestamp(),
      })
      
      // Invalidar cache relacionado con productos
      cache.invalidate('productos')
    } catch (error) {
      Logger.error("❌ Error en updateProducto:", error)
      throw error
    }
  }

  static async deleteProducto(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "productos", id))
      
      // Invalidar cache relacionado con productos
      cache.invalidate('productos')
    } catch (error) {
      Logger.error("❌ Error en deleteProducto:", error)
      throw error
    }
  }

  // Categorías con cache
  static async getCategorias(): Promise<Categoria[]> {
    const cacheKey = 'categorias'
    const cached = cache.get<Categoria[]>(cacheKey)
    if (cached) {
      Logger.debug("📦 Cache hit: getCategorias")
      return cached
    }

    try {
      const q = query(collection(db, "categorias"), orderBy("orden", "asc"))
      const snapshot = await getDocs(q)
      const categorias = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Categoria)
      
      cache.set(cacheKey, categorias)
      return categorias
    } catch (error) {
      Logger.error("❌ Error en getCategorias:", error)
      return []
    }
  }

  static async getCategoria(slug: string): Promise<Categoria | null> {
    const cacheKey = `categoria_${slug}`
    const cached = cache.get<Categoria>(cacheKey)
    if (cached) {
      Logger.debug(`📦 Cache hit: getCategoria(${slug})`)
      return cached
    }

    try {
      const q = query(collection(db, "categorias"), where("slug", "==", slug))
      const snapshot = await getDocs(q)

      if (snapshot.empty) return null

      const doc = snapshot.docs[0]
      const categoria = { id: doc.id, ...doc.data() } as Categoria
      cache.set(cacheKey, categoria)
      return categoria
    } catch (error) {
      Logger.error("❌ Error en getCategoria:", error)
      return null
    }
  }

  // Packs con cache
  static async getPacks(): Promise<Pack[]> {
    const cacheKey = 'packs'
    const cached = cache.get<Pack[]>(cacheKey)
    if (cached) {
      Logger.debug("📦 Cache hit: getPacks")
      return cached
    }

    try {
      const q = query(collection(db, "packs"), orderBy("orden", "asc"))
      const snapshot = await getDocs(q)
      const packs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Pack)
      
      cache.set(cacheKey, packs)
      return packs
    } catch (error) {
      Logger.error("❌ Error en getPacks:", error)
      return []
    }
  }

  // Zonas con cache
  static async getZonas(): Promise<ZonaEntrega[]> {
    const cacheKey = 'zonas'
    const cached = cache.get<ZonaEntrega[]>(cacheKey)
    if (cached) {
      Logger.debug("📦 Cache hit: getZonas")
      return cached
    }

    try {
      const snapshot = await getDocs(collection(db, "zonas"))
      const zonas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ZonaEntrega)
      
      cache.set(cacheKey, zonas)
      return zonas
    } catch (error) {
      Logger.error("❌ Error en getZonas:", error)
      return []
    }
  }



  static async updateHomeSection(id: string, section: Partial<HomeSection>): Promise<void> {
    try {
      const docRef = doc(db, "homeSections", id)
      await updateDoc(docRef, section)
    } catch (error) {
      Logger.error("Error en updateHomeSection:", error)
      throw error
    }
  }

  // NUEVO: Método para subir imágenes a Firebase Storage
  static async uploadImage(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      return downloadURL
    } catch (error) {
      Logger.error("Error uploading image:", error)
      throw error
    }
  }

  // NUEVO: Método para eliminar imágenes de Firebase Storage
  static async deleteImage(url: string): Promise<void> {
    try {
      // Extraer la ruta del objeto de la URL de descarga
      const decodedUrl = decodeURIComponent(url)
      const pathStartIndex = decodedUrl.indexOf("o/") + 2
      const pathEndIndex = decodedUrl.indexOf("?")
      const filePath = decodedUrl.substring(pathStartIndex, pathEndIndex)

      const storageRef = ref(storage, filePath)
      await deleteObject(storageRef)
    } catch (error) {
      Logger.error("Error deleting image:", error)
      // No lanzar error si el archivo no se encuentra, solo registrar
      if ((error as any).code === "storage/object-not-found") {
        Logger.warn("Image not found, skipping deletion:", url)
      } else {
        throw error
      }
    }
  }

  // NUEVO: Método para añadir un pedido
  static async addOrder(order: Omit<Order, "id" | "fechaCreacion" | "estado"> & { deliverySlot?: string | null }): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        ...order,
        estado: "pendiente", // Estado inicial del pedido
        fechaCreacion: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      Logger.error("Error en addOrder:", error)
      throw error
    }
  }

  // NUEVO: Métodos para gestionar banners de páginas
  static async getPageBanners(): Promise<PageBanner[]> {
    try {
      const q = query(collection(db, "pageBanners"), orderBy("order", "asc"))
      const snapshot = await getDocs(q)
      const banners = snapshot.docs.map((doc) => {
        const data = doc.data()
        // Remover el campo 'id' interno si existe para evitar conflictos
        const { id: _, ...docData } = data
        return { id: doc.id, ...docData } as PageBanner
      })
      Logger.debug(`🎨 PageBanners cargados: ${banners.length} banners`)
      return banners
    } catch (error) {
      Logger.error("Error en getPageBanners:", error)
      return []
    }
  }

  static async getPageBannerBySlug(slug: string): Promise<PageBanner | null> {
    try {
      Logger.debug(`🔍 Buscando banner para slug: "${slug}"`)
      const q = query(collection(db, "pageBanners"), where("slug", "==", slug), limit(1))
      const snapshot = await getDocs(q)
      if (snapshot.empty) {
        Logger.debug(`❌ No se encontró banner para slug: "${slug}"`)
        return null
      }
      const doc = snapshot.docs[0]
      const data = doc.data()
      // Remover el campo 'id' interno si existe para evitar conflictos
      const { id: _, ...docData } = data
      const banner = { id: doc.id, ...docData } as PageBanner
      Logger.debug(`✅ Banner encontrado para "${slug}":`, banner.name)
      return banner
    } catch (error) {
      Logger.error("Error en getPageBannerBySlug:", error)
      return null
    }
  }

  static async createPageBanner(banner: Omit<PageBanner, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "pageBanners"), banner)
      Logger.debug(`✅ PageBanner creado: ${docRef.id}`)
      return docRef.id
    } catch (error) {
      Logger.error("Error en createPageBanner:", error)
      throw error
    }
  }

  static async updatePageBanner(id: string, banner: Partial<PageBanner>): Promise<void> {
    try {
      await updateDoc(doc(db, "pageBanners", id), banner)
      Logger.debug(`✅ PageBanner actualizado: ${id}`)
    } catch (error) {
      Logger.error("Error en updatePageBanner:", error)
      throw error
    }
  }

  static async deletePageBanner(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "pageBanners", id))
      Logger.debug(`✅ PageBanner eliminado: ${id}`)
    } catch (error) {
      Logger.error("Error en deletePageBanner:", error)
      throw error
    }
  }

  // NUEVO: Métodos para gestionar artículos del blog
  static async getBlogArticles(): Promise<BlogArticle[]> {
    try {
      const q = query(collection(db, "blogArticles"), orderBy("order", "asc"))
      const snapshot = await getDocs(q)
      const articles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as BlogArticle)
      Logger.debug(`📝 BlogArticles cargados: ${articles.length} artículos`)
      return articles
    } catch (error) {
      Logger.error("Error en getBlogArticles:", error)
      return []
    }
  }

  static async getPublishedBlogArticles(): Promise<BlogArticle[]> {
    try {
      const q = query(
        collection(db, "blogArticles"), 
        where("isPublished", "==", true), 
        orderBy("publishedAt", "desc")
      )
      const snapshot = await getDocs(q)
      const articles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as BlogArticle)
      Logger.debug(`📝 Artículos publicados cargados: ${articles.length} artículos`)
      return articles
    } catch (error) {
      Logger.error("Error en getPublishedBlogArticles:", error)
      return []
    }
  }

  static async getBlogArticleBySlug(slug: string): Promise<BlogArticle | null> {
    try {
      Logger.debug(`🔍 Buscando artículo para slug: "${slug}"`)
      const q = query(collection(db, "blogArticles"), where("slug", "==", slug), limit(1))
      const snapshot = await getDocs(q)
      if (snapshot.empty) {
        Logger.debug(`❌ No se encontró artículo para slug: "${slug}"`)
        return null
      }
      const article = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogArticle
      Logger.debug(`✅ Artículo encontrado para "${slug}":`, article.title)
      return article
    } catch (error) {
      Logger.error("Error en getBlogArticleBySlug:", error)
      return null
    }
  }

  static async createBlogArticle(article: Omit<BlogArticle, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "blogArticles"), article)
      Logger.debug(`✅ BlogArticle creado: ${docRef.id}`)
      return docRef.id
    } catch (error) {
      Logger.error("Error en createBlogArticle:", error)
      throw error
    }
  }

  static async updateBlogArticle(id: string, article: Partial<BlogArticle>): Promise<void> {
    try {
      await updateDoc(doc(db, "blogArticles", id), article)
      Logger.debug(`✅ BlogArticle actualizado: ${id}`)
    } catch (error) {
      Logger.error("Error en updateBlogArticle:", error)
      throw error
    }
  }

  static async deleteBlogArticle(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "blogArticles", id))
      Logger.debug(`✅ BlogArticle eliminado: ${id}`)
    } catch (error) {
      Logger.error("Error en deleteBlogArticle:", error)
      throw error
    }
  }

  // Métodos para el dashboard de usuario
  static async getPedidosByUser(userId: string, forceRefresh: boolean = false): Promise<Order[]> {
    const cacheKey = `pedidos_${userId}`
    
    // Si no se fuerza la recarga, verificar cache
    if (!forceRefresh) {
      const cached = cache.get<Order[]>(cacheKey)
      if (cached) {
        Logger.debug(`📦 Cache hit: getPedidosByUser(${userId})`)
        return cached
      }
    } else {
      Logger.debug(`🔄 Forzando recarga: getPedidosByUser(${userId})`)
      // Limpiar cache específico
      cache.invalidate(cacheKey)
    }

    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("fechaCreacion", "desc")
      )
      const snapshot = await getDocs(q)
      const pedidos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order)
      
      cache.set(cacheKey, pedidos)
      Logger.debug(`📦 Pedidos cargados para usuario ${userId}:`, pedidos.length)
      return pedidos
    } catch (error) {
      Logger.error("Error en getPedidosByUser:", error)
      return []
    }
  }

  static async getDireccionesByUser(userId: string): Promise<any[]> {
    try {
      Logger.debug(`🔍 Buscando direcciones para userId: ${userId}`)
      
      // Primero intentar sin orderBy para evitar problemas con timestamps
      const q = query(
        collection(db, "direcciones"),
        where("userId", "==", userId)
      )
      const snapshot = await getDocs(q)
      const direcciones = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      
      Logger.debug(`✅ Direcciones encontradas: ${direcciones.length}`)
      direcciones.forEach((dir, index) => {
        Logger.debug(`  ${index + 1}. ${dir.calle} ${dir.numero}, ${dir.ciudad}`)
      })
      
      return direcciones
    } catch (error) {
      Logger.error("Error en getDireccionesByUser:", error)
      return []
    }
  }

  static async addDireccion(direccion: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "direcciones"), {
        ...direccion,
        fechaCreacion: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      Logger.error("Error en addDireccion:", error)
      throw error
    }
  }

  static async updateDireccion(id: string, direccion: any): Promise<void> {
    try {
      await updateDoc(doc(db, "direcciones", id), {
        ...direccion,
        fechaActualizacion: serverTimestamp(),
      })
    } catch (error) {
      Logger.error("Error en updateDireccion:", error)
      throw error
    }
  }

  static async deleteDireccion(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "direcciones", id))
    } catch (error) {
      Logger.error("Error en deleteDireccion:", error)
      throw error
    }
  }

  static async updateUserProfile(userId: string, profileData: any): Promise<void> {
    try {
      await updateDoc(doc(db, "usuarios", userId), {
        ...profileData,
        fechaActualizacion: serverTimestamp(),
      })
    } catch (error) {
      Logger.error("Error en updateUserProfile:", error)
      throw error
    }
  }

  static async getOrderByExternalReference(externalReference: string): Promise<Order | null> {
    try {
      const q = query(
        collection(db, "orders"),
        where("externalReference", "==", externalReference),
        limit(1)
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return null
      }
      
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Order
    } catch (error) {
      Logger.error("Error en getOrderByExternalReference:", error)
      return null
    }
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      const orderRef = doc(db, "orders", orderId)
      await updateDoc(orderRef, { estado: status })
      
      // Invalidar cache específico de pedidos
      cache.invalidate('pedidos')
      
      Logger.log("✅ Estado de pedido actualizado y cache invalidado:", orderId, "->", status)
    } catch (error) {
      Logger.error("Error actualizando estado del pedido:", error)
      throw error
    }
  }

  // Métodos para MercadoPago
  static async getProductById(productId: string): Promise<any> {
    try {
      const productRef = doc(db, "productos", productId)
      const productDoc = await getDoc(productRef)
      
      if (!productDoc.exists()) {
        return null
      }
      
      return { id: productDoc.id, ...productDoc.data() }
    } catch (error) {
      Logger.error("Error obteniendo producto por ID:", error)
      return null
    }
  }

  static async updateProductStock(productId: string, newStock: number): Promise<void> {
    try {
      const productRef = doc(db, "productos", productId)
      await updateDoc(productRef, { stock: newStock })
    } catch (error) {
      Logger.error("Error actualizando stock del producto:", error)
      throw error
    }
  }

  static async addPendingPurchase(purchaseId: string, purchaseData: any): Promise<void> {
    try {
      const purchaseRef = doc(db, "pending_purchases", purchaseId)
      await setDoc(purchaseRef, purchaseData)
    } catch (error) {
      Logger.error("Error agregando compra pendiente:", error)
      throw error
    }
  }

  static async getPendingPurchase(purchaseId: string): Promise<any> {
    try {
      const purchaseRef = doc(db, "pending_purchases", purchaseId)
      const purchaseDoc = await getDoc(purchaseRef)
      
      if (!purchaseDoc.exists()) {
        return null
      }
      
      return { id: purchaseDoc.id, ...purchaseDoc.data() }
    } catch (error) {
      Logger.error("Error obteniendo compra pendiente:", error)
      return null
    }
  }
  // Nuevo método para agregar compra DIRECTAMENTE a purchases (para el refactor)
  // Reutilizamos addCompletedPurchase pero permitimos que se llame desde el inicio
  static async addCompletedPurchase(purchaseData: any): Promise<string> {
    try {
      // Asegurar que tenga fecha de creación
      const dataToSave = {
        ...purchaseData,
        createdAt: purchaseData.createdAt || new Date()
      }
      
      const docRef = await addDoc(collection(db, "purchases"), dataToSave)
      Logger.log("✅ Compra creada en purchases con ID:", docRef.id)
      
      // Invalidar cache de compras
      cache.invalidate('compras')
      
      return docRef.id
    } catch (error) {
      Logger.error("Error guardando compra en purchases:", error)
      throw error
    }
  }

  // Nuevo método para obtener una compra por ID (cualquier estado)
  static async getPurchaseById(purchaseId: string): Promise<any> {
    try {
      const purchaseRef = doc(db, "purchases", purchaseId)
      const purchaseDoc = await getDoc(purchaseRef)
      
      if (!purchaseDoc.exists()) {
        return null
      }
      
      return { id: purchaseDoc.id, ...purchaseDoc.data() }
    } catch (error) {
      Logger.error("Error obteniendo compra:", error)
      return null
    }
  }

  // Nuevo método para actualizar una compra existente
  static async updatePurchase(purchaseId: string, updateData: any): Promise<void> {
    try {
      const purchaseRef = doc(db, "purchases", purchaseId)
      await updateDoc(purchaseRef, updateData)
      
      // Invalidar cache de compras
      cache.invalidate('compras')
      
      Logger.log(`✅ Compra actualizada: ${purchaseId}`)
    } catch (error) {
      Logger.error("Error actualizando compra:", error)
      throw error
    }
  }

  static async deletePendingPurchase(purchaseId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "pending_purchases", purchaseId))
      Logger.debug(`🗑️ Compra pendiente eliminada: ${purchaseId}`)
    } catch (error) {
      Logger.error("Error eliminando compra pendiente:", error)
    }
  }

  static async addFailedPurchase(purchaseData: any): Promise<string> {
    try {
      const purchaseRef = await addDoc(collection(db, "failed_purchases"), purchaseData)
      return purchaseRef.id
    } catch (error) {
      Logger.error("Error agregando compra fallida:", error)
      throw error
    }
  }

  // Método para obtener compras completadas por usuario
  static async getCompletedPurchasesByUser(userId: string, forceRefresh: boolean = false): Promise<any[]> {
    const cacheKey = `compras_${userId}`
    
    // Si no se fuerza la recarga, verificar cache
    if (!forceRefresh) {
      const cached = cache.get<any[]>(cacheKey)
      if (cached) {
        Logger.debug(`📦 Cache hit: getCompletedPurchasesByUser(${userId})`)
        return cached
      }
    } else {
      Logger.debug(`🔄 Forzando recarga: getCompletedPurchasesByUser(${userId})`)
      // Limpiar cache específico
      cache.invalidate(cacheKey)
    }

    try {
      const q = query(
        collection(db, "purchases"),
        where("buyerId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(10) // Limitar a los últimos 10 pedidos
      )
      const snapshot = await getDocs(q)
      const compras = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      
      cache.set(cacheKey, compras)
      Logger.debug(`📦 Compras cargadas para usuario ${userId}:`, compras.length)
      return compras
    } catch (error) {
      Logger.error("Error en getCompletedPurchasesByUser:", error)
      return []
    }
  }

  // Método para actualizar el estado de una compra
  static async updatePurchaseStatus(purchaseId: string, status: string): Promise<void> {
    try {
      const purchaseRef = doc(db, "purchases", purchaseId)
      await updateDoc(purchaseRef, { 
        orderStatus: status,
        updatedAt: new Date()
      })
      
      // Invalidar cache específico de compras
      cache.invalidate('compras')
      
      Logger.log("✅ Estado de compra actualizado y cache invalidado:", purchaseId, "->", status)
    } catch (error) {
      Logger.error("Error actualizando estado de la compra:", error)
      throw error
    }
  }

  // Método para obtener todas las compras (para el admin)
  static async getAllPurchases(): Promise<any[]> {
    try {
      const q = query(
        collection(db, "purchases"),
        orderBy("createdAt", "desc")
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      Logger.error("Error en getAllPurchases:", error)
      return []
    }
  }

  // Métodos para gestión de usuarios
  static async getUsuarios(): Promise<Usuario[]> {
    try {
      const usuariosRef = collection(db, "usuarios")
      const q = query(usuariosRef, orderBy("fechaCreacion", "desc"))
      const snapshot = await getDocs(q)
      const usuarios = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }) as Usuario)

      Logger.debug(`FirebaseService.getUsuarios(): Encontrados ${usuarios.length} usuarios`)
      return usuarios
    } catch (error) {
      Logger.error("Error en getUsuarios:", error)
      return []
    }
  }

  static async getUsuario(uid: string): Promise<Usuario | null> {
    try {
      const usuarioDoc = await getDoc(doc(db, "usuarios", uid))
      if (!usuarioDoc.exists()) return null

      return { uid: usuarioDoc.id, ...usuarioDoc.data() } as Usuario
    } catch (error) {
      Logger.error("Error en getUsuario:", error)
      return null
    }
  }

  static async updateUsuario(uid: string, usuarioData: Partial<Usuario>): Promise<void> {
    try {
      await updateDoc(doc(db, "usuarios", uid), {
        ...usuarioData,
        fechaActualizacion: serverTimestamp(),
      })
      Logger.debug(`Usuario ${uid} actualizado exitosamente`)
    } catch (error) {
      Logger.error("Error en updateUsuario:", error)
      throw error
    }
  }

  static async banUsuario(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, "usuarios", uid), {
        baneado: true,
        fechaBaneo: serverTimestamp(),
      })
      Logger.debug(`Usuario ${uid} baneado exitosamente`)
    } catch (error) {
      Logger.error("Error en banUsuario:", error)
      throw error
    }
  }

  static async unbanUsuario(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, "usuarios", uid), {
        baneado: false,
        fechaBaneo: null,
      })
      Logger.debug(`Usuario ${uid} desbaneado exitosamente`)
    } catch (error) {
      Logger.error("Error en unbanUsuario:", error)
      throw error
    }
  }

  // Métodos para manejar reseñas
  static async addReview(review: Omit<Review, "id" | "fechaCreacion">): Promise<string> {
    try {
      const reviewData = {
        ...review,
        fechaCreacion: serverTimestamp(),
      }
      const docRef = await addDoc(collection(db, "reviews"), reviewData)
      return docRef.id
    } catch (error) {
      Logger.error("Error al agregar reseña:", error)
      throw error
    }
  }

  static async getReviewsByProduct(productId: string): Promise<Review[]> {
    try {
      const reviewsRef = collection(db, "reviews")
      const q = query(
        reviewsRef,
        where("productoId", "==", productId),
        where("aprobada", "==", true), // Solo reseñas aprobadas
        orderBy("fechaCreacion", "desc")
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Review)
    } catch (error) {
      Logger.error("Error al obtener reseñas del producto:", error)
      return []
    }
  }

  static async getReviewsByUser(userId: string): Promise<Review[]> {
    try {
      const reviewsRef = collection(db, "reviews")
      const q = query(
        reviewsRef,
        where("userId", "==", userId),
        orderBy("fechaCreacion", "desc")
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Review)
    } catch (error) {
      Logger.error("Error al obtener reseñas del usuario:", error)
      throw error
    }
  }

  static async updateReviewStatus(reviewId: string, aprobada: boolean, aprobadaPor?: string): Promise<void> {
    try {
      const reviewRef = doc(db, "reviews", reviewId)
      await updateDoc(reviewRef, {
        aprobada,
        fechaAprobacion: aprobada ? serverTimestamp() : null,
        aprobadaPor: aprobada ? aprobadaPor : null,
      })
      
      // Invalidar cache de reseñas
      cache.invalidate('reviews')
      cache.invalidate('all_reviews')
      Logger.log("✅ Estado de reseña actualizado y cache invalidado:", reviewId)
    } catch (error) {
      Logger.error("Error al actualizar estado de reseña:", error)
      throw error
    }
  }

  static async toggleReviewDestacada(reviewId: string, destacada: boolean): Promise<void> {
    try {
      const reviewRef = doc(db, "reviews", reviewId)
      await updateDoc(reviewRef, {
        destacada,
      })
      
      // Invalidar cache de reseñas
      cache.invalidate('reviews')
      cache.invalidate('all_reviews')
      Logger.log("✅ Estado destacado de reseña actualizado y cache invalidado:", reviewId)
    } catch (error) {
      Logger.error("Error al cambiar estado destacado de reseña:", error)
      throw error
    }
  }

  static async deleteReview(reviewId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "reviews", reviewId))
      
      // Invalidar cache de reseñas
      cache.invalidate('reviews')
      cache.invalidate('all_reviews')
      Logger.log("✅ Reseña eliminada y cache invalidado:", reviewId)
    } catch (error) {
      Logger.error("Error al eliminar reseña:", error)
      throw error
    }
  }

  // Reseñas con cache
  static async getAllReviews(): Promise<Review[]> {
    const cacheKey = 'all_reviews'
    const cached = cache.get<Review[]>(cacheKey)
    if (cached) {
      Logger.debug("📦 Cache hit: getAllReviews")
      return cached
    }

    try {
      const reviewsRef = collection(db, "reviews")
      const q = query(reviewsRef, orderBy("fechaCreacion", "desc"))
      const querySnapshot = await getDocs(q)
      
      const reviews: Review[] = []
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data(),
          fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
        } as Review)
      })
      
      cache.set(cacheKey, reviews)
      return reviews
    } catch (error) {
      Logger.error("❌ Error obteniendo todas las reseñas:", error)
      throw error
    }
  }

  // Secciones del home con cache
  static async getHomeSections(): Promise<HomeSection[]> {
    const cacheKey = 'home_sections'
    const cached = cache.get<HomeSection[]>(cacheKey)
    if (cached) {
      Logger.debug("📦 Cache hit: getHomeSections")
      return cached
    }

    try {
      Logger.debug("🔍 FirebaseService: Iniciando getHomeSections...")
      const sectionsRef = collection(db, "homeSections")
      Logger.debug("🔍 FirebaseService: Referencia a colección creada")
      
      // Primero intentar sin ordenamiento para ver si hay datos
      Logger.debug("🔍 FirebaseService: Obteniendo todas las secciones sin ordenamiento...")
      const snapshot = await getDocs(sectionsRef)
      Logger.debug("🔍 FirebaseService: Snapshot obtenido, documentos encontrados:", snapshot.docs.length)
      
      if (snapshot.empty) {
        Logger.warn("⚠️ FirebaseService: No se encontraron secciones del home")
        return []
      }

      // Mapear los documentos
      const sections = snapshot.docs.map((doc) => {
        const data = doc.data()
        Logger.debug("🔍 FirebaseService: Documento mapeado:", { id: doc.id, ...data })
        return { id: doc.id, ...data } as HomeSection
      })
      
      Logger.debug("✅ FirebaseService: Secciones del home obtenidas exitosamente:", sections.length)
      Logger.debug("📋 FirebaseService: Secciones:", sections.map(s => ({ id: s.id, name: s.name, sectionId: s.sectionId })))
      
      // Ordenar por orden si existe, sino por nombre
      const sortedSections = sections.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order
        }
        return (a.name || '').localeCompare(b.name || '')
      })
      
      Logger.debug("✅ FirebaseService: Secciones ordenadas:", sortedSections.length)
      
      cache.set(cacheKey, sortedSections)
      return sortedSections
    } catch (error) {
      Logger.error("❌ FirebaseService: Error obteniendo secciones del home:", error)
      Logger.error("❌ FirebaseService: Stack trace:", error instanceof Error ? error.stack : "No stack trace")
      return []
    }
  }

  // ===== FUNCIONES PARA NEWSLETTER Y SUSCRIPCIONES =====

  /**
   * Crear una nueva suscripción
   */
  static async createSuscripcion(email: string, origen: "web" | "admin" | "csv" = "web"): Promise<string> {
    try {
      // Verificar si ya existe una suscripción con ese email
      const existingSubscription = await this.getSuscripcionByEmail(email)
      if (existingSubscription) {
        throw new Error("Ya existe una suscripción con este email")
      }

      const suscripcionData = {
        email: email.toLowerCase().trim(),
        fechaSuscripcion: new Date(),
        estado: "activo" as const,
        origen,
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }

      const docRef = await addDoc(collection(db, "suscripciones"), suscripcionData)
      Logger.log("✅ Suscripción creada exitosamente:", docRef.id)
      return docRef.id
    } catch (error) {
      Logger.error("❌ Error al crear suscripción:", error)
      throw error
    }
  }

  /**
   * Obtener suscripción por email
   */
  static async getSuscripcionByEmail(email: string): Promise<Suscripcion | null> {
    try {
      const q = query(
        collection(db, "suscripciones"),
        where("email", "==", email.toLowerCase().trim())
      )
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }

      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as Suscripcion
    } catch (error) {
      Logger.error("❌ Error al obtener suscripción por email:", error)
      return null
    }
  }

  /**
   * Obtener todas las suscripciones
   */
  static async getAllSuscripciones(): Promise<Suscripcion[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "suscripciones"))
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Suscripcion[]
    } catch (error) {
      Logger.error("❌ Error al obtener suscripciones:", error)
      return []
    }
  }

  /**
   * Obtener suscripciones activas
   */
  static async getSuscripcionesActivas(): Promise<Suscripcion[]> {
    try {
      const q = query(
        collection(db, "suscripciones"),
        where("activo", "==", true),
        where("estado", "==", "activo")
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Suscripcion[]
    } catch (error) {
      Logger.error("❌ Error al obtener suscripciones activas:", error)
      return []
    }
  }

  /**
   * Actualizar estado de suscripción
   */
  static async updateSuscripcionEstado(
    id: string, 
    estado: "activo" | "inactivo" | "dado-de-baja",
    motivoBaja?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        estado,
        activo: estado === "activo",
        fechaActualizacion: new Date()
      }

      if (estado === "dado-de-baja") {
        updateData.fechaBaja = new Date()
        updateData.motivoBaja = motivoBaja || "Baja voluntaria"
      }

      await updateDoc(doc(db, "suscripciones", id), updateData)
      Logger.log("✅ Estado de suscripción actualizado:", id, estado)
      return true
    } catch (error) {
      Logger.error("❌ Error al actualizar estado de suscripción:", error)
      return false
    }
  }

  /**
   * Eliminar suscripción
   */
  static async deleteSuscripcion(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, "suscripciones", id))
      Logger.log("✅ Suscripción eliminada:", id)
      return true
    } catch (error) {
      Logger.error("❌ Error al eliminar suscripción:", error)
      return false
    }
  }

  /**
   * Crear campaña de newsletter
   */
  static async createNewsletterCampaign(campaignData: Omit<NewsletterCampaign, "id" | "fechaCreacion" | "fechaActualizacion">): Promise<string> {
    try {
      const campaign = {
        ...campaignData,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }

      const docRef = await addDoc(collection(db, "newsletter_campaigns"), campaign)
      Logger.log("✅ Campaña de newsletter creada:", docRef.id)
      return docRef.id
    } catch (error) {
      Logger.error("❌ Error al crear campaña de newsletter:", error)
      throw error
    }
  }

  /**
   * Obtener todas las campañas de newsletter
   */
  static async getAllNewsletterCampaigns(): Promise<NewsletterCampaign[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "newsletter_campaigns"))
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsletterCampaign[]
    } catch (error) {
      Logger.error("❌ Error al obtener campañas de newsletter:", error)
      return []
    }
  }

  /**
   * Actualizar campaña de newsletter
   */
  static async updateNewsletterCampaign(id: string, updateData: Partial<NewsletterCampaign>): Promise<boolean> {
    try {
      await updateDoc(doc(db, "newsletter_campaigns", id), {
        ...updateData,
        fechaActualizacion: new Date()
      })
      Logger.log("✅ Campaña de newsletter actualizada:", id)
      return true
    } catch (error) {
      Logger.error("❌ Error al actualizar campaña de newsletter:", error)
      return false
    }
  }

  /**
   * Eliminar campaña de newsletter
   */
  static async deleteNewsletterCampaign(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, "newsletter_campaigns", id))
      Logger.log("✅ Campaña de newsletter eliminada:", id)
      return true
    } catch (error) {
      Logger.error("❌ Error al eliminar campaña de newsletter:", error)
      return false
    }
  }

  // ===== GESTIÓN DE CUPONES =====

  /**
   * Generar cupón automático para nuevos suscriptores del newsletter
   */
  static async generateWelcomeCoupon(email: string): Promise<string> {
    try {
      // Generar código único para el cupón
      const timestamp = Date.now().toString(36)
      const randomStr = Math.random().toString(36).substring(2, 8)
      const codigo = `WELCOME${timestamp}${randomStr}`.toUpperCase()
      
      // Configurar cupón de bienvenida
      const welcomeCoupon = {
        codigo,
        descripcion: `Cupón de bienvenida para ${email}`,
        descuento: 10, // 10% de descuento
        tipoDescuento: "porcentaje" as const,
        montoMinimo: 0, // Sin monto mínimo
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Válido por 30 días
        maxUsos: 1, // Solo una vez
        usosActuales: 0,
        usado: false,
        activo: true,
        origen: "newsletter-welcome" as const, // Nuevo campo para identificar origen
        emailDestinatario: email, // Email del suscriptor
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }

      const docRef = await addDoc(collection(db, "cupones"), welcomeCoupon)
      Logger.log("✅ Cupón de bienvenida generado:", docRef.id, "para:", email)
      return docRef.id
    } catch (error) {
      Logger.error("❌ Error generando cupón de bienvenida:", error)
      throw error
    }
  }

  /**
   * Crear cupón de descuento
   */
  static async createCoupon(couponData: any): Promise<string> {
    try {
      const coupon = {
        ...couponData,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }

      const docRef = await addDoc(collection(db, "cupones"), coupon)
      Logger.log("✅ Cupón creado:", docRef.id)
      return docRef.id
    } catch (error) {
      Logger.error("❌ Error al crear cupón:", error)
      throw error
    }
  }

  /**
   * Obtener todos los cupones
   */
  static async getAllCoupons(): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "cupones"))
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      Logger.error("❌ Error al obtener cupones:", error)
      return []
    }
  }

  /**
   * Obtener cupón por código
   */
  static async getCouponByCode(codigo: string): Promise<any | null> {
    try {
      const q = query(collection(db, "cupones"), where("codigo", "==", codigo.toUpperCase()))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }
      
      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      }
    } catch (error) {
      Logger.error("❌ Error al obtener cupón por código:", error)
      return null
    }
  }

  /**
   * Obtener cupón por ID
   */
  static async getCouponById(id: string): Promise<any | null> {
    try {
      const docRef = doc(db, "cupones", id)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        return null
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      }
    } catch (error) {
      Logger.error("❌ Error al obtener cupón por ID:", error)
      return null
    }
  }

  /**
   * Actualizar cupón
   */
  static async updateCoupon(id: string, updateData: any): Promise<boolean> {
    try {
      await updateDoc(doc(db, "cupones", id), {
        ...updateData,
        fechaActualizacion: new Date()
      })
      Logger.log("✅ Cupón actualizado:", id)
      return true
    } catch (error) {
      Logger.error("❌ Error al actualizar cupón:", error)
      return false
    }
  }

  /**
   * Eliminar cupón
   */
  static async deleteCoupon(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, "cupones", id))
      Logger.log("✅ Cupón eliminado:", id)
      return true
    } catch (error) {
      Logger.error("❌ Error al eliminar cupón:", error)
      return false
    }
  }

  /**
   * Marcar cupón como usado
   */
  static async markCouponAsUsed(id: string): Promise<boolean> {
    try {
      const cuponRef = doc(db, "cupones", id)
      const cuponDoc = await getDoc(cuponRef)
      
      if (!cuponDoc.exists()) {
        throw new Error("Cupón no encontrado")
      }
      
      const cuponData = cuponDoc.data()
      const usosActuales = (cuponData.usosActuales || 0) + 1
      
      await updateDoc(cuponRef, {
        usosActuales,
        usado: usosActuales >= cuponData.maxUsos,
        fechaActualizacion: new Date()
      })
      
      Logger.log("✅ Cupón marcado como usado:", id, "Usos:", usosActuales)
      return true
    } catch (error) {
      Logger.error("❌ Error al marcar cupón como usado:", error)
      return false
    }
  }

  /**
   * Validar cupón (verificar si es válido para usar)
   */
  static async validateCoupon(codigo: string, montoCompra: number): Promise<{ valid: boolean; cupon?: any; error?: string }> {
    try {
      const cupon = await this.getCouponByCode(codigo)
      
      if (!cupon) {
        return { valid: false, error: "Cupón no encontrado" }
      }
      
      if (!cupon.activo) {
        return { valid: false, error: "Cupón inactivo" }
      }
      
      if (cupon.usado) {
        return { valid: false, error: "Cupón ya utilizado" }
      }
      
      const now = new Date()
      const fechaInicio = new Date(cupon.fechaInicio.seconds * 1000)
      const fechaFin = new Date(cupon.fechaFin.seconds * 1000)
      
      if (now < fechaInicio) {
        return { valid: false, error: "Cupón aún no válido" }
      }
      
      if (now > fechaFin) {
        return { valid: false, error: "Cupón expirado" }
      }
      
      if (cupon.usosActuales >= cupon.maxUsos) {
        return { valid: false, error: "Cupón agotado" }
      }
      
      if (cupon.montoMinimo > 0 && montoCompra < cupon.montoMinimo) {
        return { valid: false, error: `Monto mínimo requerido: $${cupon.montoMinimo}` }
      }
      
      return { valid: true, cupon }
    } catch (error) {
      Logger.error("❌ Error validando cupón:", error)
      return { valid: false, error: "Error validando cupón" }
    }
  }

  /**
   * Limpiar cache completamente
   */
  static clearCache(): void {
    cache.invalidateAll()
  }
}
