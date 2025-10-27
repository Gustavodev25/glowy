// Script para adicionar campo profissional_id à tabela agendamentos
const { Pool } = require('pg');
require('dotenv').config();

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Conectando ao banco de dados...');

    // Adicionar coluna profissional_id
    await pool.query(`
      ALTER TABLE agendamentos
      ADD COLUMN IF NOT EXISTS profissional_id TEXT;
    `);
    console.log('✅ Coluna profissional_id adicionada');

    // Adicionar foreign key constraint
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'agendamentos_profissional_id_fkey'
        ) THEN
          ALTER TABLE agendamentos
          ADD CONSTRAINT agendamentos_profissional_id_fkey
          FOREIGN KEY (profissional_id)
          REFERENCES users(id)
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    console.log('✅ Foreign key constraint adicionada');

    // Criar índice
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional_id
      ON agendamentos(profissional_id);
    `);
    console.log('✅ Índice criado');

    console.log('\n✅ Migration concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
