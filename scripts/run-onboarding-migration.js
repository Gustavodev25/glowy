const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migração de onboarding...');
    
    const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', 'add_company_settings.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Migração concluída com sucesso!');
    console.log('📋 Tabelas criadas:');
    console.log('   - company_settings');
    console.log('   - services');
    console.log('   - business_hours');
    console.log('   - Campo onboarding_completed adicionado em users');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao executar migração:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
