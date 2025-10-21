// One-off helper to add 2FA columns without resetting DB
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const sql = `
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT,
        ADD COLUMN IF NOT EXISTS "twoFactorConfirmedAt" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "twoFactorMethod" TEXT,
        ADD COLUMN IF NOT EXISTS "whatsappOtpHash" TEXT,
        ADD COLUMN IF NOT EXISTS "whatsappOtpExpiresAt" TIMESTAMP;
    `;
    await prisma.$executeRawUnsafe(sql);
    console.log('2FA columns ensured.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
