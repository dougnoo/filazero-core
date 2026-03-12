# Exemplo de next.config.js para Next.js Frontend
# Salve este arquivo como: frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for S3/CloudFront
  output: 'export',
  
  // Configure image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || 'dev',
  },
  
  // Configure trailing slashes
  trailingSlash: true,
  
  // Asset prefix for CloudFront
  // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.trya.com.br' : '',
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
