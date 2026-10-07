import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const databaseUrl = process.env.DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  // `prisma generate` (npm install, Docker build) runs without a database, so the URL is optional here;
  // migrate commands without it fail with Prisma's own error
  ...(databaseUrl && { datasource: { url: databaseUrl } }),
})
