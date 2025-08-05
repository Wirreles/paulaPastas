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
import { Loader2, CheckCircle, CreditCard, Wallet, MapPin, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/lib/toast-context"
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
  const [paymentMethod, setPaymentMethod] = useState<string>("mercadopago")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [userAddresses, setUserAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Horarios de entrega fijos (ejemplo, idealmente vendrían de Firebase)
  const deliverySlots = [
    "Miércoles 18:00 - 20:00 hs",
    "Jueves 18:00 - 20:00 hs",
    "Viernes 18:00 - 20:00 hs",
    "Sábado 12:00 - 14:00 hs",
    "Martes 18:00 - 20:00 hs (sujeta a confirmación)",
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
        address: "", // Se llenará con la dirección seleccionada
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
      console.log("🔄 Cargando direcciones del usuario:", user.uid)
      const addresses = await FirebaseService.getDireccionesByUser(user.uid)
      console.log("📍 Direcciones encontradas:", addresses)
      setUserAddresses(addresses)
      
      // Si hay direcciones, seleccionar la primera por defecto
      if (addresses.length > 0) {
        setSelectedAddressId(addresses[0].id)
        const firstAddress = addresses[0]
        const formattedAddress = `${firstAddress.calle} ${firstAddress.numero}, ${firstAddress.ciudad}, ${firstAddress.provincia}`
        setFormData(prev => ({
          ...prev,
          address: formattedAddress
        }))
      }
    } catch (err: unknown) {
      console.error("❌ Error cargando direcciones:", err)
      error("Error", "No se pudieron cargar las direcciones guardadas")
    } finally {
      setIsLoadingAddresses(false)
    }
  }

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId)
    const selectedAddress = userAddresses.find(addr => addr.id === addressId)
    
    if (selectedAddress) {
      const formattedAddress = `${selectedAddress.calle} ${selectedAddress.numero}, ${selectedAddress.ciudad}, ${selectedAddress.provincia}`
      setFormData(prev => ({
        ...prev,
        address: formattedAddress
      }))
    }
    
    // Limpiar error de dirección cuando se selecciona una
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
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Función para limpiar errores
  const clearErrors = () => {
    setErrors({})
  }

  // Validaciones para cada paso
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
    const newErrors: {[key: string]: string} = {}

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres"
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Ingresa un email válido"
    }

    // Validar teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido"
    } else if (formData.phone.trim().length < 8) {
      newErrors.phone = "Ingresa un teléfono válido"
    }

    // Validar dirección
    if (user && userAddresses.length > 0) {
      if (!selectedAddressId) {
        newErrors.address = "Selecciona una dirección de entrega"
      }
    } else if (!formData.address.trim()) {
      newErrors.address = "La dirección es requerida"
    } else if (formData.address.trim().length < 10) {
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
    const newErrors: {[key: string]: string} = {}

    if (deliveryOption === "delivery" && !selectedDeliverySlot) {
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
    setIsCreatingPayment(true)
    try {
      console.log("🔄 Iniciando pago con MercadoPago")
      
      // Validar datos requeridos
      if (!formData.name || !formData.email || !formData.phone) {
        error("Datos incompletos", "Por favor completa todos los campos requeridos")
        return
      }

      // Validar dirección según el tipo de usuario
      if (user && userAddresses.length > 0) {
        if (!selectedAddressId) {
          error("Dirección requerida", "Por favor selecciona una dirección de entrega")
          return
        }
      } else if (!formData.address) {
        error("Dirección requerida", "Por favor ingresa tu dirección de entrega")
        return
      }

      if (deliveryOption === "delivery" && !selectedDeliverySlot) {
        error("Horario requerido", "Por favor selecciona un horario de entrega")
        return
      }

      // Obtener la dirección seleccionada si el usuario está logueado
      let finalAddress = formData.address
      let selectedAddressData = null
      
      if (user && userAddresses.length > 0 && selectedAddressId) {
        const selectedAddress = userAddresses.find(addr => addr.id === selectedAddressId)
        if (selectedAddress) {
          selectedAddressData = selectedAddress
          finalAddress = `${selectedAddress.calle} ${selectedAddress.numero}, ${selectedAddress.ciudad}, ${selectedAddress.provincia}`
        }
      }

      // Preparar datos para la API
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
        deliverySlot: deliveryOption === "delivery" ? selectedDeliverySlot : undefined,
        comments: formData.comments,
        isUserLoggedIn: !!user,
        userId: user?.uid,
        selectedAddressId: selectedAddressId || null,
        selectedAddressData: selectedAddressData,
      }

      console.log("📦 Datos del pago:", paymentData)

      // Crear pago usando el servicio integrado
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
      console.log("✅ Respuesta del servicio:", result)

      // Redirigir a MercadoPago si se recibió el enlace
      if (result.initPoint) {
        window.location.href = result.initPoint
      } else if (result.sandboxInitPoint) {
        // Usar sandbox en desarrollo
        window.location.href = result.sandboxInitPoint
      } else {
        throw new Error("No se recibió el enlace de pago del servicio")
      }

    } catch (err: unknown) {
      console.error("❌ Error en MercadoPago:", err)
      error("Error de pago", err instanceof Error ? err.message : "Error al procesar el pago")
    } finally {
      setIsCreatingPayment(false)
    }
  }

  const handleOtherPaymentMethods = async () => {
    setIsSubmitting(true)
    try {
      // Obtener la dirección final (misma lógica que MercadoPago)
      let finalAddress = formData.address
      let selectedAddressData = null
      
      if (user && userAddresses.length > 0 && selectedAddressId) {
        const selectedAddress = userAddresses.find(addr => addr.id === selectedAddressId)
        if (selectedAddress) {
          selectedAddressData = selectedAddress
          finalAddress = `${selectedAddress.calle} ${selectedAddress.numero}, ${selectedAddress.ciudad}, ${selectedAddress.provincia}`
        }
      }

      // Usar el mismo formato de datos que MercadoPago
      const orderData = {
        userId: user?.uid || null,
        userName: formData.name,
        userEmail: formData.email,
        phone: formData.phone,
        address: finalAddress,
        comments: formData.comments,
        deliveryOption: deliveryOption,
        deliverySlot: deliveryOption === "delivery" ? selectedDeliverySlot : undefined,
        paymentMethod: paymentMethod,
        totalAmount: totalPrice,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl,
        })),
        // Campos adicionales para mantener consistencia
        isUserLoggedIn: !!user,
        selectedAddressId: selectedAddressId || null,
        selectedAddressData: selectedAddressData,
      }

      const newOrderId = await FirebaseService.addOrder(orderData)
      setOrderId(newOrderId)
      setOrderConfirmed(true)
      clearCart()
      success("Pedido confirmado", "Tu pedido ha sido recibido con éxito")
    } catch (err: unknown) {
      console.error("Error al procesar el pedido:", err)
      error("Error", "Hubo un error al procesar tu pedido. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderConfirmed) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md text-center p-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <CardTitle className="text-3xl font-bold mb-4">¡Pedido Confirmado!</CardTitle>
          <p className="text-neutral-700 mb-4">
            Tu pedido ha sido recibido con éxito. Número de pedido: <span className="font-semibold">{orderId}</span>
          </p>
          <p className="text-neutral-600 mb-6">
            En breve nos pondremos en contacto contigo por WhatsApp para coordinar los detalles del envío y el pago.
          </p>
          <Button onClick={() => router.push("/")}>Volver al Inicio</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal del formulario */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-neutral-900">Finalizar Compra</CardTitle>
              
              {/* Indicador de progreso */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  {[1, 2, 3, 4].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= stepNumber 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {stepNumber}
                      </div>
                      {stepNumber < 4 && (
                        <div className={`w-12 h-1 mx-2 ${
                          step > stepNumber ? 'bg-blue-600' : 'bg-neutral-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>Modalidad</span>
                  <span>Datos</span>
                  <span>Horario</span>
                  <span>Pago</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Paso 1: Elegir modalidad de compra */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Paso 1: Elegir modalidad de compra</h2>
                  
                  {errors.step1 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700">{errors.step1}</p>
                    </div>
                  )}
                  
                  <RadioGroup
                    value={purchaseOption}
                    onValueChange={(value: "guest" | "logged") => {
                      setPurchaseOption(value)
                      clearErrors()
                    }}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-neutral-50">
                      <RadioGroupItem value="guest" id="guest" />
                      <Label htmlFor="guest" className="font-medium">Comprar como invitado</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-neutral-50">
                      <RadioGroupItem value="logged" id="logged" disabled={!!user} />
                      <Label htmlFor="logged" className="font-medium">
                        {user
                          ? `Iniciar sesión (ya logueado como ${userData?.nombre || user.email})`
                          : "Iniciar sesión para autocompletar los datos"}
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {user && purchaseOption === "logged" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">✅ Usuario logueado</h4>
                      <p className="text-sm text-green-700 mb-2">
                        Tus datos se han cargado automáticamente desde tu perfil.
                      </p>
                      {userAddresses.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-green-700">
                          <MapPin className="w-4 h-4" />
                          <span>{userAddresses.length} dirección{userAddresses.length !== 1 ? 'es' : ''} guardada{userAddresses.length !== 1 ? 's' : ''} disponible{userAddresses.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!user && purchaseOption === "logged" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700 mb-3">
                        Para continuar con esta opción, necesitas iniciar sesión.
                      </p>
                      <Button onClick={() => router.push("/login")} className="w-full">
                        Ir a Iniciar Sesión
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleNextStep} 
                      disabled={purchaseOption === "logged" && !user}
                      className="min-w-[120px]"
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
                                        {address.calle} {address.numero}
                                      </div>
                                      <div className="text-sm text-neutral-500">
                                        {address.ciudad}, {address.provincia}
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
                                  <div className="text-green-700">{formData.address}</div>
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
                              value={formData.address}
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
                            value={formData.address}
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

                  <RadioGroup
                    value={deliveryOption}
                    onValueChange={(value: "delivery" | "pickup") => setDeliveryOption(value)}
                    className="flex flex-col space-y-2 mt-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery">Envío a domicilio</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup">Retiro por el local</Label>
                    </div>
                  </RadioGroup>

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
                  <h2 className="text-xl font-semibold mb-4">Paso 3: Elegir día y horario de entrega</h2>
                  
                  {deliveryOption === "delivery" ? (
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
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        Has seleccionado retiro por el local. Te contactaremos para coordinar el horario.
                      </p>
                    </div>
                  )}

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

                  <h3 className="text-lg font-semibold mb-2">Métodos de Pago Disponibles:</h3>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-neutral-50">
                      <RadioGroupItem value="mercadopago" id="mercadopago" />
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <Label htmlFor="mercadopago" className="font-medium">MercadoPago</Label>
                      </div>
                      <div className="ml-auto text-sm text-neutral-600">
                        Tarjeta, transferencia, efectivo
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-neutral-50">
                      <RadioGroupItem value="efectivo-local" id="efectivo-local" />
                      <div className="flex items-center space-x-2">
                        <Wallet className="w-5 h-5 text-green-600" />
                        <Label htmlFor="efectivo-local" className="font-medium">Efectivo en el local</Label>
                      </div>
                      <div className="ml-auto text-sm text-neutral-600">
                        Al retirar
                      </div>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "mercadopago" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-blue-800 mb-2">💳 Pago seguro con MercadoPago</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Pagá con tarjeta de crédito o débito</li>
                        <li>• Transferencia bancaria</li>
                        <li>• Dinero en cuenta de MercadoPago</li>
                        <li>• Pago en efectivo en puntos de pago</li>
                        <li>• Transacción 100% segura</li>
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handlePrevStep}>
                      Anterior
                    </Button>
                    <Button 
                      onClick={handleSubmitOrder} 
                      disabled={isSubmitting || isCreatingPayment}
                      className={paymentMethod === "mercadopago" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {isCreatingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Conectando con MercadoPago...
                        </>
                      ) : isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Finalizando...
                        </>
                      ) : (
                        <>
                          {paymentMethod === "mercadopago" ? (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Pagar con MercadoPago
                            </>
                          ) : (
                            "Finalizar compra"
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
          <Card className="p-6 sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-neutral-900">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                      <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">{item.name}</p>
                      <p className="text-sm text-neutral-500">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="font-semibold text-neutral-900">{formatPrice(item.quantity * item.price)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="flex justify-between items-center text-lg font-bold text-neutral-900">
                <span>Total del Pedido:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
