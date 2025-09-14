export interface Producto {
  id?: string
  nombre: string
  slug: string
  descripcion: string
  descripcionAcortada?: string
  precio: number
  categoria: "rellenas" | "sin-relleno" | "sin-tacc" | "salsas" // Añadido "salsas"
  subcategoria:
    | "lasagna"
    | "ravioles"
    | "sorrentinos"
    | "noquis"
    | "fideos"
    | "ravioles-fritos"
    | "salsas-clasicas"
    | "salsas-gourmet" // Añadido subcategorías de salsas
  imagen: string
  ingredientes: string[]
  disponible: boolean
  destacado: boolean
  porciones?: number
  // tiempoPreparacion removido según solicitud
  // Nuevas secciones dinámicas para productos
  comoPreparar?: {
    titulo: string
    texto: string
  }
  historiaPlato?: {
    titulo: string
    texto: string
  }
  // Sección de preguntas frecuentes dinámicas
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
  fechaCreacion?: Date
  fechaActualizacion?: Date
}

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

export interface ZonaEntrega {
  id?: string
  nombre: string
  slug: "vgg" | "rosario-centro" | "zona-sur" | "zona-oeste"
  descripcion: string
  costoEnvio: number
  tiempoEntrega: string
  horarios: {
    dia: string
    desde: string
    hasta: string
  }[]
  disponible: boolean
  barrios: string[]
}

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

export interface Usuario {
  uid: string
  email: string
  nombre?: string
  rol: "admin" | "cliente"
  fechaCreacion: Date
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
  fechaActualizacion?: Date
}

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

// NUEVO: Interfaz para las secciones del Home
export interface HomeSection {
  id?: string
  name: string
  description: string
  imageUrl: string
  order: number // Para controlar el orden de visualización
  sectionId: string // Identificador de la sección en el home (ej: "hero", "dishes-gallery", "quality-assured")
  elementId?: string // Identificador específico si es parte de una lista (ej: "dishes-gallery-1")
}

// NUEVO: Interfaz para los banners de páginas
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

// NUEVO: Interfaz para artículos del blog
export interface BlogArticle {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  category: "recetas" | "lifestyle" | "consejos" | "cultura"
  readingTime: number // en minutos
  author: string
  publishedAt?: string | Date
  isPublished: boolean
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  order: number
}

// NUEVO: Interfaz para un ítem dentro de un pedido
export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  imageUrl?: string
}

// NUEVO: Interfaz para un pedido completo
export interface Review {
  id?: string
  productoId: string // ID del producto al que pertenece la reseña
  userId: string // ID del usuario que creó la reseña
  userName: string // Nombre del usuario
  userEmail: string // Email del usuario
  rating: number // Calificación de 1 a 5 estrellas
  testimonial: string // Texto de la reseña
  aprobada: boolean // Requiere aprobación del administrador
  destacada: boolean // Reseña destacada para uso futuro
  fechaCreacion: Date
  fechaAprobacion?: Date // Fecha cuando fue aprobada
  aprobadaPor?: string // ID del administrador que la aprobó
}

export interface Order {
  id?: string
  userId: string | null // ID del usuario si está logueado, null si es invitado
  userName: string
  userEmail: string
  phone: string
  address: string
  comments?: string
  deliveryOption: "delivery" | "pickup"
  deliverySlot?: string | null // Horario elegido si es delivery
  paymentMethod: string // 'mercadopago', 'tarjeta', 'efectivo-local'
  totalAmount: number
  items: OrderItem[]
  estado: "pendiente" | "confirmado" | "enviado" | "entregado" | "cancelado"
  fechaCreacion: Date
  // Campos adicionales para MercadoPago
  mercadopagoPreferenceId?: string
  externalReference?: string
  paymentStatus?: "pending" | "approved" | "rejected" | "cancelled"
  paymentId?: string
}

export interface Direccion {
  id: string
  calle: string
  numero: string
  piso?: string
  codigoPostal: string
  ciudad: string
  provincia: string
  indicaciones?: string
  fechaCreacion: any
}

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

export interface Cupon {
  id?: string
  codigo: string // Código único del cupón (ej: SUMMER2024)
  descripcion: string // Descripción del cupón
  descuento: number // Valor del descuento
  tipoDescuento: "porcentaje" | "monto" // Porcentaje o monto fijo
  montoMinimo: number // Monto mínimo de compra para aplicar el cupón
  fechaInicio: Date // Fecha desde cuando es válido
  fechaFin: Date // Fecha hasta cuando es válido
  maxUsos: number // Máximo número de veces que se puede usar
  usosActuales: number // Número de veces que ya se ha usado
  usado: boolean // Si ya no se puede usar más
  activo: boolean // Si el cupón está activo
  origen?: "admin" | "newsletter-welcome" | "promocion" // Origen del cupón
  emailDestinatario?: string // Email específico para cupones personales
  fechaCreacion?: Date
  fechaActualizacion?: Date
}
