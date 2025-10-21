-- Add WhatsApp 2FA support columns
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "twoFactorMethod" TEXT,
  ADD COLUMN IF NOT EXISTS "whatsappOtpHash" TEXT,
  ADD COLUMN IF NOT EXISTS "whatsappOtpExpiresAt" TIMESTAMP;

