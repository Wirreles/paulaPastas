// Servicio de email usando Brevo (antes Sendinblue)
// IMPORTANTE: En producción, considera usar un backend para proteger la API key

interface EmailData {
  to: string[]
  subject: string
  htmlContent: string
  senderName?: string
  senderEmail?: string
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}

class EmailService {
  private apiKey: string
  private baseUrl = 'https://api.brevo.com/v3/smtp/email'
  private senderEmail = 'newsletter@paulapastas.com' // Tu dominio real autentificado en Brevo
  private senderName = 'Paula Pastas'

  constructor() {
    // IMPORTANTE: En producción, esta key debería estar en variables de entorno
    // o mejor aún, usar un backend para protegerla
    this.apiKey = process.env.NEXT_PUBLIC_BREVO_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('⚠️ Brevo API Key no configurada. Configura NEXT_PUBLIC_BREVO_API_KEY en .env.local')
    }
  }

  /**
   * Envía un email usando la API de Brevo
   */
  async sendEmail(emailData: EmailData): Promise<EmailResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API Key no configurada'
      }
    }

    try {
      const payload = {
        sender: {
          name: emailData.senderName || this.senderName,
          email: emailData.senderEmail || this.senderEmail
        },
        to: emailData.to.map(email => ({ email })),
        subject: emailData.subject,
        htmlContent: emailData.htmlContent
      }

      console.log('📧 Enviando email:', {
        to: emailData.to,
        subject: emailData.subject,
        sender: payload.sender,
        apiKey: this.apiKey ? '✅ Configurada' : '❌ No configurada',
        apiKeyLength: this.apiKey.length,
        apiKeyStart: this.apiKey.substring(0, 10) + '...'
      })

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify(payload)
      })

      console.log('📡 Respuesta de Brevo:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error de Brevo:', errorData)
        throw new Error(errorData.message || `Error ${response.status}`)
      }

      const result = await response.json()
      
      console.log('✅ Email enviado exitosamente:', {
        messageId: result.messageId,
        response: result,
        timestamp: new Date().toISOString()
      })

      // Verificar el estado del email después de un delay
      setTimeout(async () => {
        await this.checkEmailStatus(result.messageId)
      }, 5000)

      return {
        success: true,
        messageId: result.messageId
      }

    } catch (error: any) {
      console.error('❌ Error enviando email:', error)
      
      return {
        success: false,
        error: error.message || 'Error desconocido enviando email'
      }
    }
  }

  /**
   * Verifica el estado de un email enviado
   */
  private async checkEmailStatus(messageId: string) {
    try {
      console.log('🔍 Verificando estado del email:', messageId)
      
      // Nota: Brevo no tiene endpoint público para verificar estado
      // Pero podemos hacer algunas verificaciones básicas
      console.log('📊 Para verificar el estado del email:')
      console.log('1. Ve a https://app.brevo.com/email-campaigns')
      console.log('2. Busca el email con ID:', messageId)
      console.log('3. Verifica si aparece como "Enviado" o "Entregado"')
      
    } catch (error) {
      console.error('❌ Error verificando estado:', error)
    }
  }

  /**
   * Envía una campaña de newsletter a múltiples suscriptores
   */
  async sendNewsletterCampaign(
    campaign: any,
    suscriptores: string[]
  ): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    if (!suscriptores.length) {
      return { success: false, sent: 0, failed: 0, errors: ['No hay suscriptores'] }
    }

    console.log(`📬 Enviando campaña "${campaign.titulo}" a ${suscriptores.length} suscriptores`)

    let sent = 0
    let failed = 0
    const errors: string[] = []

    // Enviar emails en lotes para evitar rate limits
    const batchSize = 10 // Brevo permite hasta 100 por minuto
    const batches = this.chunkArray(suscriptores, batchSize)

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      console.log(`📦 Procesando lote ${i + 1}/${batches.length} (${batch.length} emails)`)

      // Enviar emails en paralelo dentro del lote
      const promises = batch.map(async (email) => {
        try {
          const result = await this.sendEmail({
            to: [email],
            subject: campaign.asunto,
            htmlContent: this.buildEmailTemplate(campaign, email)
          })

          if (result.success) {
            sent++
            return { success: true, email }
          } else {
            failed++
            errors.push(`${email}: ${result.error}`)
            return { success: false, email, error: result.error }
          }
        } catch (error: any) {
          failed++
          const errorMsg = `${email}: ${error.message}`
          errors.push(errorMsg)
          return { success: false, email, error: error.message }
        }
      })

      // Esperar que se complete el lote actual
      await Promise.all(promises)

      // Pausa entre lotes para evitar rate limits
      if (i < batches.length - 1) {
        console.log('⏳ Pausando 2 segundos entre lotes...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    const success = failed === 0
    console.log(`📊 Resultado de la campaña: ${sent} enviados, ${failed} fallidos`)

    return { success, sent, failed, errors }
  }

  /**
   * Construye el template HTML del email
   */
  private buildEmailTemplate(campaign: any, subscriberEmail: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${campaign.asunto}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background: #8B4513; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0; 
          }
          .content { 
            background: #f9f9f9; 
            padding: 20px; 
            border-radius: 0 0 8px 8px; 
          }
          .footer { 
            text-align: center; 
            margin-top: 20px; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
          }
          .unsubscribe { 
            color: #8B4513; 
            text-decoration: none; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🍝 Paula Pastas</h1>
          <p>Las mejores pastas artesanales de Rosario</p>
        </div>
        
        <div class="content">
          ${campaign.contenido}
        </div>
        
        <div class="footer">
          <p>Este email fue enviado a ${subscriberEmail}</p>
          <p>
            <a href="#" class="unsubscribe">Darse de baja</a> | 
            <a href="https://paulapastas.com" class="unsubscribe">Visitar sitio web</a>
          </p>
          <p>© 2024 Paula Pastas. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Envía un email de bienvenida con cupón automático
   */
  async sendWelcomeEmail(email: string, cuponCodigo: string): Promise<EmailResponse> {
    console.log('🎉 Enviando email de bienvenida con cupón a:', email)
    
    const welcomeEmailData: EmailData = {
      to: [email],
      subject: '🎉 ¡Bienvenido a Paula Pastas! Tu cupón de descuento está listo',
      htmlContent: this.buildWelcomeEmailTemplate(email, cuponCodigo)
    }

    return this.sendEmail(welcomeEmailData)
  }

  /**
   * Construye el template HTML del email de bienvenida
   */
  private buildWelcomeEmailTemplate(email: string, cuponCodigo: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Bienvenido a Paula Pastas!</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px; 
            background: white;
          }
          .welcome-message {
            text-align: center;
            margin-bottom: 30px;
          }
          .welcome-message h2 {
            color: #8B4513;
            font-size: 24px;
            margin-bottom: 15px;
          }
          .coupon-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 2px dashed #8B4513;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            margin: 25px 0;
          }
          .coupon-code {
            background: #8B4513;
            color: white;
            font-size: 24px;
            font-weight: bold;
            padding: 15px 25px;
            border-radius: 8px;
            display: inline-block;
            margin: 15px 0;
            letter-spacing: 2px;
            font-family: 'Courier New', monospace;
          }
          .coupon-details {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
          }
          .cta-button {
            display: inline-block;
            background: #28a745;
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
          }
          .cta-button:hover {
            background: #218838;
            transform: translateY(-2px);
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
          }
          .unsubscribe { 
            color: #8B4513; 
            text-decoration: none; 
          }
          .highlight {
            color: #8B4513;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍝 Paula Pastas</h1>
            <p>Las mejores pastas artesanales de Rosario</p>
          </div>
          
          <div class="content">
            <div class="welcome-message">
              <h2>🎉 ¡Bienvenido a Paula Pastas!</h2>
              <p>¡Hola! Nos alegra que te hayas suscrito a nuestro newsletter.</p>
              <p>Como agradecimiento, te hemos preparado un <span class="highlight">regalo especial</span> para tu primera compra.</p>
            </div>
            
            <div class="coupon-section">
              <h3 style="color: #8B4513; margin-bottom: 20px;">🎁 Tu Cupón de Bienvenida</h3>
              <div class="coupon-code">${cuponCodigo}</div>
              <p style="margin: 0; font-size: 14px; color: #666;">
                Copia este código y úsalo en tu próxima compra
              </p>
            </div>
            
            <div class="coupon-details">
              <h4 style="color: #28a745; margin-top: 0;">✨ Beneficios de tu cupón:</h4>
              <ul style="text-align: left; padding-left: 20px;">
                <li><strong>10% de descuento</strong> en tu primera compra</li>
                <li><strong>Sin monto mínimo</strong> de compra</li>
                <li><strong>Válido por 30 días</strong> desde hoy</li>
                <li><strong>Uso único</strong> - ¡Aprovéchalo!</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://paulapastas.com/pastas" class="cta-button">
                🛒 Ver Nuestras Pastas
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>💡 Tip:</strong> Nuestras pastas más populares son los ravioles de ossobuco, 
                sorrentinos de cordero y la lasagna tradicional. ¡Perfectas para usar con tu cupón!
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>Este email fue enviado a ${email}</p>
            <p>
              <a href="#" class="unsubscribe">Darse de baja</a> | 
              <a href="https://paulapastas.com" class="unsubscribe">Visitar sitio web</a>
            </p>
            <p>© 2024 Paula Pastas. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Divide un array en lotes más pequeños
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * Envía un email de prueba para verificar la configuración
   */
  async sendTestEmail(toEmail: string): Promise<EmailResponse> {
    console.log('🧪 Enviando email de prueba a:', toEmail)
    
    // Probar con diferentes dominios de remitente
    const testDomains = [
      'newsletter@paulapastas.com',         // Tu dominio principal autentificado
      'info@paulapastas.com',               // Alternativa
      'noreply@paulapastas.com',            // Otra alternativa
      'newsletter@paula-pastas.vercel.app', // Fallback a Vercel
      'joelrchirino@gmail.com'              // Fallback final
    ]
    
    for (const testDomain of testDomains) {
      console.log(`🔍 Probando dominio: ${testDomain}`)
      
      try {
        const testEmailData: EmailData = {
          to: [toEmail],
          subject: `🧪 Test - ${testDomain}`,
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Email de Prueba</title>
            </head>
            <body>
              <h1>🍝 Email de Prueba</h1>
              <p>Este es un email de prueba para verificar que el sistema funciona correctamente.</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
              <p><strong>Remitente:</strong> ${this.senderName} (${testDomain})</p>
              <p><strong>Destinatario:</strong> ${toEmail}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <hr>
              <p style="font-size: 12px; color: #666;">
                Si recibes este email, el sistema está funcionando correctamente.
              </p>
            </body>
            </html>
          `,
          senderEmail: testDomain
        }

        const result = await this.sendEmail(testEmailData)
        
        if (result.success) {
          console.log(`✅ Email enviado exitosamente con dominio: ${testDomain}`)
          return result
        } else {
          console.log(`❌ Falló con dominio: ${testDomain} - ${result.error}`)
        }
      } catch (error) {
        console.log(`❌ Error con dominio: ${testDomain} - ${error}`)
      }
    }
    
    // Si todos fallan, usar el dominio por defecto
    console.log('⚠️ Todos los dominios fallaron, usando dominio por defecto')
    const testEmailData: EmailData = {
      to: [toEmail],
      subject: '🧪 Email de Prueba - Paula Pastas',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email de Prueba</title>
        </head>
        <body>
          <h1>🍝 Email de Prueba</h1>
          <p>Este es un email de prueba para verificar que el sistema funciona correctamente.</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
          <p><strong>Remitente:</strong> ${this.senderName} (${this.senderEmail})</p>
          <p><strong>Destinatario:</strong> ${toEmail}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            Si recibes este email, el sistema está funcionando correctamente.
          </p>
        </body>
        </html>
      `
    }

    return this.sendEmail(testEmailData)
  }

  /**
   * Envía un email de prueba simple (solo texto)
   */
  async sendSimpleTestEmail(toEmail: string): Promise<EmailResponse> {
    console.log('🧪 Enviando email de prueba SIMPLE a:', toEmail)
    
    const testEmailData: EmailData = {
      to: [toEmail],
      subject: 'Test Simple - Paula Pastas',
      htmlContent: `
        <p>Este es un email de prueba simple.</p>
        <p>Fecha: ${new Date().toLocaleString('es-AR')}</p>
        <p>Si lo recibes, el sistema funciona.</p>
      `
    }

    return this.sendEmail(testEmailData)
  }

  /**
   * Verifica la configuración del servicio
   */
  async testConfiguration(): Promise<{
    apiKeyConfigured: boolean
    apiKeyLength: number
    senderEmail: string
    senderName: string
    baseUrl: string
    timestamp: string
    domainStatus: string
  }> {
    let domainStatus = 'No verificado'
    
    // Intentar verificar el estado del dominio
    try {
      const testResponse = await fetch('https://api.brevo.com/v3/senders', {
        headers: {
          'api-key': this.apiKey
        }
      })
      
      if (testResponse.ok) {
        const senders = await testResponse.json()
        console.log('📧 Remitentes disponibles en Brevo:', senders)
        
        if (senders.senders && senders.senders.length > 0) {
          const verifiedSenders = senders.senders.filter((s: any) => s.status === 'verified')
          domainStatus = `${verifiedSenders.length} dominios verificados`
        } else {
          domainStatus = 'No hay dominios verificados'
        }
      } else {
        domainStatus = 'Error verificando dominios'
      }
    } catch (error) {
      domainStatus = 'Error de conexión'
    }
    
    return {
      apiKeyConfigured: !!this.apiKey,
      apiKeyLength: this.apiKey.length,
      senderEmail: this.senderEmail,
      senderName: this.senderName,
      baseUrl: this.baseUrl,
      timestamp: new Date().toISOString(),
      domainStatus
    }
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }
}

// Exportar una instancia singleton
export const emailService = new EmailService()

// También exportar la clase para testing
export { EmailService }
export type { EmailData, EmailResponse }
