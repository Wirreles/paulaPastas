import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { FirebaseService } from './firebase-service'
import { Logger } from './logger'

// Configuración del SDK de MercadoPago
let client: MercadoPagoConfig | null = null

try {
  // Configuración para pagos normales (productos)
  // Priorizar token del lado del servidor, fallback al público por compatibilidad
  const accessToken = process.env.MP_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MP_ACCESS_TOKEN || ''
  
  if (!accessToken) {
    Logger.error('ERROR: MP_ACCESS_TOKEN no está configurado')
  } else {
    client = new MercadoPagoConfig({ accessToken })
    Logger.debug('Configuración de MercadoPago inicializada correctamente')
  }
} catch (error) {
  Logger.error('ERROR: Error inicializando configuración de MercadoPago:', error)
}

export interface PaymentRequest {
  items: Array<{
    productId: string
    name: string
    quantity: number
    price: number
    imageUrl?: string
  }>
  userData: {
    name: string
    email: string
    phone: string
    address: string
  }
  deliveryOption: 'delivery' | 'pickup'
  deliverySlot?: string
  comments?: string
  isUserLoggedIn: boolean
  userId?: string | null
  addressData?: any // Datos completos de la dirección (si existe)
  addressId?: string | null // ID de la dirección (si existe)
  // Información del cupón aplicado
  couponApplied?: {
    id: string
    codigo: string
    descuento: number
    tipoDescuento: "porcentaje" | "monto"
    descuentoAplicado: number
    totalAmount: number // Precio final con descuento
    originalAmount: number // Precio original sin descuento
  } | null
}

export interface PaymentResponse {
  id: string
  initPoint: string
  sandboxInitPoint: string
  externalReference: string
}

export class MercadoPagoService {
  /**
   * Crea una preferencia de pago para productos
   */
  static async createProductPreference(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      Logger.debug('=== INICIO DE CREACIÓN DE PREFERENCIA ===')
      
      // Validaciones iniciales
      if (!client) {
        Logger.error('ERROR: Cliente de MercadoPago no inicializado')
        throw new Error('Configuración de entorno incompleta o cliente de MercadoPago no inicializado')
      }

      if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new Error('El array de productos es inválido o está vacío')
      }

      if (!data.userData.email) {
        throw new Error('Falta el email del comprador')
      }

      // Validar y recolectar productos
      const validatedProducts = []
      let totalAmount = 0

      for (const [i, item] of data.items.entries()) {
        if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
          throw new Error(`Datos inválidos en el producto ${i}`)
        }

        // Obtener datos del producto desde Firebase
        const productData = await FirebaseService.getProductById(item.productId)
        if (!productData) {
          throw new Error(`Producto no encontrado: ${item.productId}`)
        }

        if (productData.disponible === false) {
          throw new Error(`El producto ${productData.name || productData.nombre || item.productId} no está disponible`)
        }

        if (typeof productData.stock === 'number' && productData.stock < item.quantity) {
          throw new Error(`Stock insuficiente para el producto ${productData.name || productData.nombre || item.productId}`)
        }

        let price = productData.precio || productData.price
        if (typeof price === 'string') price = parseFloat(price)
        
        if (!price || typeof price !== 'number' || price <= 0) {
          throw new Error(`Precio inválido para el producto ${productData.name || productData.nombre}`)
        }

        validatedProducts.push({
          productId: item.productId,
          quantity: item.quantity,
          name: productData.name || productData.nombre || item.name || 'Producto sin nombre',
          price: price,
          stock: productData.stock ?? null,
          imageUrl: item.imageUrl || productData.imageUrl || productData.imagen
        })

