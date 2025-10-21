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

  // Configurações de encoding
  experimental: {
    // Removido serverExternalPackages que estava causando warnings
    // serverExternalPackages: ["@prisma/client", "argon2"],
  },

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

  // Configuração webpack simplificada
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
