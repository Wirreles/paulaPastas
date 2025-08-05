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
} from "./types"

export class FirebaseService {
  // Productos
  static async getProductos(categoria?: string): Promise<Producto[]> {
    try {
      const productosRef = collection(db, "productos")
      let q = query(productosRef, orderBy("orden", "asc"))

      if (categoria) {
        q = query(productosRef, where("categoria", "==", categoria), orderBy("orden", "asc"))
      }

      const snapshot = await getDocs(q)
      const productos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Producto)

      console.log(`FirebaseService.getProductos(${categoria}): Encontrados ${productos.length} productos`)
      return productos
    } catch (error) {
      console.error("Error en getProductos:", error)
      return []
    }
  }

  // Función específica para obtener productos por subcategoría
  static async getProductosPorSubcategoria(categoria: string, subcategoria: string): Promise<Producto[]> {
    try {
      console.log(`🔍 Buscando productos para categoria: "${categoria}", subcategoria: "${subcategoria}"`)

      // Primero intentar obtener todos los productos de la categoría
      const productosRef = collection(db, "productos")
      const q = query(productosRef, where("categoria", "==", categoria))

      const snapshot = await getDocs(q)
      const todosLosProductos = snapshot.docs.map((doc) => {
        const data = doc.data()
        return { id: doc.id, ...data } as Producto
      })

      console.log(`📦 Productos encontrados en categoria "${categoria}":`, todosLosProductos.length)
      todosLosProductos.forEach((p) => {
        console.log(`  - ${p.nombre} (subcategoria: "${p.subcategoria}")`)
      })

      // Filtrar por subcategoría
      const productosFiltrados = todosLosProductos.filter((p) => p.subcategoria === subcategoria)

      console.log(`✅ Productos filtrados para subcategoria "${subcategoria}":`, productosFiltrados.length)
      productosFiltrados.forEach((p) => {
        console.log(`  ✓ ${p.nombre}`)
      })

      return productosFiltrados
    } catch (error) {
      console.error("❌ Error fetching productos por subcategoria:", error)
      return []
    }
  }

  static async getProducto(slug: string): Promise<Producto | null> {
    try {
      const q = query(collection(db, "productos"), where("slug", "==", slug))
      const snapshot = await getDocs(q)

      if (snapshot.empty) return null

      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as Producto
    } catch (error) {
      console.error("Error en getProducto:", error)
      return null
    }
  }

  static async getProductosDestacados(): Promise<Producto[]> {
    try {
      const q = query(collection(db, "productos"), where("destacado", "==", true), orderBy("orden", "asc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Producto)
    } catch (error) {
      console.error("Error en getProductosDestacados:", error)
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
      return docRef.id
    } catch (error) {
      console.error("Error en addProducto:", error)
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
    } catch (error) {
      console.error("Error en updateProducto:", error)
      throw error
    }
  }

  static async deleteProducto(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "productos", id))
    } catch (error) {
      console.error("Error en deleteProducto:", error)
      throw error
    }
  }

  // Categorías
  static async getCategorias(): Promise<Categoria[]> {
    try {
      const q = query(collection(db, "categorias"), orderBy("orden", "asc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Categoria)
    } catch (error) {
      console.error("Error en getCategorias:", error)
      return []
    }
  }

  static async getCategoria(slug: string): Promise<Categoria | null> {
    try {
      const q = query(collection(db, "categorias"), where("slug", "==", slug))
      const snapshot = await getDocs(q)

      if (snapshot.empty) return null

      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as Categoria
    } catch (error) {
      console.error("Error en getCategoria:", error)
      return null
    }
  }

  // Packs
  static async getPacks(): Promise<Pack[]> {
    try {
      const q = query(collection(db, "packs"), orderBy("orden", "asc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Pack)
    } catch (error) {
      console.error("Error en getPacks:", error)
      return []
    }
  }

  // Zonas
  static async getZonas(): Promise<ZonaEntrega[]> {
    try {
      const snapshot = await getDocs(collection(db, "zonas"))
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ZonaEntrega)
    } catch (error) {
      console.error("Error en getZonas:", error)
      return []
    }
  }

  static async getZona(slug: string): Promise<ZonaEntrega | null> {
    try {
      const q = query(collection(db, "zonas"), where("slug", "==", slug))
      const snapshot = await getDocs(q)

      if (snapshot.empty) return null

      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as ZonaEntrega
    } catch (error) {
      console.error("Error en getZona:", error)
      return null
    }
  }

  // Métodos para Home Sections
  static async getHomeSections(): Promise<HomeSection[]> {
    try {
      const q = query(collection(db, "homeSections"), orderBy("order", "asc"))
      const snapshot = await getDocs(q)
      const sections = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as HomeSection)
      console.log(`📋 HomeSections cargadas: ${sections.length} secciones`)
      return sections
    } catch (error) {
      console.error("Error en getHomeSections:", error)
      return []
    }
  }

  static async updateHomeSection(id: string, section: Partial<HomeSection>): Promise<void> {
    try {
      const docRef = doc(db, "homeSections", id)
      await updateDoc(docRef, section)
    } catch (error) {
      console.error("Error en updateHomeSection:", error)
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
      console.error("Error uploading image:", error)
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
      console.error("Error deleting image:", error)
      // No lanzar error si el archivo no se encuentra, solo registrar
      if ((error as any).code === "storage/object-not-found") {
        console.warn("Image not found, skipping deletion:", url)
      } else {
        throw error
      }
    }
  }

  // NUEVO: Método para añadir un pedido
  static async addOrder(order: Omit<Order, "id" | "fechaCreacion" | "estado">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        ...order,
        estado: "pendiente", // Estado inicial del pedido
        fechaCreacion: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error en addOrder:", error)
      throw error
    }
  }

  // NUEVO: Métodos para gestionar banners de páginas
  static async getPageBanners(): Promise<PageBanner[]> {
    try {
      const q = query(collection(db, "pageBanners"), orderBy("order", "asc"))
      const snapshot = await getDocs(q)
      const banners = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as PageBanner)
      console.log(`🎨 PageBanners cargados: ${banners.length} banners`)
      return banners
    } catch (error) {
      console.error("Error en getPageBanners:", error)
      return []
    }
  }

  static async getPageBannerBySlug(slug: string): Promise<PageBanner | null> {
    try {
      console.log(`🔍 Buscando banner para slug: "${slug}"`)
      const q = query(collection(db, "pageBanners"), where("slug", "==", slug), limit(1))
      const snapshot = await getDocs(q)
      if (snapshot.empty) {
        console.log(`❌ No se encontró banner para slug: "${slug}"`)
        return null
      }
      const banner = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as PageBanner
      console.log(`✅ Banner encontrado para "${slug}":`, banner.name)
      return banner
    } catch (error) {
      console.error("Error en getPageBannerBySlug:", error)
      return null
    }
  }

  static async createPageBanner(banner: Omit<PageBanner, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "pageBanners"), banner)
      console.log(`✅ PageBanner creado: ${docRef.id}`)
      return docRef.id
    } catch (error) {
      console.error("Error en createPageBanner:", error)
      throw error
    }
  }

  static async updatePageBanner(id: string, banner: Partial<PageBanner>): Promise<void> {
    try {
      await updateDoc(doc(db, "pageBanners", id), banner)
      console.log(`✅ PageBanner actualizado: ${id}`)
    } catch (error) {
      console.error("Error en updatePageBanner:", error)
      throw error
    }
  }

  static async deletePageBanner(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "pageBanners", id))
      console.log(`✅ PageBanner eliminado: ${id}`)
    } catch (error) {
      console.error("Error en deletePageBanner:", error)
      throw error
    }
  }

  // NUEVO: Métodos para gestionar artículos del blog
  static async getBlogArticles(): Promise<BlogArticle[]> {
    try {
      const q = query(collection(db, "blogArticles"), orderBy("order", "asc"))
      const snapshot = await getDocs(q)
      const articles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as BlogArticle)
      console.log(`📝 BlogArticles cargados: ${articles.length} artículos`)
      return articles
    } catch (error) {
      console.error("Error en getBlogArticles:", error)
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
      console.log(`📝 Artículos publicados cargados: ${articles.length} artículos`)
      return articles
    } catch (error) {
      console.error("Error en getPublishedBlogArticles:", error)
      return []
    }
  }

  static async getBlogArticleBySlug(slug: string): Promise<BlogArticle | null> {
    try {
      console.log(`🔍 Buscando artículo para slug: "${slug}"`)
      const q = query(collection(db, "blogArticles"), where("slug", "==", slug), limit(1))
      const snapshot = await getDocs(q)
      if (snapshot.empty) {
        console.log(`❌ No se encontró artículo para slug: "${slug}"`)
        return null
      }
      const article = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogArticle
      console.log(`✅ Artículo encontrado para "${slug}":`, article.title)
      return article
    } catch (error) {
      console.error("Error en getBlogArticleBySlug:", error)
      return null
    }
  }

  static async createBlogArticle(article: Omit<BlogArticle, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "blogArticles"), article)
      console.log(`✅ BlogArticle creado: ${docRef.id}`)
      return docRef.id
    } catch (error) {
      console.error("Error en createBlogArticle:", error)
      throw error
    }
  }

  static async updateBlogArticle(id: string, article: Partial<BlogArticle>): Promise<void> {
    try {
      await updateDoc(doc(db, "blogArticles", id), article)
      console.log(`✅ BlogArticle actualizado: ${id}`)
    } catch (error) {
      console.error("Error en updateBlogArticle:", error)
      throw error
    }
  }

  static async deleteBlogArticle(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "blogArticles", id))
      console.log(`✅ BlogArticle eliminado: ${id}`)
    } catch (error) {
      console.error("Error en deleteBlogArticle:", error)
      throw error
    }
  }

  // Métodos para el dashboard de usuario
  static async getPedidosByUser(userId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("fechaCreacion", "desc")
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order)
    } catch (error) {
      console.error("Error en getPedidosByUser:", error)
      return []
    }
  }

  static async getDireccionesByUser(userId: string): Promise<any[]> {
    try {
      console.log(`🔍 Buscando direcciones para userId: ${userId}`)
      
      // Primero intentar sin orderBy para evitar problemas con timestamps
      const q = query(
        collection(db, "direcciones"),
        where("userId", "==", userId)
      )
      const snapshot = await getDocs(q)
      const direcciones = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      
      console.log(`✅ Direcciones encontradas: ${direcciones.length}`)
      direcciones.forEach((dir, index) => {
        console.log(`  ${index + 1}. ${dir.calle} ${dir.numero}, ${dir.ciudad}`)
      })
      
      return direcciones
    } catch (error) {
      console.error("Error en getDireccionesByUser:", error)
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
      console.error("Error en addDireccion:", error)
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
      console.error("Error en updateDireccion:", error)
      throw error
    }
  }

  static async deleteDireccion(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "direcciones", id))
    } catch (error) {
      console.error("Error en deleteDireccion:", error)
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
      console.error("Error en updateUserProfile:", error)
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
      console.error("Error en getOrderByExternalReference:", error)
      return null
    }
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      const orderRef = doc(db, "orders", orderId)
      await updateDoc(orderRef, { estado: status })
    } catch (error) {
      console.error("Error actualizando estado del pedido:", error)
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
      console.error("Error obteniendo producto por ID:", error)
      return null
    }
  }

  static async updateProductStock(productId: string, newStock: number): Promise<void> {
    try {
      const productRef = doc(db, "productos", productId)
      await updateDoc(productRef, { stock: newStock })
    } catch (error) {
      console.error("Error actualizando stock del producto:", error)
      throw error
    }
  }

  static async addPendingPurchase(purchaseId: string, purchaseData: any): Promise<void> {
    try {
      const purchaseRef = doc(db, "pending_purchases", purchaseId)
      await setDoc(purchaseRef, purchaseData)
    } catch (error) {
      console.error("Error agregando compra pendiente:", error)
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
      console.error("Error obteniendo compra pendiente:", error)
      return null
    }
  }

  static async deletePendingPurchase(purchaseId: string): Promise<void> {
    try {
      const purchaseRef = doc(db, "pending_purchases", purchaseId)
      await deleteDoc(purchaseRef)
    } catch (error) {
      console.error("Error eliminando compra pendiente:", error)
      throw error
    }
  }

  static async addCompletedPurchase(purchaseData: any): Promise<string> {
    try {
      const purchaseRef = await addDoc(collection(db, "purchases"), purchaseData)
      return purchaseRef.id
    } catch (error) {
      console.error("Error agregando compra completada:", error)
      throw error
    }
  }

  static async addFailedPurchase(purchaseData: any): Promise<string> {
    try {
      const purchaseRef = await addDoc(collection(db, "failed_purchases"), purchaseData)
      return purchaseRef.id
    } catch (error) {
      console.error("Error agregando compra fallida:", error)
      throw error
    }
  }
}
