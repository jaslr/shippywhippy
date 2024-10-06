import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare global {
    var __db: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
} else {
    if (!global.__db) {
        global.__db = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        })
    }
    prisma = global.__db
}

export { prisma }