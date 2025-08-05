// Configuración del backend
export const config = {
  // URL del backend (cambiar por la URL real cuando esté lista)
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "https://tu-backend.com",
  
  // Endpoints del backend
  endpoints: {
    createPayment: "/api/payments/create-preference",
    webhook: "/api/webhooks/mercadopago",
  },
  
  // URLs completas
  get createPaymentUrl() {
    return `${this.backendUrl}${this.endpoints.createPayment}`
  },
  
  get webhookUrl() {
    return `${this.backendUrl}${this.endpoints.webhook}`
  },
} 