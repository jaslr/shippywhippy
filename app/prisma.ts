import { PrismaClient } from '@prisma/client'

const databaseUrl = typeof window === 'undefined' 
  ? process.env.DATABASE_URL 
  : import.meta.env.VITE_DATABASE_URL

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
})

export { prisma }
