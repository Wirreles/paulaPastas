"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { FirebaseService } from "@/lib/firebase-service"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, CheckCircle, CreditCard, Wallet, MapPin, ChevronDown, X, Truck, Copy, Check } from "lucide-react"
import { ImageWrapper } from "@/components/ui/ImageWrapper"
import { ProductPlaceholder } from "@/components/ui/ImagePlaceholder"
import { useToast } from "@/lib/toast-context"
import { Logger } from "@/lib/logger"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user, userData } = useAuth()
  const router = useRouter()
  const { success, error } = useToast()

  const [step, setStep] = useState(1)
  const [purchaseOption, setPurchaseOption] = useState<"guest" | "logged">(user ? "logged" : "guest")
  const [formData, setFormData] = useState({
    name: userData?.nombre || "",
    email: userData?.email || "",
    phone: userData?.telefono || "",
    address: userData?.direccion || "",
    comments: "",
  })
  const [deliveryOption, setDeliveryOption] = useState<"delivery" | "pickup">("delivery")
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("transferencia")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [purchaseId, setPurchaseId] = useState<string | null>(null)
  const [whatsappUrl, setWhatsappUrl] = useState<string>("")
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [confirmedOrderSummary, setConfirmedOrderSummary] = useState<{
    purchaseId: string
    subtotal: number
    discount: number
    total: number
    whatsappUrl: string
    paymentMethod: string
  } | null>(null)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [userAddresses, setUserAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleCopy = (text: string, field: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text)
    }
    setCopiedField(field)
    success("Copiado", `${field.toUpperCase()} copiado al portapapeles`)
    setTimeout(() => {
      setCopiedField(null)
    }, 2500)
  }

  // Estado para cupones (deshabilitado temporalmente)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState("")
  const [couponSuccess, setCouponSuccess] = useState("")
  const [couponMarkedAsUsed, setCouponMarkedAsUsed] = useState(false)

  // Descuento automático por transferencia (10%)
  const transferDiscount = paymentMethod === "transferencia" ? Math.round(totalPrice * 0.10) : 0
  const finalPrice = totalPrice - transferDiscount

  // Horarios de entrega fijos (ejemplo, idealmente vendrían de Firebase)
  const deliverySlots = [
    "Miércoles 11:00 - 14:00 hs",
    "Jueves 11:00 - 14:00 hs",
    "Viernes 11:00 - 14:00 hs",
    "Sábado 11:00 - 14:00 hs",
    "Viernes 17:00 - 19:00 hs",
    "Martes 17:00 - 19:00 hs",
  ]

  useEffect(() => {
    if (items.length === 0 && !orderConfirmed) {
      router.push("/pastas") // Redirigir si el carrito está vacío y no hay un pedido confirmado
    }
  }, [items, orderConfirmed, router])

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.nombre || "",
        email: userData.email || "",
        phone: userData.telefono || "",
        address: userData.direccion || "", // Usar dirección del perfil como fallback
        comments: "",
      })
      setPurchaseOption("logged")

      // Cargar direcciones del usuario
      loadUserAddresses()
    }
  }, [userData])

  const loadUserAddresses = async () => {
    if (!user?.uid) return

    setIsLoadingAddresses(true)
    try {
      Logger.debug("🔄 Cargando direcciones del usuario: " + user.uid)
      const addresses = await FirebaseService.getDireccionesByUser(user.uid)
      Logger.debug("📍 Direcciones encontradas: " + addresses.length)
      setUserAddresses(addresses)

      // Si hay direcciones, seleccionar la primera por defecto
      if (addresses.length > 0) {
        setSelectedAddressId(addresses[0].id)
        setFormData(prev => ({
          ...prev,
          address: `${formatText(addresses[0].calle)} ${addresses[0].numero}, ${formatText(addresses[0].ciudad)}`
        }))
      } else {
        // Si no hay direcciones guardadas, mantener la dirección del perfil si existe
        Logger.debug("📍 No hay direcciones guardadas, usando dirección del perfil: " + (userData?.direccion || "ninguna"))
      }
    } catch (error) {
      Logger.error("❌ Error al cargar direcciones:", error)
    } finally {
      setIsLoadingAddresses(false)
    }
  }

  // Función para validar y aplicar cupón
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Por favor ingresa un código de cupón")
      return
    }

    if (appliedCoupon) {
      setCouponError("Ya tienes un cupón aplicado")
      return
    }

    setIsValidatingCoupon(true)
    setCouponError("")
    setCouponSuccess("")

    try {
      const result = await FirebaseService.validateCoupon(couponCode.trim(), totalPrice)

      if (result.valid && result.cupon) {
        if (result.cupon.montoMinimo > 0 && totalPrice < result.cupon.montoMinimo) {
          setCouponError(`Monto mínimo requerido: $${result.cupon.montoMinimo}`)
          return
        }

        if (result.cupon.usosActuales >= result.cupon.maxUsos) {
          setCouponError("Este cupón ya no está disponible (límite de usos alcanzado)")
          return
        }

        if (result.cupon.usado) {
          setCouponError("Este cupón ya no está disponible")
          return
        }

        setAppliedCoupon(result.cupon)
        setCouponSuccess(`¡Cupón aplicado! Descuento: ${result.cupon.tipoDescuento === 'porcentaje' ? `${result.cupon.descuento}%` : `$${result.cupon.descuento}`}`)
        setCouponCode("")
      } else {
        setCouponError(result.error || "Cupón inválido")
      }
    } catch (error) {
      Logger.error("❌ Error al validar cupón:", error)
      setCouponError("Error al validar el cupón. Intenta nuevamente.")
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponSuccess("")
    setCouponError("")
    setCouponMarkedAsUsed(false)
  }

  const calculateCouponDiscount = () => {
    if (!appliedCoupon) return 0

    if (appliedCoupon.tipoDescuento === 'porcentaje') {
      return (totalPrice * appliedCoupon.descuento) / 100
    } else {
      return appliedCoupon.descuento
    }
  }

  const getCouponInfo = () => {
    if (!appliedCoupon) return null

    const discountAmount = calculateCouponDiscount()
    const discountPercentage = appliedCoupon.tipoDescuento === 'porcentaje'
      ? `${appliedCoupon.descuento}%`
      : `$${appliedCoupon.descuento}`

    return {
      code: appliedCoupon.codigo,
      discountType: appliedCoupon.tipoDescuento === 'porcentaje' ? 'Porcentaje' : 'Monto fijo',
      discountValue: discountPercentage,
      discountAmount,
      savings: discountAmount > 0 ? `Ahorraste $${discountAmount}` : ''
    }
  }

  // Función para formatear texto con primera letra en mayúscula
  const formatText = (text: string): string => {
    if (!text) return text
    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId)
    const selectedAddress = userAddresses.find(addr => addr.id === addressId)

    if (selectedAddress) {
      const formattedAddress = `${formatText(selectedAddress.calle)} ${selectedAddress.numero}, ${formatText(selectedAddress.ciudad)}, ${formatText(selectedAddress.provincia)}`
      setFormData(prev => ({
        ...prev,
        address: formattedAddress
      }))
    }

    if (errors.address) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.address
        return newErrors
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const clearErrors = () => {
    setErrors({})
  }

  const validateStep1 = (): boolean => {
    clearErrors()
    if (purchaseOption === "logged" && !user) {
      setErrors({ step1: "Debes iniciar sesión para continuar" })
      return false
    }
    return true
  }

  const validateStep2 = (): boolean => {
    clearErrors()
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Ingresa un email válido"
    }

    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido"
    } else if (formData.phone.trim().length < 8) {
      newErrors.phone = "Ingresa un teléfono válido"
    }

    if (user && userAddresses.length > 0) {
      if (!selectedAddressId) {
        newErrors.address = "Selecciona una dirección de entrega"
      }
    } else if (!formData.address || (typeof formData.address === 'string' && !formData.address.trim())) {
      newErrors.address = "La dirección es requerida"
    } else if (typeof formData.address === 'string' && formData.address.trim().length < 10) {
      newErrors.address = "La dirección debe ser más específica"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }

    return true
  }

  const validateStep3 = (): boolean => {
    clearErrors()
    const newErrors: { [key: string]: string } = {}

    if (!selectedDeliverySlot) {
      newErrors.deliverySlot = "Selecciona un horario de entrega"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }

    return true
  }

  const handleNextStep = () => {
    let isValid = false
    switch (step) {
      case 1:
        isValid = validateStep1()
        break
      case 2:
        isValid = validateStep2()
        break
      case 3:
        isValid = validateStep3()
        break
      default:
        isValid = true
    }

    if (isValid) {
      setStep((prev) => prev + 1)
    }
  }

  const handlePrevStep = () => {
    clearErrors()
    setStep((prev) => prev - 1)
  }

  const handleSubmitOrder = async () => {
    if (paymentMethod === "mercadopago") {
      await handleMercadoPagoPayment()
    } else {
      await handleOtherPaymentMethods()
    }
  }

  const handleMercadoPagoPayment = async () => {
    if (isSubmitting || isCreatingPayment) return
    setIsCreatingPayment(true)
    try {
      Logger.debug("🔄 Iniciando pago con MercadoPago")

      if (!formData.name || !formData.email || !formData.phone) {
        error("Datos incompletos", "Por favor completa todos los campos requeridos")
        return
      }

      let finalAddress = formData.address
      let addressData = null

      if (user && userAddresses.length > 0 && selectedAddressId) {
        const selectedAddress = userAddresses.find(addr => addr.id === selectedAddressId)
        if (selectedAddress) {
          addressData = selectedAddress
          finalAddress = `${formatText(selectedAddress.calle)} ${selectedAddress.numero}, ${formatText(selectedAddress.ciudad)}, ${formatText(selectedAddress.provincia)}`
        }
      } else if (!finalAddress) {
        error("Dirección requerida", "Por favor ingresa tu dirección de entrega")
        return
      }

      if (!selectedDeliverySlot) {
        error("Horario requerido", "Por favor selecciona un horario de entrega")
        return
      }

      const paymentData = {
        items: items.map((item) => {
          if (!item.price || item.price <= 0) {
            throw new Error(`Precio inválido para el producto ${item.name}`)
          }
          return {
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            imageUrl: item.imageUrl,
          }
        }),
        userData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: finalAddress,
        },
        deliveryOption,
        deliverySlot: deliveryOption === "delivery" ? selectedDeliverySlot : null,
        comments: formData.comments,
        isUserLoggedIn: !!user,
        userId: user?.uid || null,
        addressData: addressData,
        addressId: selectedAddressId || null,
        couponApplied: null,
        couponCode: null,
      }

      const response = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || "Error al crear pago")
      }

      const result = await response.json()
      Logger.debug("✅ Respuesta del servicio:", JSON.stringify(result))

      if (result.initPoint) {
        window.location.href = result.initPoint
      } else if (result.sandboxInitPoint) {
        window.location.href = result.sandboxInitPoint
      } else {
        throw new Error("No se recibió el enlace de pago del servicio")
      }

    } catch (err: unknown) {
      Logger.error("❌ Error en MercadoPago:", err)
      error("Error de pago", err instanceof Error ? err.message : "Error al procesar el pago")
    } finally {
      setIsCreatingPayment(false)
    }
  }

  const handleOtherPaymentMethods = async () => {
    if (isSubmitting || isCreatingPayment) return
    setIsSubmitting(true)
    try {
      let finalAddress = formData.address
      let addressData = null

      if (user && userAddresses.length > 0 && selectedAddressId) {
        const selectedAddress = userAddresses.find(addr => addr.id === selectedAddressId)
        if (selectedAddress) {
          addressData = selectedAddress
          finalAddress = `${formatText(selectedAddress.calle)} ${selectedAddress.numero}, ${formatText(selectedAddress.ciudad)}, ${formatText(selectedAddress.provincia)}`
        }
      } else if (!finalAddress) {
        error("Dirección requerida", "Por favor ingresa tu dirección de entrega")
        return
      }

      const transferDesc = paymentMethod === "transferencia" ? Math.round(totalPrice * 0.10) : 0
      const calculatedTotal = totalPrice - transferDesc

      const purchaseData = {
        buyerId: user?.uid || null,
        buyerEmail: formData.email,
        buyerName: formData.name,
        buyerPhone: formData.phone,
        buyerAddress: finalAddress,
        products: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl,
          originalPrice: item.price,
          finalPrice: item.price,
          discountPerUnit: 0
        })),
        totalAmount: calculatedTotal,
        originalAmount: totalPrice,
        discountAmount: transferDesc,
        couponApplied: null,
        couponCode: null,
        deliveryOption: deliveryOption,
        deliverySlot: deliveryOption === "delivery" ? selectedDeliverySlot : null,
        comments: formData.comments,
        isUserLoggedIn: !!user,
        addressId: selectedAddressId || null,
        addressData: addressData,
        paymentMethod: paymentMethod || "transferencia"
      }

      const response = await fetch("/api/checkout/process-cash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(purchaseData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al procesar el pedido")
      }

      const result = await response.json()
      const newPurchaseId = result.purchaseId

      // Generar mensaje detallado para WhatsApp
      const whatsappNumber = "5493413557400"
      const itemsList = items.map(item => `• ${item.quantity}x ${item.name} (${formatPrice(item.price * item.quantity)})`).join('\n')
      
      const messageText = `🍝 *¡Hola Paula Pastas! Acabo de realizar un pedido para pagar por Transferencia (10% OFF):*\n\n` +
        `📋 *N° de Pedido:* ${newPurchaseId}\n` +
        `👤 *Cliente:* ${formData.name}\n` +
        `📱 *Teléfono:* ${formData.phone}\n` +
        `📍 *Dirección de Entrega:* ${finalAddress}\n` +
        `⏰ *Horario Preferido:* ${selectedDeliverySlot}\n` +
        (formData.comments ? `💬 *Comentarios:* ${formData.comments}\n` : '') +
        `\n🛒 *Productos:*\n${itemsList}\n\n` +
        `💵 *Subtotal:* ${formatPrice(totalPrice)}\n` +
        `✨ *Descuento Transferencia (10%):* -${formatPrice(transferDesc)}\n` +
        `💰 *Total a Transferir:* ${formatPrice(calculatedTotal)}\n\n` +
        `📎 *Adjunto el comprobante de transferencia a continuación:*`

      const generatedWspUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`

      Logger.debug("✅ Compra creada vía API: " + newPurchaseId)

      setPurchaseId(newPurchaseId)
      setWhatsappUrl(generatedWspUrl)
      setConfirmedOrderSummary({
        purchaseId: newPurchaseId,
        subtotal: totalPrice,
        discount: transferDesc,
        total: calculatedTotal,
        whatsappUrl: generatedWspUrl,
        paymentMethod: paymentMethod || "transferencia"
      })
      setOrderConfirmed(true)
      clearCart()
      success("Pedido confirmado", "Tu pedido ha sido recibido con éxito")

    } catch (err: unknown) {
      Logger.error("Error al procesar el pedido:", err)
      const errorMessage = err instanceof Error ? err.message : "Hubo un error al procesar tu pedido. Por favor, inténtalo de nuevo."
      error("Error", errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderConfirmed) {
    const summarySubtotal = confirmedOrderSummary?.subtotal ?? totalPrice
    const summaryDiscount = confirmedOrderSummary?.discount ?? transferDiscount
    const summaryTotal = confirmedOrderSummary?.total ?? finalPrice
    const summaryWspUrl = confirmedOrderSummary?.whatsappUrl ?? whatsappUrl
    const summaryPurchaseId = confirmedOrderSummary?.purchaseId ?? purchaseId

    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg text-center p-8 shadow-xl border-emerald-100">
          <CheckCircle className="w-20 h-20 text-emerald-600 mx-auto mb-6" />
          <CardTitle className="text-3xl font-bold text-neutral-900 mb-2">¡Pedido Confirmado!</CardTitle>
          <p className="text-sm font-semibold text-emerald-800 bg-emerald-50 py-1.5 px-4 rounded-full w-fit mx-auto mb-4 border border-emerald-200">
            N° de Pedido: {summaryPurchaseId}
          </p>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 text-left space-y-2">
            <div className="flex justify-between text-sm text-neutral-700">
              <span>Subtotal:</span>
              <span>{formatPrice(summarySubtotal)}</span>
            </div>
            {summaryDiscount > 0 && (
              <div className="flex justify-between text-sm text-emerald-700 font-medium">
                <span>Descuento Transferencia (10%):</span>
                <span>-{formatPrice(summaryDiscount)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-bold text-neutral-900">
              <span>Total a Transferir:</span>
              <span className="text-emerald-700 font-bold">{formatPrice(summaryTotal)}</span>
            </div>
          </div>

          {/* Datos Bancarios para Transferencia */}
          <div className="bg-white border border-emerald-200 rounded-xl p-4 mb-6 shadow-sm text-left space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Datos de la Cuenta Bancaria
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Transferencia
              </span>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-neutral-500 font-medium">Titular:</span>
                <span className="font-bold text-neutral-900">Paula Aylen Pacheco</span>
              </div>

              {/* Alias con botón Copiar */}
              <div className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/70">
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase">Alias</span>
                  <span className="font-mono font-bold text-neutral-900 text-sm sm:text-base select-all">paulapastas</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy("paulapastas", "alias")}
                  className="h-8 px-3 text-xs font-medium gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 active:scale-95"
                >
                  {copiedField === "alias" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
              </div>

              {/* CBU con botón Copiar */}
              <div className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/70">
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase">CBU</span>
                  <span className="font-mono font-bold text-neutral-900 text-xs sm:text-sm tracking-tight select-all">0000003100041772766057</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy("0000003100041772766057", "cbu")}
                  className="h-8 px-3 text-xs font-medium gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 active:scale-95"
                >
                  {copiedField === "cbu" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
            Una vez realizada la transferencia, hacé clic en el siguiente botón para abrir WhatsApp con los datos de tu pedido y enviar el comprobante:
          </p>

          <div className="flex flex-col gap-3">
            {summaryWspUrl && (
              <a
                href={summaryWspUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-base shadow-lg"
              >
                <span>💬 Abrir WhatsApp y enviar comprobante</span>
              </a>
            )}
            <Button variant="outline" onClick={() => router.push("/")} className="w-full py-3">
              Volver al Inicio
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-neutral-50 py-6 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Columna principal del formulario */}
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-neutral-900">Finalizar Compra</CardTitle>

              {/* Indicador de progreso */}
              <div className="mt-3 sm:mt-4">
                <div className="flex items-center justify-between mb-2 px-1">
                  {[1, 2, 3, 4].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${step >= stepNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                        }`}>
                        {stepNumber}
                      </div>
                      {stepNumber < 4 && (
                        <div className={`w-6 sm:w-12 h-1 mx-1 sm:mx-2 ${step > stepNumber ? 'bg-blue-600' : 'bg-neutral-200'
                          }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-neutral-600 px-1">
                  <span className="text-center flex-1">Modalidad</span>
                  <span className="text-center flex-1">Datos</span>
                  <span className="text-center flex-1">Horario</span>
                  <span className="text-center flex-1">Pago</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Paso 1: Elegir modalidad de compra */}
              {step === 1 && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 px-1">Paso 1: Elegir modalidad de compra</h2>

                  {errors.step1 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mx-1">
                      <p className="text-sm text-red-700">{errors.step1}</p>
                    </div>
                  )}

                  <RadioGroup
                    value={purchaseOption}
                    onValueChange={(value: "guest" | "logged") => {
                      setPurchaseOption(value)
                      clearErrors()
                    }}
                    className="flex flex-col space-y-2 sm:space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-neutral-50 transition-colors">
                      <RadioGroupItem value="guest" id="guest" className="flex-shrink-0" />
                      <Label htmlFor="guest" className="font-medium text-sm sm:text-base leading-relaxed cursor-pointer">
                        Comprar como invitado
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-neutral-50 transition-colors">
                      <RadioGroupItem value="logged" id="logged" disabled={!!user} className="flex-shrink-0 mt-0.5" />
                      <Label htmlFor="logged" className="font-medium text-sm sm:text-base leading-relaxed cursor-pointer flex-1">
                        {user
                          ? `Iniciar sesión (ya logueado como ${userData?.nombre || user.email})`
                          : "Iniciar sesión para autocompletar los datos"}
                      </Label>
                    </div>
                  </RadioGroup>

                  {user && purchaseOption === "logged" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mx-1">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-800 mb-1 sm:mb-2 text-sm sm:text-base">Usuario logueado</h4>
                          <p className="text-xs sm:text-sm text-green-700 mb-2 leading-relaxed">
                            Tus datos se han cargado automáticamente desde tu perfil.
                          </p>
                          {userAddresses.length > 0 && (
                            <div className="flex items-center space-x-2 text-xs sm:text-sm text-green-700">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="leading-relaxed">
                                {userAddresses.length} dirección{userAddresses.length !== 1 ? 'es' : ''} guardada{userAddresses.length !== 1 ? 's' : ''} disponible{userAddresses.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!user && purchaseOption === "logged" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mx-1">
                      <p className="text-xs sm:text-sm text-blue-700 mb-3 leading-relaxed">
                        Para continuar con esta opción, necesitas iniciar sesión.
                      </p>
                      <Button onClick={() => router.push("/login")} className="w-full text-sm sm:text-base">
                        Ir a Iniciar Sesión
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 sm:pt-4">
                    <Button
                      onClick={handleNextStep}
                      disabled={purchaseOption === "logged" && !user}
                      className="min-w-[100px] sm:min-w-[120px] text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}

              {/* Paso 2: Completar datos de entrega */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Paso 2: Completar datos de entrega</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre y Apellido *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={errors.name ? "border-red-500 focus:border-red-500" : ""}
                        placeholder="Tu nombre completo"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? "border-red-500 focus:border-red-500" : ""}
                        placeholder="tu@email.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono de contacto *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={errors.phone ? "border-red-500 focus:border-red-500" : ""}
                        placeholder="11 1234-5678"
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="address">Dirección de entrega *</Label>
                      {user && userAddresses.length > 0 ? (
                        <div className="space-y-2">
                          <Select
                            value={selectedAddressId}
                            onValueChange={handleAddressChange}
                          >
                            <SelectTrigger className={errors.address ? "border-red-500 focus:border-red-500" : ""}>
                              <SelectValue placeholder="Selecciona una dirección guardada" />
                            </SelectTrigger>
                            <SelectContent>
                              {userAddresses.map((address) => (
                                <SelectItem key={address.id} value={address.id}>
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4 text-neutral-500" />
                                    <div className="text-left">
                                      <div className="font-medium">
                                        {formatText(address.calle)} {address.numero}
                                      </div>
                                      <div className="text-sm text-neutral-500">
                                        {formatText(address.ciudad)}, {formatText(address.provincia)}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {errors.address && (
                            <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                          )}

                          {selectedAddressId && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-start space-x-2">
                                <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                                <div className="text-sm">
                                  <div className="font-medium text-green-800">Dirección seleccionada:</div>
                                  <div className="text-green-700">{typeof formData.address === 'string' ? formData.address : JSON.stringify(formData.address)}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : user && isLoadingAddresses ? (
                        <div className="flex items-center space-x-2 p-3 border rounded-md">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-neutral-600">Cargando direcciones...</span>
                        </div>
                      ) : user && userAddresses.length === 0 ? (
                        <div className="space-y-2">
                          <>
                            <Input
                              id="address"
                              name="address"
                              value={typeof formData.address === 'string' ? formData.address : ''}
                              onChange={handleInputChange}
                              placeholder="Ingresa tu dirección completa"
                              className={errors.address ? "border-red-500 focus:border-red-500" : ""}
                            />
                            {errors.address && (
                              <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                            )}
                          </>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <MapPin className="w-4 h-4 text-yellow-600 mt-0.5" />
                              <div className="text-sm">
                                <div className="font-medium text-yellow-800">No tienes direcciones guardadas</div>
                                <div className="text-yellow-700">
                                  Puedes agregar direcciones desde tu perfil para futuras compras.
                                </div>
                                <Link href="/dashboard-usuario" className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1 inline-block">
                                  Gestionar direcciones →
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Input
                            id="address"
                            name="address"
                            value={typeof formData.address === 'string' ? formData.address : ''}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu dirección completa"
                            className={errors.address ? "border-red-500 focus:border-red-500" : ""}
                          />
                          {errors.address && (
                            <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="comments">Comentarios adicionales (ej. datos del portero)</Label>
                    <Textarea
                      id="comments"
                      name="comments"
                      value={formData.comments}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Modalidad de entrega</Label>
                    <RadioGroup
                      value="delivery"
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-3 p-4 border-2 border-primary-100 bg-primary-50/30 rounded-xl">
                        <RadioGroupItem value="delivery" id="delivery-fixed" checked />
                        <div className="flex items-center space-x-3">
                          <Truck className="w-5 h-5 text-primary-600" />
                          <div>
                            <Label htmlFor="delivery-fixed" className="font-bold text-neutral-900 cursor-default">Envío a domicilio</Label>
                            <p className="text-xs text-neutral-500">Recibí tu pedido en la puerta de tu casa</p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800 text-sm">Actualmente solo realizamos envíos a domicilio para garantizar la frescura.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handlePrevStep}>
                      Anterior
                    </Button>
                    <Button onClick={handleNextStep}>Siguiente</Button>
                  </div>
                </div>
              )}

              {/* Paso 3: Elegir día y horario de entrega preferido */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Elegí tu horario de preferencia para recibir el pedido</h2>

                  <div className="space-y-4">
                    <RadioGroup
                      value={selectedDeliverySlot}
                      onValueChange={(value) => {
                        setSelectedDeliverySlot(value)
                        clearErrors()
                      }}
                      className="flex flex-col space-y-2"
                    >
                      {deliverySlots.map((slot) => (
                        <div key={slot} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-neutral-50">
                          <RadioGroupItem value={slot} id={slot} />
                          <Label htmlFor={slot} className="font-medium">{slot}</Label>
                        </div>
                      ))}
                    </RadioGroup>

                    {errors.deliverySlot && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700">{errors.deliverySlot}</p>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        <strong>Envío a domicilio:</strong> Para confirmar el día y horario definitivo nos vamos a comunicar por WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handlePrevStep}>
                      Anterior
                    </Button>
                    <Button onClick={handleNextStep} className="min-w-[120px]">
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}

              {/* Paso 4: Confirmar pago del pedido */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Paso 4: Confirmar pago del pedido</h2>
                  <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg text-sm mb-4">
                    <p className="font-semibold">Importante:</p>
                    <p>El costo de envío se coordina por WhatsApp luego de la compra.</p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 p-4 rounded-lg text-sm mb-4">
                    <p className="font-semibold">Nota:</p>
                    <p>Los envíos se realizan a partir de los {formatPrice(2500)}.</p>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold mb-2">Métodos de Pago Disponibles:</h3>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="flex flex-col space-y-2 sm:space-y-3"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                      <RadioGroupItem value="transferencia" id="transferencia" className="flex-shrink-0" />
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
                        <div className="flex flex-col">
                          <Label htmlFor="transferencia" className="font-bold text-sm sm:text-base cursor-pointer text-emerald-900">
                            10% Si pagás por Transferencia
                          </Label>
                          <span className="text-xs text-neutral-500">
                            Transferencia bancaria directa con descuento
                          </span>
                        </div>
                      </div>
                      <div className="ml-auto flex-shrink-0">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-md">
                          10% OFF
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                      <RadioGroupItem value="mercadopago" id="mercadopago" className="flex-shrink-0" />
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex flex-col">
                          <Label htmlFor="mercadopago" className="font-medium text-sm sm:text-base cursor-pointer">
                            MercadoPago
                          </Label>
                          <span className="text-xs text-neutral-500">
                            Tarjeta de crédito, débito o dinero en cuenta
                          </span>
                        </div>
                      </div>
                      <div className="ml-auto text-xs sm:text-sm text-neutral-600 flex-shrink-0">
                        <span className="hidden sm:inline">Precio de lista</span>
                      </div>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "transferencia" && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-3 sm:mt-4 space-y-3">
                      <div>
                        <h4 className="font-semibold text-emerald-900 mb-1 text-sm sm:text-base flex items-center gap-1.5">
                          <span>✨ Descuento del 10% aplicado</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                          Podés realizar la transferencia a la siguiente cuenta bancaria y adjuntarnos el comprobante por WhatsApp al confirmar tu compra:
                        </p>
                      </div>

                      {/* Caja de Datos Bancarios */}
                      <div className="bg-white border border-emerald-200/80 rounded-lg p-3 sm:p-4 space-y-2.5 text-xs sm:text-sm">
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-neutral-500 font-medium">Titular:</span>
                          <span className="font-bold text-neutral-900">Paula Aylen Pacheco</span>
                        </div>

                        {/* Alias con botón Copiar */}
                        <div className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/70">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-neutral-500 font-semibold uppercase">Alias</span>
                            <span className="font-mono font-bold text-neutral-900 text-sm select-all">paulapastas</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy("paulapastas", "alias")}
                            className="h-7 px-2.5 text-xs font-medium gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 active:scale-95"
                          >
                            {copiedField === "alias" ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-semibold text-[11px]">¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-emerald-700" />
                                <span className="text-[11px]">Copiar</span>
                              </>
                            )}
                          </Button>
                        </div>

                        {/* CBU con botón Copiar */}
                        <div className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/70">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-neutral-500 font-semibold uppercase">CBU</span>
                            <span className="font-mono font-bold text-neutral-900 text-xs sm:text-sm tracking-tight select-all">0000003100041772766057</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy("0000003100041772766057", "cbu")}
                            className="h-7 px-2.5 text-xs font-medium gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 active:scale-95"
                          >
                            {copiedField === "cbu" ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-semibold text-[11px]">¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-emerald-700" />
                                <span className="text-[11px]">Copiar</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "mercadopago" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4">
                      <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">💳 Pago seguro con MercadoPago</h4>
                      <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                        <li>• Pagá con tarjeta de crédito o débito</li>
                        <li>• Dinero en cuenta de MercadoPago</li>
                        <li>• Pago en efectivo en puntos de pago</li>
                        <li>• Transacción 100% segura</li>
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-4 sm:mt-6">
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                    >
                      Anterior
                    </Button>
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting || isCreatingPayment}
                      className={`w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 ${paymentMethod === "mercadopago" ? "bg-blue-600 hover:bg-blue-700" : "bg-primary-600 hover:bg-primary-700 text-white"
                        }`}
                    >
                      {isCreatingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          <span className="hidden sm:inline">Conectando con MercadoPago...</span>
                          <span className="sm:hidden">Conectando...</span>
                        </>
                      ) : isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          <span className="hidden sm:inline">Confirmando pedido...</span>
                          <span className="sm:hidden">Confirmando...</span>
                        </>
                      ) : (
                        <>
                          {paymentMethod === "mercadopago" ? (
                            <>
                              <CreditCard className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Pagar con MercadoPago</span>
                              <span className="sm:hidden">Pagar con MP</span>
                            </>
                          ) : (
                            <>
                              <span>Confirmar Pedido</span>
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna del resumen del pedido */}
        <div className="lg:col-span-1">
          <Card className="p-4 sm:p-6 sticky top-20 sm:top-24">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-neutral-900">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2 sm:gap-3">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-md overflow-hidden">
                      <ImageWrapper
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        fallback="/placeholder.svg?height=64&width=64&text=Producto"
                        placeholder={<ProductPlaceholder className="object-cover" />}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-800 text-xs sm:text-sm leading-tight">{item.name}</p>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="font-semibold text-neutral-900 text-xs sm:text-sm flex-shrink-0">{formatPrice(item.quantity * item.price)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />

              {/* Resumen de precios */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm text-neutral-600">
                  <span>Subtotal:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>

                {paymentMethod === "transferencia" && (
                  <div className="flex justify-between text-xs sm:text-sm text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200/60">
                    <span className="truncate pr-2 font-semibold">10% Transferencia:</span>
                    <span className="flex-shrink-0 font-bold">-{formatPrice(transferDiscount)}</span>
                  </div>
                )}

                <Separator />
                <div className="flex justify-between items-center text-base sm:text-lg font-bold text-neutral-900">
                  <span>Total del Pedido:</span>
                  <span className={paymentMethod === "transferencia" ? "text-emerald-700" : ""}>{formatPrice(finalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