        totalAmount += price * item.quantity
      }

      // Aplicar descuento del cupón si existe
      let finalAmount = totalAmount
      let discountAmount = 0
      let productsWithDiscount = validatedProducts.map(product => ({
        ...product,
        originalPrice: product.price,
        discountPerUnit: 0,
        finalPrice: product.price
      }))
      
      if (data.couponApplied) {
        Logger.debug('✅ Cupón aplicado:', data.couponApplied.codigo)
        
        // Calcular descuento por producto
        productsWithDiscount = validatedProducts.map(product => {
          let productDiscount = 0
          let finalPrice = product.price
          
          if (data.couponApplied!.tipoDescuento === 'porcentaje') {
            productDiscount = (product.price * data.couponApplied!.descuento) / 100
            finalPrice = product.price - productDiscount
          } else if (data.couponApplied!.tipoDescuento === 'monto') {
            const productTotal = product.price * product.quantity
            const productProportion = productTotal / totalAmount
            productDiscount = data.couponApplied!.descuento * productProportion
            finalPrice = Math.max(0, product.price - (productDiscount / product.quantity))
          }
          
          return {
            ...product,
            originalPrice: product.price,
            discountPerUnit: productDiscount / product.quantity,
            finalPrice: finalPrice
          }
        })
        
        discountAmount = productsWithDiscount.reduce((total, product) => {
          return total + (product.discountPerUnit * product.quantity)
        }, 0)
        
        finalAmount = totalAmount - discountAmount
      }

      // Construir objeto de compra para Firestore (con estado pendiente)
      const purchaseData = {
        buyerId: data.userId || null,
        buyerEmail: data.userData.email,
        buyerName: data.userData.name,
        buyerPhone: data.userData.phone,
        buyerAddress: data.userData.address,
        products: productsWithDiscount.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
          name: p.name,
          price: p.price,
          stock: p.stock,
          imageUrl: p.imageUrl,
          originalPrice: p.originalPrice,
          finalPrice: p.finalPrice,
          discountPerUnit: p.discountPerUnit
        })),
        totalAmount: totalAmount,
        finalAmount: finalAmount,
        status: 'pending', // Estado inicial del pago
        orderStatus: 'pendiente_pago', // Estado inicial del pedido
        createdAt: new Date(),
        deliveryOption: data.deliveryOption,
        deliverySlot: data.deliverySlot,
        comments: data.comments,
        isUserLoggedIn: data.isUserLoggedIn,
        selectedAddressId: data.addressId,
        selectedAddressData: data.addressData,
        couponApplied: data.couponApplied ? {
          ...data.couponApplied,
          descuentoAplicado: discountAmount
        } : null,
        discountAmount: discountAmount,
        paymentMethod: 'mercadopago'
      }

      // Guardar directamente en 'purchases'
      const purchaseId = await FirebaseService.addCompletedPurchase(purchaseData)
      Logger.log(`✅ Compra iniciada guardada en Firestore con ID: ${purchaseId}`)

      // Crear preferencia en MercadoPago
      const preference = new Preference(client)
      const preferenceData = {
        body: {
          items: productsWithDiscount.map((p) => ({
            id: p.productId,
            title: p.name,
            quantity: p.quantity,
            unit_price: parseFloat(p.finalPrice.toFixed(2)),
            currency_id: "ARS",
            picture_url: p.imageUrl || undefined
          })),
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/checkout/success`,
            failure: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/checkout/failure`,
            pending: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/checkout/pending`
          },
          notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
          external_reference: purchaseId, // Usamos el ID de la compra como referencia externa
          payer: {
            email: data.userData.email,
            name: data.userData.name,
            phone: {
              number: data.userData.phone
            }
          },
          additional_info: data.comments || undefined
        }
      }

      Logger.debug('DEBUG: Creando preferencia con notification_url:', preferenceData.body.notification_url)
      
      const result = await preference.create(preferenceData)
      Logger.debug('DEBUG: Preferencia creada exitosamente:', result.id)

      return {
        id: result.id || '',
        initPoint: result.init_point!,
        sandboxInitPoint: result.sandbox_init_point!,
        externalReference: purchaseId
      }

    } catch (error) {
      Logger.error('Error creando preferencia:', error)
      throw new Error(error instanceof Error ? error.message : 'Error desconocido al crear preferencia')
    }
  }

  /**
   * Procesa un webhook de MercadoPago
   */
  static async handleWebhook(webhookData: any): Promise<void> {
    try {
      const { type, data } = webhookData

      if (type === 'payment') {
        if (!client) {
          throw new Error('Cliente de MercadoPago no inicializado')
        }

        if (!data?.id) {
          throw new Error('ID del pago no encontrado en los datos del webhook')
        }

        const paymentInstance = new Payment(client)
        const paymentInfo = await paymentInstance.get({ id: data.id })
        const { external_reference, status } = paymentInfo
        const paymentId = paymentInfo.id

        // La referencia externa es el ID de nuestra compra en 'purchases'
        if (external_reference) {
          Logger.log(`Webhook recibido para compra ${external_reference}, estado: ${status}`)
          
          // Obtener la compra actual
          const currentPurchase = await FirebaseService.getPurchaseById(external_reference)
          
          if (currentPurchase) {
            const updates: any = {
              status: status,
              paymentId: String(paymentId),
              updatedAt: new Date()
            }

            // Lógica basada en el estado
            if (status === 'approved') {
              // Solo si no estaba aprobada antes
              if (currentPurchase.status !== 'approved') {
                updates.orderStatus = 'en_preparacion'
                
                // Aquí se podría descontar stock si no se hizo antes
                // y marcar el cupón como usado
                if (currentPurchase.couponApplied?.id) {
                   await FirebaseService.markCouponAsUsed(currentPurchase.couponApplied.id)
                }
              }
            } else if (status === 'rejected' || status === 'cancelled') {
              updates.orderStatus = 'cancelado'
            }

            // Actualizar la compra existente en 'purchases'
            await FirebaseService.updatePurchase(external_reference, updates)
            Logger.log(`✅ Compra ${external_reference} actualizada a status: ${status}`)
          } else {
            Logger.warn(`⚠️ Compra con referencia ${external_reference} no encontrada en purchases.`)
          }
        }
      }
    } catch (error) {
      Logger.error('Error en handleWebhook:', error)
      throw new Error(error instanceof Error ? error.message : 'Error procesando notificación')
    }
  }
}
 