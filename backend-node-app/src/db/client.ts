import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '#generated/prisma/client'
import { env } from '#config/env'

// One client for the whole app: it holds the connection pool
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.databaseUrl }),
})
