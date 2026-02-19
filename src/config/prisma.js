import { PrismaClient } from '@prisma/client'

// For Prisma 7 with local MySQL, just use basic PrismaClient
// The database URL is configured in prisma.config.ts for migrations
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

// Test connection
prisma.$connect()
  .then(() => {
    console.log('✓ MySQL database connected successfully')
  })
  .catch((err) => {
    console.error('✗ Prisma connection error:', err)
    process.exit(1)
  })

export default prisma