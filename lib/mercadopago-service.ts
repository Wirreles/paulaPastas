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
      console.log('=== INICIO DE CREACIÓN DE PREFERENCIA ===')
      console.log('Datos recibidos:', JSON.stringify(data, null, 2))
      console.log('Cupón aplicado:', data.couponApplied ? 'SÍ' : 'NO')
      console.log('🔍 DEBUG: Estructura completa de data.couponApplied:', {
        exists: !!data.couponApplied,
        type: typeof data.couponApplied,
        keys: data.couponApplied ? Object.keys(data.couponApplied) : 'N/A',
        value: data.couponApplied
      })
      if (data.couponApplied) {
        console.log('Detalles del cupón:', {
          codigo: data.couponApplied.codigo,
          tipo: data.couponApplied.tipoDescuento,
          descuento: data.couponApplied.descuento,
          descuentoAplicado: data.couponApplied.descuentoAplicado,
          totalOriginal: data.couponApplied.originalAmount,
          totalFinal: data.couponApplied.totalAmount
        })
      }

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

      // Aplicar descuento del cupón si existe
      let finalAmount = totalAmount
      let discountAmount = 0
      let productsWithDiscount = []
      
      console.log('🔍 DEBUG: Verificando cupón...')
      console.log('🔍 DEBUG: data.couponApplied existe?', !!data.couponApplied)
      console.log('🔍 DEBUG: data.couponApplied completo:', JSON.stringify(data.couponApplied, null, 2))
      console.log('🔍 DEBUG: totalAmount antes del descuento:', totalAmount)
      
      if (data.couponApplied) {
        console.log('✅ DEBUG: Cupón aplicado:', data.couponApplied)
        console.log('✅ DEBUG: Tipo de descuento:', data.couponApplied.tipoDescuento)
        console.log('✅ DEBUG: Valor del descuento:', data.couponApplied.descuento)
        
        // Calcular descuento por producto
        productsWithDiscount = validatedProducts.map(product => {
          let productDiscount = 0
          let finalPrice = product.price
          
          console.log(`🔍 DEBUG: Procesando producto ${product.name}:`)
          console.log(`  - Precio original: $${product.price}`)
          console.log(`  - Cantidad: ${product.quantity}`)
          
          if (data.couponApplied && data.couponApplied.tipoDescuento === 'porcentaje') {
            productDiscount = (product.price * data.couponApplied.descuento) / 100
            finalPrice = product.price - productDiscount
            console.log(`  - Descuento porcentual (${data.couponApplied.descuento}%): $${productDiscount}`)
            console.log(`  - Precio final: $${finalPrice}`)
          } else if (data.couponApplied && data.couponApplied.tipoDescuento === 'monto') {
            // Para descuento de monto fijo, distribuir proporcionalmente
            const productTotal = product.price * product.quantity
            const productProportion = productTotal / totalAmount
            productDiscount = data.couponApplied.descuento * productProportion
            finalPrice = Math.max(0, product.price - (productDiscount / product.quantity))
            console.log(`  - Proporción del producto: ${(productProportion * 100).toFixed(2)}%`)
            console.log(`  - Descuento de monto fijo: $${productDiscount}`)
            console.log(`  - Precio final: $${finalPrice}`)
          }
          
          return {
            ...product,
            originalPrice: product.price,
            discountPerUnit: productDiscount / product.quantity,
            finalPrice: finalPrice
          }
        })
        
        // Calcular totales
        discountAmount = productsWithDiscount.reduce((total, product) => {
          return total + (product.discountPerUnit * product.quantity)
        }, 0)
        
        finalAmount = totalAmount - discountAmount
        
        console.log(`✅ DEBUG: RESUMEN DEL DESCUENTO:`)
        console.log(`  - Total original: $${totalAmount}`)
        console.log(`  - Descuento aplicado: $${discountAmount}`)
        console.log(`  - Total final: $${finalAmount}`)
        console.log('✅ DEBUG: Productos con descuento:', productsWithDiscount.map(p => ({
          name: p.name,
          originalPrice: p.originalPrice,
          finalPrice: p.finalPrice,
          discount: p.discountPerUnit
        })))
      } else {
        console.log('❌ DEBUG: NO hay cupón aplicado')
        // Si no hay cupón, usar precios originales
        productsWithDiscount = validatedProducts.map(product => ({
          ...product,
          originalPrice: product.price,
          discountPerUnit: 0,
          finalPrice: product.price
        }))
      }

      // Generar ID de la compra
      const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const preference = new Preference(client)

      const preferenceData = {
        body: {
          items: [
            // Productos con precios ya reducidos (si aplica cupón)
            ...productsWithDiscount.map((p) => ({
              id: p.productId,
              title: p.name,
              quantity: p.quantity,
              unit_price: parseFloat(p.finalPrice.toString()),
              currency_id: "ARS",
              picture_url: p.imageUrl || undefined
            }))
          ],
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
        products: productsWithDiscount.map(p => ({
          ...p,
          originalPrice: p.originalPrice,
          finalPrice: p.finalPrice,
          discountPerUnit: p.discountPerUnit
        })),
        totalAmount: finalAmount, // Usar el precio final con descuento
        originalAmount: totalAmount, // Mantener el precio original
        discountAmount: discountAmount, // Monto del descuento aplicado
        couponApplied: data.couponApplied ? {
          id: data.couponApplied.id,
          codigo: data.couponApplied.codigo,
          descuento: data.couponApplied.descuento,
          tipoDescuento: data.couponApplied.tipoDescuento,
          descuentoAplicado: discountAmount
        } : null,
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

      console.log('=== RESUMEN DE LA PREFERENCIA CREADA ===')
      console.log('ID de preferencia:', result.id)
      console.log('ID de compra:', purchaseId)
      console.log('Total original (sin descuento):', totalAmount)
      console.log('Descuento aplicado:', discountAmount)
      console.log('Total final (con descuento):', finalAmount)
      console.log('Cupón aplicado:', data.couponApplied ? data.couponApplied.codigo : 'Ninguno')
      console.log('Items en la preferencia:', preferenceData.body.items.length)
      console.log('Detalle de precios enviados a MercadoPago:')
      preferenceData.body.items.forEach((item, index) => {
        console.log(`  Item ${index + 1}: ${item.title} - Cantidad: ${item.quantity} - Precio unitario: $${item.unit_price}`)
      })

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
      console.log('🔍 === INICIO DE HANDLEWEBHOOK ===')
      console.log('🔍 Webhook data recibida:', JSON.stringify(webhookData, null, 2))
      
      const { type, data } = webhookData
      console.log('🔍 Tipo extraído:', type)
      console.log('🔍 Data extraída:', data)

      if (type === 'payment') {
        console.log('🔍 Es notificación de pago, procesando...')
        
        if (!client) {
          console.error('❌ Cliente de MercadoPago no inicializado')
          throw new Error('Cliente de MercadoPago no inicializado')
        }

        if (!data?.id) {
          console.error('❌ No se encontró ID del pago en los datos')
          throw new Error('ID del pago no encontrado en los datos del webhook')
        }

        console.log('🔍 ID del pago a procesar:', data.id)
        console.log('🔍 Cliente de MercadoPago disponible:', !!client)

        const paymentInstance = new Payment(client)
        console.log('🔍 Instancia de Payment creada')
        
        console.log('🔍 Intentando obtener información del pago...')
        const paymentInfo = await paymentInstance.get({ id: data.id })
        console.log('🔍 Información del pago obtenida:', JSON.stringify(paymentInfo, null, 2))
        
        const { external_reference, status } = paymentInfo
        console.log('🔍 Referencia externa:', external_reference)
        console.log('🔍 Estado del pago:', status)

        if (external_reference && external_reference.startsWith('purchase_')) {
          console.log('🔍 Referencia válida encontrada, buscando compra pendiente...')
          
          // Buscar la compra pendiente en Firestore
          const pendingPurchaseData = await FirebaseService.getPendingPurchase(external_reference)
          console.log('🔍 Compra pendiente encontrada:', !!pendingPurchaseData)

          if (!pendingPurchaseData) {
            console.error('❌ Compra pendiente no encontrada:', external_reference)
            return
          }

          console.log('=== PROCESANDO WEBHOOK ===')
          console.log('Referencia externa:', external_reference)
          console.log('Estado del pago:', status)
          console.log('Cupón aplicado:', pendingPurchaseData.couponApplied ? pendingPurchaseData.couponApplied.codigo : 'Ninguno')
          console.log('Total original:', pendingPurchaseData.originalAmount)
          console.log('Descuento aplicado:', pendingPurchaseData.discountAmount)
          console.log('Total final:', pendingPurchaseData.totalAmount)

          if (status === 'approved') {
            console.log('✅ Pago aprobado, procesando compra...')
            
            // Actualizar stock
            console.log('🔍 Actualizando stock de productos...')
            for (const prod of pendingPurchaseData.products) {
              try {
                const productData = await FirebaseService.getProductById(prod.productId)
                console.log(`🔍 Producto ${prod.productId} encontrado:`, !!productData)

                if (!productData) continue

                if (typeof productData.stock === 'number') {
                  if (productData.stock < prod.quantity) {
                    console.log(`⚠️ Stock insuficiente para ${prod.productId}`)
                    await FirebaseService.addFailedPurchase({
                      reason: 'Stock insuficiente en webhook',
                      ...prod,
                      buyerId: pendingPurchaseData.buyerId,
                      paymentId: paymentInfo.id,
                      createdAt: new Date()
                    })
                    continue
                  }

                  console.log(`🔍 Actualizando stock de ${prod.productId}: ${productData.stock} -> ${productData.stock - prod.quantity}`)
                  await FirebaseService.updateProductStock(prod.productId, productData.stock - prod.quantity)
                }
              } catch (stockError) {
                console.error(`❌ Error actualizando stock de ${prod.productId}:`, stockError)
                // Continuar con otros productos
              }
            }

            // Marcar cupón como usado si se aplicó uno
            if (pendingPurchaseData.couponApplied) {
              try {
                console.log('🔍 Marcando cupón como usado:', pendingPurchaseData.couponApplied.codigo)
                await FirebaseService.markCouponAsUsed(pendingPurchaseData.couponApplied.id)
                console.log('✅ Cupón marcado como usado en webhook:', pendingPurchaseData.couponApplied.codigo)
              } catch (couponError) {
                console.error('❌ Error al marcar cupón como usado en webhook:', couponError)
                // No fallar la compra si hay error con el cupón
              }
            }

            // Guardar la compra finalizada
            console.log('🔍 Guardando compra finalizada...')
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
              originalAmount: pendingPurchaseData.originalAmount,
              discountAmount: pendingPurchaseData.discountAmount,
              couponApplied: pendingPurchaseData.couponApplied,
              paidToSellers: false,
              createdAt: new Date(),
              deliveryOption: pendingPurchaseData.deliveryOption,
              deliverySlot: pendingPurchaseData.deliverySlot,
              comments: pendingPurchaseData.comments,
              isUserLoggedIn: pendingPurchaseData.isUserLoggedIn,
              addressId: pendingPurchaseData.addressId || null,
              addressData: pendingPurchaseData.addressData || null
            })
            console.log('✅ Compra finalizada guardada')

            // Eliminar la compra pendiente
            console.log('🔍 Eliminando compra pendiente...')
            await FirebaseService.deletePendingPurchase(external_reference)
            console.log('✅ Compra pendiente eliminada')

            console.log('✅ === COMPRA PROCESADA EXITOSAMENTE ===')
            console.log('✅ Referencia:', external_reference)
          } else if (status === 'rejected' || status === 'cancelled') {
            console.log('⚠️ Pago rechazado/cancelado, eliminando compra pendiente...')
            // Eliminar la compra pendiente si fue rechazada o cancelada
            await FirebaseService.deletePendingPurchase(external_reference)
            console.log('✅ Compra rechazada/cancelada eliminada:', external_reference)
          } else {
            console.log('⚠️ Estado del pago no manejado:', status)
          }
        } else {
          console.log('⚠️ Referencia externa no válida:', external_reference)
        }
      } else {
        console.log('⚠️ Tipo de webhook no manejado:', type)
      }
      
      console.log('🔍 === FIN DE HANDLEWEBHOOK ===')
    } catch (error) {
      console.error('❌ === ERROR EN HANDLEWEBHOOK ===')
      console.error('❌ Error completo:', error)
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      console.error('❌ Mensaje:', error instanceof Error ? error.message : 'Error desconocido')
      throw new Error(error instanceof Error ? error.message : 'Error procesando notificación')
    }
  }
} 