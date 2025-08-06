import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { FirebaseService } from './firebase-service'

// Configuración del SDK de MercadoPago
let client: MercadoPagoConfig | null = null

try {
  // Configuración para pagos normales (productos)
  const accessToken = process.env.NEXT_PUBLIC_MP_ACCESS_TOKEN || ''
  console.log('DEBUG: Token de acceso:', accessToken ? `${accessToken.substring(0, 10)}...` : 'NO CONFIGURADO')
  
  if (!accessToken) {
    console.error('ERROR: NEXT_PUBLIC_MP_ACCESS_TOKEN no está configurado')
  } else {
    client = new MercadoPagoConfig({ accessToken })
    console.log('DEBUG: Configuración de MercadoPago inicializada correctamente')
  }
} catch (error) {
  console.error('ERROR: Error inicializando configuración de MercadoPago:', error)
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
      console.log('=== INICIO DE CREACIÓN DE PREFERENCIA ===')
      console.log('Datos recibidos:', JSON.stringify(data, null, 2))

      // Validaciones iniciales
      if (!process.env.NEXT_PUBLIC_MP_ACCESS_TOKEN || !client) {
        console.error('ERROR: Configuración incompleta:', {
          hasToken: !!process.env.NEXT_PUBLIC_MP_ACCESS_TOKEN,
          hasClient: !!client
        })
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

        console.log(`DEBUG: Datos del producto ${item.productId}:`, JSON.stringify(productData, null, 2))
        console.log(`DEBUG: Campos disponibles:`, Object.keys(productData))
        console.log(`DEBUG: Precio del producto:`, productData.precio, `(tipo: ${typeof productData.precio})`)
        console.log(`DEBUG: Nombre del producto:`, productData.nombre, `(tipo: ${typeof productData.nombre})`)

        if (productData.disponible === false) {
          throw new Error(`El producto ${productData.name || productData.nombre || item.productId} no está disponible`)
        }

        if (typeof productData.stock === 'number' && productData.stock < item.quantity) {
          throw new Error(`Stock insuficiente para el producto ${productData.name || productData.nombre || item.productId}`)
        }

        // Validar que el precio existe y es un número válido
        let price = productData.precio || productData.price
        console.log(`DEBUG: Precio antes de validar:`, price, `(tipo: ${typeof price})`)
        
        if (typeof price === 'string') {
          price = parseFloat(price)
          console.log(`DEBUG: Precio convertido de string:`, price)
        }
        
        if (!price || typeof price !== 'number' || price <= 0) {
          console.error(`ERROR: Precio inválido para producto ${productData.name || productData.nombre || item.productId}:`, productData.precio || productData.price)
          throw new Error(`Precio inválido para el producto ${productData.name || productData.nombre || item.productId}`)
        }

        console.log(`DEBUG: Precio validado:`, price)

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

      // Generar ID de la compra
      const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const preference = new Preference(client)

      const preferenceData = {
        body: {
          items: validatedProducts.map((p) => ({
            id: p.productId,
            title: p.name,
            quantity: p.quantity,
            unit_price: parseFloat(p.price.toString()),
            currency_id: "ARS",
            picture_url: p.imageUrl || undefined
          })),
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/checkout/success`,
            failure: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/checkout/failure`,
            pending: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/checkout/pending`
          },
          notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
          external_reference: purchaseId,
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

      // Crear preferencia
      console.log('DEBUG: Intentando crear preferencia con MercadoPago...')
      console.log('DEBUG: Datos de preferencia:', JSON.stringify(preferenceData, null, 2))
      
      if (!client) {
        throw new Error('Cliente de MercadoPago no inicializado')
      }
      
      let result
      try {
        result = await preference.create(preferenceData)
        console.log('DEBUG: Preferencia creada exitosamente:', result.id)
        console.log('DEBUG: Campos completos del resultado:', JSON.stringify(result, null, 2))
        console.log('DEBUG: Tipos de campos:', {
          id: typeof result.id,
          init_point: typeof (result as any).init_point,
          sandbox_init_point: typeof (result as any).sandbox_init_point,
          hasInitPoint: 'init_point' in result,
          hasSandboxInitPoint: 'sandbox_init_point' in result
        })
      } catch (preferenceError) {
        console.error('ERROR: Error creando preferencia:', preferenceError)
        throw preferenceError
      }

      // Guardar en Firestore como compra pendiente
      const pendingPurchaseData = {
        buyerId: data.userId || null,
        buyerEmail: data.userData.email || '',
        buyerName: data.userData.name || '',
        buyerPhone: data.userData.phone || '',
        buyerAddress: data.userData.address || '',
        products: validatedProducts,
        totalAmount,
        status: 'pending',
        createdAt: new Date(),
        preferenceId: result.id,
        deliveryOption: data.deliveryOption,
        deliverySlot: data.deliverySlot,
        comments: data.comments,
        isUserLoggedIn: data.isUserLoggedIn,
        addressId: data.addressId || null,
        addressData: data.addressData || null
      }

      await FirebaseService.addPendingPurchase(purchaseId, pendingPurchaseData)

      return {
        id: result.id || '',
        initPoint: (result as any).init_point || (result as any).initPoint || (result as any).body?.init_point || (result as any).response?.init_point || '',
        sandboxInitPoint: (result as any).sandbox_init_point || (result as any).sandboxInitPoint || (result as any).body?.sandbox_init_point || (result as any).response?.sandbox_init_point || '',
        externalReference: purchaseId
      }

    } catch (error) {
      console.error('Error creando preferencia centralizada:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available')
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

        const paymentInstance = new Payment(client)
        const paymentInfo = await paymentInstance.get({ id: data.id })
        const { external_reference, status } = paymentInfo

        console.log('DEBUG: Webhook recibido:', { external_reference, status })

        if (external_reference && external_reference.startsWith('purchase_')) {
          // Buscar la compra pendiente en Firestore
          const pendingPurchaseData = await FirebaseService.getPendingPurchase(external_reference)

          if (!pendingPurchaseData) {
            console.error('Compra pendiente no encontrada:', external_reference)
            return
          }

          if (status === 'approved') {
            // Actualizar stock
            for (const prod of pendingPurchaseData.products) {
              const productData = await FirebaseService.getProductById(prod.productId)

              if (!productData) continue

              if (typeof productData.stock === 'number') {
                if (productData.stock < prod.quantity) {
                  await FirebaseService.addFailedPurchase({
                    reason: 'Stock insuficiente en webhook',
                    ...prod,
                    buyerId: pendingPurchaseData.buyerId,
                    paymentId: paymentInfo.id,
                    createdAt: new Date()
                  })
                  continue
                }

                await FirebaseService.updateProductStock(prod.productId, productData.stock - prod.quantity)
              }
            }

            // Guardar la compra finalizada
            await FirebaseService.addCompletedPurchase({
              buyerId: pendingPurchaseData.buyerId,
              buyerEmail: pendingPurchaseData.buyerEmail || '',
              buyerName: pendingPurchaseData.buyerName || '',
              buyerPhone: pendingPurchaseData.buyerPhone || '',
              buyerAddress: pendingPurchaseData.buyerAddress || '',
              products: pendingPurchaseData.products,
              paymentId: paymentInfo.id,
              status: paymentInfo.status,
              totalAmount: pendingPurchaseData.totalAmount,
              paidToSellers: false,
              createdAt: new Date(),
              deliveryOption: pendingPurchaseData.deliveryOption,
              deliverySlot: pendingPurchaseData.deliverySlot,
              comments: pendingPurchaseData.comments,
              isUserLoggedIn: pendingPurchaseData.isUserLoggedIn,
              addressId: pendingPurchaseData.addressId || null,
              addressData: pendingPurchaseData.addressData || null
            })

            // Eliminar la compra pendiente
            await FirebaseService.deletePendingPurchase(external_reference)

            console.log('DEBUG: Compra procesada exitosamente:', external_reference)
          } else if (status === 'rejected' || status === 'cancelled') {
            // Eliminar la compra pendiente si fue rechazada o cancelada
            await FirebaseService.deletePendingPurchase(external_reference)
            console.log('DEBUG: Compra rechazada/cancelada eliminada:', external_reference)
          }
        }
      }
    } catch (error) {
      console.error('❌ ERROR webhook:', error)
      throw new Error(error instanceof Error ? error.message : 'Error procesando notificación')
    }
  }
} 