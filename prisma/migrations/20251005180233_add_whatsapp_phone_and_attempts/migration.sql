-- AlterTable
ALTER TABLE "users" ADD COLUMN     "whatsappOtpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "whatsappPhoneE164" TEXT,
ALTER COLUMN "whatsappOtpExpiresAt" SET DATA TYPE TIMESTAMP(3);
