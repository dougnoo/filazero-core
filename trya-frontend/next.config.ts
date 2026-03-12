import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    // Ignorar erros de TypeScript durante o build de produção
    ignoreBuildErrors: true,
  },
  // Configuração de imagens para permitir domínios externos (CDN e S3)
  images: {
    remotePatterns: [
      // Domínios CDN customizados (preferível)
      {
        protocol: 'https',
        hostname: 'assets-dev.trya.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets-hml.trya.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.trya.ai',
        pathname: '/**',
      },
      // CloudFront distributions
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        pathname: '/**',
      },
      // S3 direto (fallback/legacy)
      {
        protocol: 'https',
        hostname: 'trya-assets-dev.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'trya-assets-hml.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'trya-assets-prod.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'trya-platform-files.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  // Otimizações para reduzir consumo de memória no build
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
      'node_modules/@swc/core-darwin-x64',
      'node_modules/@swc/core-darwin-arm64',
    ],
  },
  // Headers para evitar cache em rotas autenticadas
  async headers() {
    return [
      {
        source: '/((?!_next/static|_next/image|favicon.ico|static).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
