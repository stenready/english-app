import 'dotenv/config'
import { z } from 'zod'

const DEFAULT_PORT = 3000

// "true" / "false" from .env: z.coerce.boolean() would turn "false" into true
const booleanFromString = z.enum(['true', 'false']).transform((value) => {
  return value === 'true'
})

// Checked once at startup: a missing or invalid variable stops the app with a clear message
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),
  PUBLIC_URL: z.url().optional(),
  CORS_ORIGIN: z.string().min(1).default('*'),
  DATABASE_URL: z.string().min(1),

  S3_ENDPOINT: z.url(),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_FORCE_PATH_STYLE: booleanFromString.default(false),
  S3_PUBLIC_URL: z.url(),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`)
}

const variables = result.data

export const env = {
  corsOrigin: variables.CORS_ORIGIN,
  databaseUrl: variables.DATABASE_URL,
  host: variables.HOST,
  nodeEnv: variables.NODE_ENV,
  port: variables.PORT,
  publicUrl: variables.PUBLIC_URL,
  s3: {
    endpoint: variables.S3_ENDPOINT,
    region: variables.S3_REGION,
    bucket: variables.S3_BUCKET,
    accessKey: variables.S3_ACCESS_KEY,
    secretKey: variables.S3_SECRET_KEY,
    forcePathStyle: variables.S3_FORCE_PATH_STYLE,
    publicUrl: variables.S3_PUBLIC_URL,
  },
}

export const isProduction = env.nodeEnv === 'production'
