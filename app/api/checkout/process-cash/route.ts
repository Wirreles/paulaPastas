import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { Logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      buyerId,
      buyerEmail,
      buyerName,
      buyerPhone,
      buyerAddress,
      products,
      couponCode, // Usaremos el código para re-validar en server
      deliveryOption,
      deliverySlot,
      comments,
      isUserLoggedIn,
      addressId,
      addressData,
      paymentMethod
    } = body

    // 1. Validaciones básicas de presencia
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "No hay productos en el pedido" }, { status: 400 })
    }

    if (!buyerEmail || !buyerName || !buyerPhone || !buyerAddress) {
      return NextResponse.json({ error: "Datos de contacto incompletos" }, { status: 400 })
    }

    // 2. RECALCULAR Y VALIDAR PRODUCTOS DESDE FIRESTORE (SEGURIDAD)
    let subtotal = 0
    const validatedProducts = []

    for (const item of products) {
      const productRef = adminDb.collection("productos").doc(item.productId)
      const productSnap = await productRef.get()

      if (!productSnap.exists) {
        return NextResponse.json(
          { error: `Producto inválido o inexistente: ${item.name}` },
          { status: 400 }
        )
      }

      const productData = productSnap.data() || {}
      
      // Validar disponibilidad
      if (productData.disponible === false) {
          return NextResponse.json(
            { error: `El producto ${productData.nombre} no está disponible actualmente.` },
            { status: 400 }
          )
      }

      // Validar stock (solo si el campo existe en la BD)
      if (typeof productData.stock === 'number' && productData.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para el producto ${productData.nombre}` },
          { status: 400 }
        )
      }

      const unitPrice = productData.precio
      const totalItem = unitPrice * item.quantity

      subtotal += totalItem

      validatedProducts.push({
        productId: item.productId,
        name: productData.nombre,
        quantity: item.quantity,
        price: unitPrice,
        imageUrl: productData.imagen || null,
        total: totalItem,
        categoria: productData.categoria || "",
        subcategoria: productData.subcategoria || ""
      })
    }

    // 3. VALIDAR CUPÓN EN BACKEND (SEGURIDAD)
    let discountAmount = 0
    let couponAppliedData = null

    if (couponCode) {
      const couponQuery = await adminDb
        .collection("cupones")
        .where("codigo", "==", couponCode.trim())
        .limit(1)
        .get()

      if (!couponQuery.empty) {
        const couponDoc = couponQuery.docs[0]
        const coupon = couponDoc.data()

        // Validar que el cupón esté activo y tenga usos disponibles
        if (coupon.activo && coupon.usosActuales < coupon.maxUsos) {
          // Validar monto mínimo si existe
          if (!coupon.montoMinimo || subtotal >= coupon.montoMinimo) {
            if (coupon.tipoDescuento === "porcentaje") {
              discountAmount = (subtotal * coupon.descuento) / 100
            } else {
              discountAmount = coupon.descuento
            }

            couponAppliedData = {
              id: couponDoc.id,
              codigo: coupon.codigo,
              descuento: coupon.descuento,
              tipoDescuento: coupon.tipoDescuento,
              descuentoAplicado: discountAmount
            }
          }
        }
      }
    }

    const finalTotal = Math.max(0, subtotal - discountAmount)

    // 4. PREPARAR DATOS FINALES PARA FIRESTORE
    const purchaseData = {
      buyerId: buyerId || null,
      buyerEmail,
      buyerName,
      buyerPhone,
      buyerAddress,
      products: validatedProducts,
      paymentId: `cash-delivery-${Date.now()}`,
      status: 'pending',
      totalAmount: finalTotal,
      originalAmount: subtotal,
      discountAmount: discountAmount,
      couponApplied: couponAppliedData,
      paidToSellers: false,
      createdAt: FieldValue.serverTimestamp(),
      deliveryOption,
      deliverySlot: deliveryOption === "delivery" ? deliverySlot : null,
      comments: comments || "",
      isUserLoggedIn: !!isUserLoggedIn,
      addressId: addressId || null,
      addressData: addressData || null,
      orderStatus: 'en_preparacion',
      paymentMethod: paymentMethod || 'efectivo'
    }

    // 5. GUARDAR EN FIRESTORE USANDO ADMIN SDK
    const purchaseRef = adminDb.collection('purchases').doc()
    await purchaseRef.set(purchaseData)
    const purchaseId = purchaseRef.id

    Logger.log(`✅ Compra en efectivo SEGURA creada vía API (Admin) con ID: ${purchaseId}`)

    // 6. MARCAR CUPÓN COMO USADO (Incremento atómico para evitar race conditions)
    if (couponAppliedData) {
      try {
        await adminDb.collection('cupones').doc(couponAppliedData.id).update({
          usosActuales: FieldValue.increment(1),
          // Actualizamos 'usado' si llegamos al límite
          // Nota: Esto es opcional ya que la validación arriba comprueba usosActuales < maxUsos
          fechaActualizacion: FieldValue.serverTimestamp()
        })
        Logger.log(`✅ Cupón ${couponAppliedData.codigo} incrementado vía Admin`)
      } catch (e) {
        Logger.error(`❌ Error al incrementar cupón vía Admin:`, e)
      }
    }

    return NextResponse.json({
      success: true,
      purchaseId: purchaseId
    })

  } catch (error) {
    console.error("❌ Error crítico en process-cash:", error)
    return NextResponse.json(
      { 
        error: "Error interno al procesar el pedido",
        details: error instanceof Error ? error.message : "Error desconocido"
      }, 
      { status: 500 }
    )
  }
}
