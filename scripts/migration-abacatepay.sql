-- ============================================================================
-- MIGRAÇÃO DO ASAAS PARA ABACATEPAY
-- ============================================================================
-- Este script renomeia todas as referências do Asaas para AbacatePay
-- e adiciona os campos necessários para a lógica de renovação
-- ============================================================================

-- ============================================================================
-- 1. TABELA: users
-- ============================================================================
-- Renomear coluna asaasCustomerId para abacatepay_customer_id
ALTER TABLE "users"
  RENAME COLUMN "asaasCustomerId" TO "abacatepay_customer_id";

-- ============================================================================
-- 2. TABELA: subscriptions
-- ============================================================================
-- Renomear coluna asaasId para abacatepay_id
ALTER TABLE "subscriptions"
  RENAME COLUMN "asaasId" TO "abacatepay_id";

-- Remover o índice antigo se existir
DROP INDEX IF EXISTS "subscriptions_asaasId_key";

-- Criar novo índice único para abacatepay_id
CREATE UNIQUE INDEX "subscriptions_abacatepay_id_key" ON "subscriptions"("abacatepay_id");

-- Adicionar startDate se não existir (data de início da assinatura)
ALTER TABLE "subscriptions"
  ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);

-- Atualizar startDate para assinaturas existentes (usar createdAt como fallback)
UPDATE "subscriptions"
  SET "startDate" = "createdAt"
  WHERE "startDate" IS NULL;

-- Atualizar nextDueDate para assinaturas pendentes/ativas existentes
UPDATE "subscriptions"
  SET "nextDueDate" = CASE
    WHEN "cycle" = 'YEARLY' THEN "createdAt" + INTERVAL '1 year'
    WHEN "cycle" = 'MONTHLY' THEN "createdAt" + INTERVAL '1 month'
    ELSE "createdAt" + INTERVAL '1 month'
  END
  WHERE "nextDueDate" IS NULL
    AND "status" IN ('pending', 'active');

-- ============================================================================
-- 3. TABELA: payments
-- ============================================================================
-- Renomear coluna asaasId para abacatepay_id
ALTER TABLE "payments"
  RENAME COLUMN "asaasId" TO "abacatepay_id";

-- Remover o índice antigo se existir
DROP INDEX IF EXISTS "payments_asaasId_key";

-- Criar novo índice único para abacatepay_id
CREATE UNIQUE INDEX "payments_abacatepay_id_key" ON "payments"("abacatepay_id");

-- Alterar tipo de coluna pixQrCode para TEXT (suportar base64 grande)
ALTER TABLE "payments"
  ALTER COLUMN "pixQrCode" TYPE TEXT;

-- Alterar tipo de coluna pixCopyPaste para TEXT (suportar código PIX longo)
ALTER TABLE "payments"
  ALTER COLUMN "pixCopyPaste" TYPE TEXT;

-- ============================================================================
-- 4. TABELA: payment_methods
-- ============================================================================
-- Renomear coluna asaasCardToken para abacatepay_card_token
ALTER TABLE "payment_methods"
  RENAME COLUMN "asaasCardToken" TO "abacatepay_card_token";

-- ============================================================================
-- 5. VERIFICAÇÕES PÓS-MIGRAÇÃO
-- ============================================================================
-- Execute estas queries para verificar se tudo funcionou:

-- Verificar estrutura da tabela users
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'users' AND column_name LIKE '%abacate%';

-- Verificar estrutura da tabela subscriptions
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'subscriptions' AND column_name IN ('abacatepay_id', 'nextDueDate', 'startDate', 'cycle');

-- Verificar estrutura da tabela payments
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'payments' AND column_name IN ('abacatepay_id', 'pixQrCode', 'pixCopyPaste');

-- Verificar estrutura da tabela payment_methods
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'payment_methods' AND column_name LIKE '%abacate%';

-- Verificar assinaturas com nextDueDate preenchido
-- SELECT id, cycle, "createdAt", "startDate", "nextDueDate", status
-- FROM subscriptions
-- ORDER BY "createdAt" DESC
-- LIMIT 10;

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================
