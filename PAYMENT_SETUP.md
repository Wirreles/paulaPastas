# Configuración de Pagos con MercadoPago Integrado

## Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# MercadoPago Configuration
NEXT_PUBLIC_MP_ACCESS_TOKEN=your_mercadopago_access_token_here

# URLs for MercadoPago callbacks
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Configuración de MercadoPago

### 1. Obtener Access Token

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Inicia sesión con tu cuenta
3. Ve a "Tus integraciones" > "Credenciales"
4. Copia el "Access Token" (usar el de prueba para desarrollo)

### 2. Configurar Webhooks

1. En el panel de MercadoPago, ve a "Configuración" > "Notificaciones"
2. Agrega la URL del webhook: `https://tu-dominio.com/api/webhooks/mercadopago`
3. Selecciona los eventos: `payment` y `payment.updated`

## Estructura de Datos

### Compra Pendiente (pending_purchases)

```typescript
{
  buyerId: string | null,
  buyerEmail: string,
  buyerName: string,
  buyerPhone: string,
  buyerAddress: string,
  products: Array<{
    productId: string,
    quantity: number,
    name: string,
    price: number,
    stock: number | null,
    imageUrl?: string
  }>,
  totalAmount: number,
  status: 'pending',
  createdAt: Date,
  preferenceId: string,
  deliveryOption: 'delivery' | 'pickup',
  deliverySlot?: string,
  comments?: string,
  isUserLoggedIn: boolean,
  selectedAddressId?: string | null,
  selectedAddressData?: any
}
```

### Compra Completada (purchases)

```typescript
{
  buyerId: string | null,
  buyerEmail: string,
  buyerName: string,
  buyerPhone: string,
  buyerAddress: string,
  products: Array<{
    productId: string,
    quantity: number,
    name: string,
    price: number,
    stock: number | null,
    imageUrl?: string
  }>,
  paymentId: string,
  status: string,
  totalAmount: number,
  paidToSellers: boolean,
  createdAt: Date,
  deliveryOption: 'delivery' | 'pickup',
  deliverySlot?: string,
  comments?: string,
  isUserLoggedIn: boolean,
  selectedAddressId?: string | null,
  selectedAddressData?: any
}
```

## Flujo de Pago

### 1. Usuario Logueado

1. Usuario selecciona productos y va al checkout
2. Se cargan automáticamente sus datos y direcciones guardadas
3. Usuario selecciona dirección de entrega (si tiene guardadas)
4. Se crea preferencia de pago con MercadoPago
5. Se guarda compra pendiente en Firestore
6. Usuario es redirigido a MercadoPago para completar el pago
7. MercadoPago envía webhook con el resultado del pago
8. Se procesa el webhook y se actualiza el estado de la compra

### 2. Usuario Invitado

1. Usuario selecciona productos y va al checkout
2. Usuario completa formulario con sus datos
3. Se crea preferencia de pago con MercadoPago
4. Se guarda compra pendiente en Firestore
5. Usuario es redirigido a MercadoPago para completar el pago
6. MercadoPago envía webhook con el resultado del pago
7. Se procesa el webhook y se actualiza el estado de la compra

## Archivos Modificados

### Nuevos Archivos

- `lib/mercadopago-service.ts` - Servicio integrado de MercadoPago
- `app/api/mercadopago/create-preference/route.ts` - API para crear preferencias
- `app/api/webhooks/mercadopago/route.ts` - Webhook para procesar pagos

### Archivos Actualizados

- `lib/firebase-service.ts` - Agregados métodos para manejar compras
- `app/checkout/page.tsx` - Integrado con nuevo servicio de MercadoPago
- `package.json` - Agregada dependencia de MercadoPago
- `app/checkout/success/page.tsx` - Página de éxito con Suspense
- `app/checkout/failure/page.tsx` - Página de fallo con Suspense
- `app/checkout/pending/page.tsx` - Página de pendiente con Suspense

## Métodos del FirebaseService

### Nuevos Métodos

```typescript
// Obtener producto por ID
static async getProductById(productId: string): Promise<any>

// Actualizar stock de producto
static async updateProductStock(productId: string, newStock: number): Promise<void>

// Agregar compra pendiente
static async addPendingPurchase(purchaseId: string, purchaseData: any): Promise<void>

// Obtener compra pendiente
static async getPendingPurchase(purchaseId: string): Promise<any>

// Eliminar compra pendiente
static async deletePendingPurchase(purchaseId: string): Promise<void>

// Agregar compra completada
static async addCompletedPurchase(purchaseData: any): Promise<string>

// Agregar compra fallida
static async addFailedPurchase(purchaseData: any): Promise<string>
```

