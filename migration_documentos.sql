-- Migration para criar tabela documentos
-- Execute este SQL diretamente no banco de dados

-- Criar tabela documentos
CREATE TABLE IF NOT EXISTS documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL,
    cliente_id UUID,
    agendamento_id UUID,
    tipo VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    url TEXT NOT NULL,
    public_id VARCHAR(255),
    tamanho INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign Keys
    CONSTRAINT fk_documentos_empresa FOREIGN KEY (empresa_id)
        REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT fk_documentos_cliente FOREIGN KEY (cliente_id)
        REFERENCES clientes(id) ON DELETE CASCADE,
    CONSTRAINT fk_documentos_agendamento FOREIGN KEY (agendamento_id)
        REFERENCES agendamentos(id) ON DELETE SET NULL,
    CONSTRAINT fk_documentos_uploaded_by FOREIGN KEY (uploaded_by)
        REFERENCES users(id) ON DELETE RESTRICT
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_documentos_empresa_id ON documentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_documentos_cliente_id ON documentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_agendamento_id ON documentos(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_documentos_uploaded_by ON documentos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documentos_created_at ON documentos(created_at DESC);

-- Comentários nas colunas
COMMENT ON TABLE documentos IS 'Armazena documentos e anexos de clientes';
COMMENT ON COLUMN documentos.tipo IS 'Tipo do documento: foto, exame, receita, contrato, laudo, documento';
COMMENT ON COLUMN documentos.url IS 'URL do arquivo (pode ser base64 ou URL do Cloudinary)';
COMMENT ON COLUMN documentos.public_id IS 'ID público do Cloudinary (quando aplicável)';
COMMENT ON COLUMN documentos.tamanho IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN documentos.mime_type IS 'Tipo MIME do arquivo (ex: image/jpeg, application/pdf)';
