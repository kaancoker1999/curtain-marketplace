import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // DATABASE_URL yoksa (örn. Vercel demo modu) prisma generate yine çalışsın
    url: process.env.DATABASE_URL ?? 'postgresql://demo:demo@localhost:5432/curtainos',
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
})
