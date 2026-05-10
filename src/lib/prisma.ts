import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const connectionString = "postgresql://neondb_owner:npg_cqvk1VTCZ5UP@ep-super-rain-aq97rtjt-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

  const connectionPool = new Pool({ connectionString })
  const adapter = new PrismaNeon(connectionPool)

  const prisma = new PrismaClient({
    adapter,
    log: ['query'],
  })

  return prisma
}

export const prisma = globalForPrisma.prisma || getPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma