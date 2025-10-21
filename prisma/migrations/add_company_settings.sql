-- Adiciona flag de onboarding completado na tabela de usuários
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Cria tabela de configurações da empresa
CREATE TABLE IF NOT EXISTS company_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    business_type TEXT NOT NULL, -- 'manicure', 'clinic', 'dentist', 'barbershop', 'salon', 'spa', 'other'
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cria tabela de serviços prestados
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_id TEXT NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- duração em minutos
    price DECIMAL(10, 2),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cria tabela de horários de funcionamento
CREATE TABLE IF NOT EXISTS business_hours (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_id TEXT NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    is_open BOOLEAN DEFAULT TRUE,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, day_of_week)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_services_company_id ON services(company_id);
CREATE INDEX IF NOT EXISTS idx_business_hours_company_id ON business_hours(company_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_user_id ON company_settings(user_id);
