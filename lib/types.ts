// ===============================
// PRODUCTOS
// ===============================

export interface Producto {
  id?: string
  nombre: string
  slug: string

  descripcion: string
  descripcionAcortada?: string

  precio: number

  categoria: "rellenas" | "sin-relleno" | "sin-tacc" | "salsas"

  // IMPORTANTE: ahora es opcional para nuevas URLs
  subcategoria:
    | "lasagna"
    | "ravioles"
    | "sorrentinos"
    | "fideos"
    | "ravioles-fritos"
    | "salsa"
    | "noquis"
    
  imagen: string
  // Opcional: permite mostrar galerías de imágenes en vez de una sola
  imagenes?: string[]
  ingredientes: string[]

  disponible: boolean
  destacado: boolean

  orden?: number
  porciones?: number

  // Secciones dinámicas
  comoPreparar?: {
    titulo: string
    texto: string
  }

  historiaPlato?: {
    titulo: string
    texto: string
  }

  preguntasFrecuentes?: {
    pregunta: string
    respuesta: string
  }[]

  informacionNutricional?: {
    calorias?: number
    proteinas?: number
    carbohidratos?: number
    grasas?: number
  }

  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]

  fechaCreacion?: string | null
  fechaActualizacion?: string | null
}


// ===============================
// PACKS
// ===============================

export interface Pack {
  id?: string
  nombre: string
  slug: string
  descripcion: string

  precio: number
  precioOriginal: number

  productos: string[]

  imagen: string
  disponible: boolean

  orden: number

  seoTitle?: string
  seoDescription?: string
}


// ===============================
// ZONAS DE ENTREGA
// ===============================

// export interface ZonaEntrega {
//   id?: string
//   nombre: string

//   slug: "vgg" | "rosario-centro" | "zona-sur" | "zona-oeste"

//   descripcion: string
//   costoEnvio: number
//   tiempoEntrega: string

//   horarios: {
//     dia: string
//     desde: string
//     hasta: string
//   }[]

//   disponible: boolean
//   barrios: string[]
// }


// ===============================
// CATEGORÍAS
// ===============================

export interface Categoria {
  id: string
  nombre: string
  slug: string

  descripcion: string
  imagen: string

  orden: number

  keywords: string[]
  seoTitle: string
  seoDescription: string

  subcategorias?: {
    nombre: string
    slug: string
    descripcion: string
    seoTitle: string
    seoDescription: string
  }[]
}


// ===============================
// USUARIOS
// ===============================

export interface Usuario {
  uid: string
  email: string

  nombre?: string

  rol: "admin" | "cliente"

  telefono?: string
  dni?: string
  fechaNacimiento?: string

  preferenciasContacto?: {
    llamada: boolean
    whatsapp: boolean
    email: boolean
  }

  direccion?: {
    calle: string
    numero: string
    piso?: string
    departamento?: string
    codigoPostal: string
    ciudad: string
    provincia: string
  }

  baneado?: boolean
  fechaBaneo?: Date | null

  fechaCreacion: Date
  fechaActualizacion?: Date
}


// ===============================
// BLOG POST (estructura antigua)
// ===============================

export interface BlogPost {
  id?: string

  titulo: string
  slug: string

  contenido: string
  resumen: string

  imagen: string
  autor: string

  fechaPublicacion: Date

  categoria: string
  tags: string[]

  seoTitle: string
  seoDescription: string
  seoKeywords: string[]

  publicado: boolean
}


// ===============================
// HOME SECTIONS
// ===============================

export interface HomeSection {
  id?: string
  name: string
  description: string

  imageUrl: string

  order: number

  sectionId: string
  elementId?: string
}


// ===============================
// PAGE BANNERS
// ===============================

export interface PageBanner {
  id?: string

  name: string
  description: string

  imageUrl: string

  title: string
  subtitle: string

  pageType: "categoria" | "subcategoria" | "especial"

  categoria?: string
  subcategoria?: string

  slug: string

  order: number
}


// ===============================
// BLOG ARTICLES (estructura nueva)
// ===============================

export interface BlogArticle {
  id?: string

  title: string
  slug: string

  excerpt: string
  content: string

  featuredImage: string

  category: "recetas" | "lifestyle" | "consejos" | "cultura"

  readingTime: number

  author: string

  publishedAt?: string | Date

  isPublished: boolean

  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]

  order: number
}


// ===============================
// PEDIDOS
// ===============================

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  imageUrl?: string
}


export interface Order {
  id?: string

  userId: string | null

  userName: string
  userEmail: string

  phone: string
  address: string

  comments?: string

  deliveryOption: "delivery" | "pickup"

  deliverySlot?: string | null

  paymentMethod: string

  totalAmount: number

  items: OrderItem[]

  estado: "pendiente" | "confirmado" | "enviado" | "entregado" | "cancelado"

  fechaCreacion: Date

  mercadopagoPreferenceId?: string
  externalReference?: string

  paymentStatus?: "pending" | "approved" | "rejected" | "cancelled"
  paymentId?: string
}


// ===============================
// REVIEWS
// ===============================

export interface Review {
  id?: string

  productoId: string

  userId: string
  userName: string
  // Email opcional para reviews sin login
  userEmail?: string

  rating: number

  testimonial: string

  aprobada: boolean
  destacada: boolean

  // Compatibilidad con el flujo "pending antes de aprobación"
  pending?: boolean

  fechaCreacion: Date

  fechaAprobacion?: Date
  aprobadaPor?: string
}


// ===============================
// DIRECCIONES
// ===============================

export interface Direccion {
  id: string

  calle: string
  numero: string
  piso?: string

  codigoPostal: string

  ciudad: string
  provincia: string

  indicaciones?: string

  fechaCreacion: Date
}


// ===============================
// NEWSLETTER
// ===============================

export interface Suscripcion {
  id?: string

  email: string

  fechaSuscripcion: Date

  estado: "activo" | "inactivo" | "dado-de-baja"

  origen: "web" | "admin" | "csv"

  fechaBaja?: Date
  motivoBaja?: string

  activo: boolean

  fechaCreacion?: Date
  fechaActualizacion?: Date
}


export interface NewsletterCampaign {
  id?: string

  titulo: string
  contenido: string
  asunto: string

  destinatarios: "todos" | "activos" | "nuevos"

  estado: "borrador" | "programada" | "enviada" | "cancelada"

  fechaProgramada?: Date
  fechaEnvio?: Date

  estadisticas?: {
    enviados: number
    entregados: number
    abiertos: number
    clicks: number
    rebotes: number
  }

  fechaCreacion?: Date
  fechaActualizacion?: Date
}


// ===============================
// CUPONES
// ===============================

export interface Cupon {
  id?: string

  codigo: string
  descripcion: string

  descuento: number

  tipoDescuento: "porcentaje" | "monto"

  montoMinimo: number

  fechaInicio: Date
  fechaFin: Date

  maxUsos: number
  usosActuales: number

  usado: boolean
  activo: boolean

  origen?: "admin" | "newsletter-welcome" | "promocion"
  emailDestinatario?: string

  fechaCreacion?: Date
  fechaActualizacion?: Date
}