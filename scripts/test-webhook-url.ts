
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('--- Verificación de Configuración de Webhook ---');
console.log('Environment:', process.env.NODE_ENV);

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
console.log('NEXT_PUBLIC_BASE_URL:', baseUrl);

const notificationUrl = `${baseUrl}/api/webhooks/mercadopago`;
console.log('URL de Notificación calculada:', notificationUrl);

if (baseUrl.includes('localhost')) {
  console.warn('⚠️ ADVERTENCIA: La URL base apunta a localhost. Los webhooks de MercadoPago NO funcionarán a menos que uses un túnel como ngrok.');
} else {
  console.log('✅ La URL base parece pública.');
}

if (!process.env.MP_ACCESS_TOKEN && !process.env.NEXT_PUBLIC_MP_ACCESS_TOKEN) {
    console.error('❌ ERROR: No se encontró token de acceso (MP_ACCESS_TOKEN o NEXT_PUBLIC_MP_ACCESS_TOKEN)');
} else {
    console.log('✅ Token de acceso encontrado.');
}
