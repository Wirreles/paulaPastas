/** @type {import('next').NextConfig} */
const nextConfig = {
  // Eliminamos el alias de Webpack (se gestiona vía tsconfig.json)
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.elgourmet.com' },
      { protocol: 'https', hostname: 'www.unileverfoodsolutions.com.mx' },
      { protocol: 'https', hostname: 'unileverfoodsolutions.com.mx' },
    ],
    // AVIF es excelente para performance, pero tarda más en generar la primera vez
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Reducimos el TTL a un valor más manejable (1 día) para evitar imágenes "zombies"
    minimumCacheTTL: 86400 
  },

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'paulapastas.com'],
    },
  },

  output: 'standalone',
  compress: true, // Asegura la compresión de assets

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Habilitamos HSTS para mejorar la seguridad y el score de SEO
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }
        ],
      },
    ]
  },
}

export default nextConfig