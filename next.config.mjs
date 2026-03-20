/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias['@'] = process.cwd();
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'firebasestorage.googleapis.com',
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
    {
      protocol: 'https',
      hostname: 'assets.elgourmet.com',
    },
    {
      protocol: 'https',
      hostname: 'www.unileverfoodsolutions.com.mx',
    },
    {
      protocol: 'https',
      hostname: 'unileverfoodsolutions.com.mx',
    },
  ],

  formats: ['image/avif', 'image/webp'],

  deviceSizes: [640,750,828,1080,1200,1920,2048],

  imageSizes: [16,32,48,64,96,128,256,384],

  minimumCacheTTL: 31536000
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
