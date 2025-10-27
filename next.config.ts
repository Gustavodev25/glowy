import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações de imagens
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Next.js 16: Turbopack é o padrão, não precisa de flags experimentais

  // Garantir que variáveis de ambiente estejam disponíveis
  env: {
    ASAAS_API_KEY: process.env.ASAAS_API_KEY,
    ASAAS_WEBHOOK_TOKEN: process.env.ASAAS_WEBHOOK_TOKEN,
    ASAAS_ENV: process.env.ASAAS_ENV,
  },

  // Melhorar performance com React Strict Mode
  reactStrictMode: true,

  // Headers personalizados (removido Content-Type que estava causando problemas)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },

  // Configuração Turbopack (Next.js 16)
  turbopack: {
    // Configuração vazia para usar Turbopack com as configurações padrão
    // e silenciar o warning sobre webpack config
  },

  // Configuração webpack para fallback (se optar por usar --webpack)
  webpack: (config, { isServer }) => {
    // Fix para módulos Node.js no client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        process: false,
      };
    }
    return config;
  },
};

export default nextConfig;
