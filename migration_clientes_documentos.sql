-- ============================================
-- MIGRATION: Sistema de Clientes, Documentos e Formulários
-- Data: 2025-10-19
-- ============================================

-- 1. Adicionar campo avatarUrl na tabela clientes
ALTER TABLE "clientes" 
ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;

-- 2. Criar tabela de formulários personalizados
CREATE TABLE IF NOT EXISTS "formularios_personalizados" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "campos" JSONB NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "fk_formularios_empresa" 
        FOREIGN KEY ("empresa_id") 
        REFERENCES "empresas"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- 3. Criar tabela de respostas de formulários
CREATE TABLE IF NOT EXISTS "respostas_formulario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formulario_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "agendamento_id" TEXT,
    "respostas" JSONB NOT NULL,
    "preenchido_por" TEXT NOT NULL,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "fk_respostas_formulario" 
        FOREIGN KEY ("formulario_id") 
        REFERENCES "formularios_personalizados"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT "fk_respostas_cliente" 
        FOREIGN KEY ("cliente_id") 
        REFERENCES "clientes"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT "fk_respostas_agendamento" 
        FOREIGN KEY ("agendamento_id") 
        REFERENCES "agendamentos"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    CONSTRAINT "fk_respostas_preenchido_por" 
        FOREIGN KEY ("preenchido_por") 
        REFERENCES "users"("id") 
        ON UPDATE CASCADE
);

-- 4. Criar tabela de documentos
CREATE TABLE IF NOT EXISTS "documentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "cliente_id" TEXT,
    "agendamento_id" TEXT,
    "tipo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "url" TEXT NOT NULL,
    "public_id" TEXT,
    "tamanho" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "fk_documentos_empresa" 
        FOREIGN KEY ("empresa_id") 
        REFERENCES "empresas"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT "fk_documentos_cliente" 
        FOREIGN KEY ("cliente_id") 
        REFERENCES "clientes"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT "fk_documentos_agendamento" 
        FOREIGN KEY ("agendamento_id") 
        REFERENCES "agendamentos"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    CONSTRAINT "fk_documentos_uploaded_by" 
        FOREIGN KEY ("uploaded_by") 
        REFERENCES "users"("id") 
        ON UPDATE CASCADE
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS "idx_formularios_empresa" ON "formularios_personalizados"("empresa_id");
CREATE INDEX IF NOT EXISTS "idx_respostas_formulario" ON "respostas_formulario"("formulario_id");
CREATE INDEX IF NOT EXISTS "idx_respostas_cliente" ON "respostas_formulario"("cliente_id");
CREATE INDEX IF NOT EXISTS "idx_respostas_agendamento" ON "respostas_formulario"("agendamento_id");
CREATE INDEX IF NOT EXISTS "idx_documentos_empresa" ON "documentos"("empresa_id");
CREATE INDEX IF NOT EXISTS "idx_documentos_cliente" ON "documentos"("cliente_id");
CREATE INDEX IF NOT EXISTS "idx_documentos_agendamento" ON "documentos"("agendamento_id");
CREATE INDEX IF NOT EXISTS "idx_documentos_tipo" ON "documentos"("tipo");

-- 6. Atualizar _prisma_migrations (registrar migration)
-- Substitua XXXXXXXX_migration_name pela data/hora atual
-- INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
-- VALUES (gen_random_uuid(), 'checksum_placeholder', NOW(), '20251019_add_clientes_documentos_anamnese', NULL, NULL, NOW(), 1);

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se as colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('formularios_personalizados', 'respostas_formulario', 'documentos')
ORDER BY table_name;

-- Verificar índices criados
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('formularios_personalizados', 'respostas_formulario', 'documentos')
ORDER BY tablename, indexname;
