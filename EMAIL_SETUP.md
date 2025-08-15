# 📧 Configuración de Envío de Emails

## 🎯 **Brevo (Recomendado para Frontend)**

### **1. Crear cuenta en Brevo**
- Ve a [https://www.brevo.com/](https://www.brevo.com/)
- Regístrate gratis (300 emails/día)
- Verifica tu email

### **2. Obtener API Key**
- Ve a [https://app.brevo.com/settings/keys/api](https://app.brevo.com/settings/keys/api)
- Crea una nueva API key
- Copia la key generada

### **3. Configurar variables de entorno**
Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Configuración de Brevo para envío de emails
NEXT_PUBLIC_BREVO_API_KEY=tu_api_key_aqui

# Ejemplo:
NEXT_PUBLIC_BREVO_API_KEY=xkeysib-1234567890abcdef...
```

### **4. Verificar configuración**
- Reinicia el servidor de desarrollo
- Ve a `/admin/newsletter`
- Deberías ver "✅ Servicio de email configurado"

## 🚀 **Cómo usar:**

### **Crear Campaña:**
1. Ve a `/admin/newsletter`
2. Haz clic en "Nueva Campaña"
3. Llena el formulario
4. Haz clic en "Crear Campaña"

### **Enviar Campaña:**
1. En la tabla de campañas, busca tu campaña
2. Haz clic en "Enviar" (solo para campañas en borrador)
3. Confirma el envío
4. Espera a que se complete

## ⚠️ **Consideraciones de Seguridad:**

### **Problema:**
- La API key se expone en el frontend
- Cualquiera puede ver tu clave en el código fuente

### **Soluciones Recomendadas:**

#### **Opción 1: Backend API Route (Recomendado)**
```typescript
// app/api/send-email/route.ts
export async function POST(request: Request) {
  const { campaign, suscriptores } = await request.json()
  
  // API key solo en el servidor
  const apiKey = process.env.BREVO_API_KEY
  
  // Enviar emails desde el servidor
  // ...
}
```

#### **Opción 2: Variables de entorno del servidor**
```bash
# Solo en el servidor, no en el cliente
BREVO_API_KEY=tu_key_aqui
```

#### **Opción 3: Usar solo para desarrollo**
- Solo usar esta implementación para testing
- En producción, implementar backend

## 📊 **Funcionalidades Implementadas:**

✅ **Crear campañas** con título, asunto, contenido HTML  
✅ **Enviar campañas** a todos los suscriptores activos  
✅ **Templates HTML** personalizables  
✅ **Envío en lotes** para evitar rate limits  
✅ **Tracking básico** (enviados, fallidos)  
✅ **Interfaz de admin** completa  

## 🔧 **Personalización:**

### **Template de Email:**
Edita `lib/email-service.ts` en la función `buildEmailTemplate()`:

```typescript
private buildEmailTemplate(campaign: any, subscriberEmail: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${campaign.asunto}</title>
      <style>
        /* Tus estilos CSS aquí */
      </style>
    </head>
    <body>
      <!-- Tu HTML personalizado aquí -->
      ${campaign.contenido}
    </body>
    </html>
  `
}
```

### **Configuración del Remitente:**
```typescript
private senderEmail = 'tu-email@tudominio.com'
private senderName = 'Tu Nombre de Empresa'
```

## 🚨 **Limitaciones:**

- **Rate limits**: Máximo 100 emails/minuto con Brevo
- **Seguridad**: API key expuesta en frontend
- **Tracking**: Solo envíos básicos (no opens, clicks)
- **Plantillas**: HTML básico (no editor visual)

## 🔮 **Próximos Pasos Recomendados:**

1. **Implementar backend API** para proteger la API key
2. **Agregar tracking** de aperturas y clicks
3. **Editor visual** de plantillas
4. **Programación automática** de envíos
5. **Segmentación** de audiencias
6. **A/B testing** de campañas

## 📞 **Soporte:**

- **Brevo**: [https://help.brevo.com/](https://help.brevo.com/)
- **Documentación API**: [https://developers.brevo.com/](https://developers.brevo.com/)
- **Límites**: [https://www.brevo.com/pricing/](https://www.brevo.com/pricing/)

