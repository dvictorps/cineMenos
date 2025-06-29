import { PrismaClient } from '../generated/prisma'
import { getDatabaseUrl } from './database-config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : [],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    // Otimizações para Vercel/Serverless
    transactionOptions: {
      timeout: 10000, // 10 segundos max
      maxWait: 5000,  // 5 segundos max de espera
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown para serverless
process.on('beforeExit', async () => {
  await prisma.$disconnect()
}) 