## Testing

### 1. Desarrollo Local

1. Usa el token de prueba de MercadoPago
2. Las preferencias se crean en modo sandbox
3. Los webhooks se procesan localmente

### 2. Producción

1. Usa el token de producción de MercadoPago
2. Configura las URLs correctas en las variables de entorno
3. Asegúrate de que el webhook esté configurado correctamente

## Notas Importantes

1. **Stock**: El stock se valida al crear la preferencia y se actualiza cuando se procesa el webhook
2. **Direcciones**: Los usuarios logueados pueden seleccionar de sus direcciones guardadas
3. **Datos**: Se mantiene consistencia entre usuarios logueados e invitados
4. **Webhooks**: Se procesan automáticamente y actualizan el estado de las compras
5. **Errores**: Se manejan errores de stock insuficiente y se registran compras fallidas

## Troubleshooting

### Error: "Configuración de entorno incompleta"

- Verifica que `NEXT_PUBLIC_MP_ACCESS_TOKEN` esté configurado
- Asegúrate de que el token sea válido

### Error: "Producto no encontrado"

- Verifica que el `productId` exista en la colección `productos`
- Asegúrate de que el producto esté disponible

### Error: "Stock insuficiente"

- Verifica el stock disponible del producto
- Considera implementar reserva de stock temporal

### Webhook no se procesa

- Verifica que la URL del webhook esté configurada correctamente
- Revisa los logs del servidor para errores
- Asegúrate de que el endpoint esté accesible públicamente

## ✅ Implementación Completada

### ✅ Pasos Realizados

1. **✅ Instalación de dependencias**
   - Agregada dependencia `mercadopago@^2.2.0` al package.json
   - Instalada con `--legacy-peer-deps` para compatibilidad

2. **✅ Servicio de MercadoPago integrado**
   - Creado `lib/mercadopago-service.ts` con configuración completa
   - Implementado método `createProductPreference` para crear preferencias
   - Implementado método `handleWebhook` para procesar notificaciones
   - Validación de productos y stock integrada

3. **✅ Métodos de FirebaseService**
   - Agregados métodos para manejar compras pendientes, completadas y fallidas
   - Implementada validación de stock y actualización automática
   - Métodos para obtener productos por ID y actualizar stock

4. **✅ API Routes actualizadas**
   - `app/api/mercadopago/create-preference/route.ts` - Endpoint para crear preferencias
   - `app/api/webhooks/mercadopago/route.ts` - Webhook para procesar pagos
   - Manejo de errores y validaciones implementadas

5. **✅ Checkout integrado**
   - Actualizado `app/checkout/page.tsx` para usar el nuevo servicio
   - Manejo de usuarios logueados e invitados
   - Selección de direcciones guardadas para usuarios logueados
   - Validaciones paso a paso implementadas

6. **✅ Páginas de resultado**
   - `app/checkout/success/page.tsx` - Página de pago exitoso
   - `app/checkout/failure/page.tsx` - Página de pago fallido
   - `app/checkout/pending/page.tsx` - Página de pago pendiente
   - Todas las páginas envueltas en Suspense para evitar errores de SSR

7. **✅ Correcciones de errores**
   - Corregidos errores de TypeScript en el checkout
   - Arreglados errores de Suspense en las páginas de resultado
   - Build exitoso sin errores

### ✅ Funcionalidades Implementadas

- ✅ Creación de preferencias de pago con MercadoPago
- ✅ Validación de productos y stock
- ✅ Manejo de usuarios logueados e invitados
- ✅ Selección de direcciones guardadas
- ✅ Procesamiento de webhooks
- ✅ Actualización automática de stock
- ✅ Registro de compras pendientes, completadas y fallidas
- ✅ Páginas de resultado con información detallada
- ✅ Manejo de errores y validaciones
- ✅ Integración completa con Firebase

### 🎯 Próximos Pasos

1. **Configurar variables de entorno**
   - Crear archivo `.env.local` con `NEXT_PUBLIC_MP_ACCESS_TOKEN`
   - Configurar URLs de producción

2. **Probar el flujo completo**
   - Probar con usuario logueado
   - Probar con usuario invitado
   - Verificar webhooks

3. **Configurar webhook en producción**
   - Configurar URL del webhook en MercadoPago
   - Verificar que el endpoint sea accesible públicamente

4. **Monitoreo y logs**
   - Revisar logs de consola para debugging
   - Monitorear compras pendientes y completadas en Firebase

¡El sistema de pagos con MercadoPago está completamente integrado y listo para usar! 🎉 