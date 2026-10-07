import 'dotenv/config'

const DEFAULT_PORT = 3000
const DEFAULT_NODE_ENV = 'development'
const DEFAULT_CORS_ORIGIN = '*'
const DEFAULT_HOST = '0.0.0.0'

const host = process.env.HOST ?? DEFAULT_HOST
const port = Number(process.env.PORT ?? DEFAULT_PORT)
const publicUrl = process.env.PUBLIC_URL
const databaseUrl = process.env.DATABASE_URL

if (!host) {
  throw new Error('HOST must not be empty.')
}

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('PORT must be a positive integer.')
}

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set.')
}

if (publicUrl) {
  try {
    new URL(publicUrl)
  } catch {
    throw new Error('PUBLIC_URL must be a valid URL.')
  }
}

interface Env {
  corsOrigin: string
  databaseUrl: string
  host: string
  nodeEnv: string
  port: number
  publicUrl: string | undefined
}

export const env: Env = {
  corsOrigin: process.env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN,
  databaseUrl,
  host,
  nodeEnv: process.env.NODE_ENV ?? DEFAULT_NODE_ENV,
  port,
  publicUrl,
}

export const isProduction = env.nodeEnv === 'production'
