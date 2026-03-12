import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    // Ignorar erros de TypeScript durante o build de produção
    ignoreBuildErrors: true,
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
