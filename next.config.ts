import type { NextConfig } from "next";
// @ts-expect-error - Plugin sem tipos oficiais
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
  
  // Configurações de cache otimizadas
  experimental: {
    staleTimes: {
      dynamic: 30,  // 30 segundos para páginas dinâmicas
      static: 300,  // 5 minutos para páginas estáticas
    },
  },
};

export default nextConfig;
