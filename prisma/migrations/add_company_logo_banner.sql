-- Adicionar campos de logo e banner na tabela company_settings
ALTER TABLE company_settings 
ADD COLUMN logo_url TEXT,
ADD COLUMN logo_public_id TEXT,
ADD COLUMN banner_url TEXT,
ADD COLUMN banner_public_id TEXT;

