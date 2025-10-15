/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Solo optimizar imágenes de dominios específicos, NO Firebase Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.elgourmet.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.unileverfoodsolutions.com.mx',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unileverfoodsolutions.com.mx',
        port: '',
        pathname: '/**',
      },
      // Agregar otros dominios que SÍ quieras optimizar
    ],
    // Configuración de optimización para mejor rendimiento
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // NO incluir firebasestorage.googleapis.com para evitar optimización innecesaria
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Configuración adicional para Vercel
  output: 'standalone',
  
  // Redirecciones para SEO - TEMPORALMENTE DESHABILITADO PARA EVITAR BUCLES
  // async redirects() {
  //   return [
  //     {
  //       source: '/:path*',
  //       has: [
  //         {
  //           type: 'host',
  //           value: 'www.paulapastas.com',
  //         },
  //       ],
  //       destination: 'https://paulapastas.com/:path*',
  //       permanent: true,
  //     },
  //   ]
  // },
  
  // Configuración adicional para evitar bucles de redirección
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

export default nextConfig
