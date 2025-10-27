-- Migration: Adicionar campo profissional_id à tabela agendamentos
-- Execute este script no banco de dados PostgreSQL

-- Adicionar coluna profissional_id
ALTER TABLE agendamentos
ADD COLUMN IF NOT EXISTS profissional_id TEXT;

-- Criar foreign key constraint
ALTER TABLE agendamentos
ADD CONSTRAINT agendamentos_profissional_id_fkey
FOREIGN KEY (profissional_id)
REFERENCES users(id)
ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional_id
ON agendamentos(profissional_id);
