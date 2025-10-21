-- ============================================================================
-- ESTRUTURA COMPLETA DA TABELA: subscriptions
-- ============================================================================
-- Esta é a estrutura completa da tabela subscriptions após a migração
-- Use este script apenas se precisar recriar a tabela do zero
-- ============================================================================

-- Remover tabela existente (CUIDADO: isso apaga todos os dados!)
-- DROP TABLE IF EXISTS "subscriptions" CASCADE;

-- Criar tabela subscriptions
CREATE TABLE IF NOT EXISTS "subscriptions" (
    -- Identificadores
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "abacatepay_id" TEXT UNIQUE,

    -- Status e tipo de pagamento
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentType" TEXT,

    -- Ciclo e valores
    "cycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "amount" DECIMAL(10,2) NOT NULL,

    -- Datas de renovação e controle
    "nextDueDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    -- Configurações
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "paymentMethodId" TEXT,

    -- Timestamps
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    -- Foreign Keys
    CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "subscriptions_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Criar índices
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_abacatepay_id_key" ON "subscriptions"("abacatepay_id");
CREATE INDEX IF NOT EXISTS "subscriptions_userId_idx" ON "subscriptions"("userId");
CREATE INDEX IF NOT EXISTS "subscriptions_planId_idx" ON "subscriptions"("planId");
CREATE INDEX IF NOT EXISTS "subscriptions_status_idx" ON "subscriptions"("status");
CREATE INDEX IF NOT EXISTS "subscriptions_nextDueDate_idx" ON "subscriptions"("nextDueDate");

-- ============================================================================
-- COMENTÁRIOS DOS CAMPOS
-- ============================================================================

COMMENT ON TABLE "subscriptions" IS 'Assinaturas dos usuários para os planos';

COMMENT ON COLUMN "subscriptions"."id" IS 'ID único da assinatura (UUID)';
COMMENT ON COLUMN "subscriptions"."userId" IS 'ID do usuário dono da assinatura';
COMMENT ON COLUMN "subscriptions"."planId" IS 'ID do plano assinado';
COMMENT ON COLUMN "subscriptions"."abacatepay_id" IS 'ID da assinatura/billing no AbacatePay';

COMMENT ON COLUMN "subscriptions"."status" IS 'Status da assinatura: pending, active, cancelled, suspended';
COMMENT ON COLUMN "subscriptions"."paymentType" IS 'Tipo de pagamento: PIX, CREDIT_CARD';

COMMENT ON COLUMN "subscriptions"."cycle" IS 'Ciclo de cobrança: MONTHLY (mensal), YEARLY (anual)';
COMMENT ON COLUMN "subscriptions"."amount" IS 'Valor da assinatura em reais (já com desconto se anual)';

COMMENT ON COLUMN "subscriptions"."nextDueDate" IS 'Próxima data de cobrança/renovação (calculada automaticamente)';
COMMENT ON COLUMN "subscriptions"."startDate" IS 'Data de início da assinatura';
COMMENT ON COLUMN "subscriptions"."endDate" IS 'Data de término da assinatura (se aplicável)';
COMMENT ON COLUMN "subscriptions"."cancelledAt" IS 'Data de cancelamento da assinatura';

COMMENT ON COLUMN "subscriptions"."autoRenew" IS 'Renovação automática habilitada (true/false)';
COMMENT ON COLUMN "subscriptions"."paymentMethodId" IS 'ID do método de pagamento padrão (cartão salvo)';

COMMENT ON COLUMN "subscriptions"."createdAt" IS 'Data de criação do registro';
COMMENT ON COLUMN "subscriptions"."updatedAt" IS 'Data da última atualização';

-- ============================================================================
-- EXEMPLO DE INSERT
-- ============================================================================

-- Exemplo de como inserir uma assinatura:
/*
INSERT INTO "subscriptions" (
    "id",
    "userId",
    "planId",
    "abacatepay_id",
    "status",
    "paymentType",
    "cycle",
    "amount",
    "nextDueDate",
    "startDate",
    "autoRenew",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::TEXT,                                    -- id
    'user-uuid-aqui',                                           -- userId
    'plan-uuid-aqui',                                           -- planId
    'abacatepay-billing-id-aqui',                              -- abacatepay_id
    'pending',                                                  -- status
    'PIX',                                                      -- paymentType
    'MONTHLY',                                                  -- cycle
    99.90,                                                      -- amount
    CURRENT_TIMESTAMP + INTERVAL '1 month',                    -- nextDueDate (mensal)
    CURRENT_TIMESTAMP,                                          -- startDate
    true,                                                       -- autoRenew
    CURRENT_TIMESTAMP,                                          -- createdAt
    CURRENT_TIMESTAMP                                           -- updatedAt
);
*/

-- Para assinatura ANUAL, use:
-- nextDueDate: CURRENT_TIMESTAMP + INTERVAL '1 year'

-- ============================================================================
-- QUERIES ÚTEIS
-- ============================================================================

-- Ver todas as assinaturas com data de renovação:
/*
SELECT
    s.id,
    u.nome AS usuario,
    p.name AS plano,
    s.cycle AS ciclo,
    s.amount AS valor,
    s.status,
    s.startDate AS inicio,
    s.nextDueDate AS proxima_renovacao,
    s.createdAt AS criado_em
FROM subscriptions s
JOIN users u ON s."userId" = u.id
JOIN plans p ON s."planId" = p.id
ORDER BY s.nextDueDate ASC;
*/

-- Ver assinaturas que vencem nos próximos 7 dias:
/*
SELECT
    s.id,
    u.email,
    p.name,
    s.nextDueDate,
    s.amount
FROM subscriptions s
JOIN users u ON s."userId" = u.id
JOIN plans p ON s."planId" = p.id
WHERE s.status = 'active'
  AND s.nextDueDate BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '7 days'
ORDER BY s.nextDueDate ASC;
*/

-- Ver receita mensal/anual:
/*
SELECT
    s.cycle,
    COUNT(*) AS total_assinaturas,
    SUM(s.amount) AS receita_total,
    AVG(s.amount) AS ticket_medio
FROM subscriptions s
WHERE s.status = 'active'
GROUP BY s.cycle;
*/
