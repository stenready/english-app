import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '#generated/prisma/client'
import { env } from '#config/env'

// One client for the whole app: it holds the connection pool.
// omit: no query returns the password hash unless it asks for it explicitly
// (e.g. login: findUnique({ where, omit: { passwordHash: false } }))
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.databaseUrl }),
  omit: { user: { passwordHash: true } },
})
