import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
try {
  const count = await prisma.user.count()
  console.log('OK COUNT', count)
  process.exit(0)
} catch (e) {
  console.error('ERR', e)
  process.exit(2)
} finally {
  await prisma.$disconnect()
}
