// Script para popular dados de teste de segurança
// Execute com: npx ts-node scripts/seed-security-data.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populando dados de segurança de teste...\n');

  // Pegar o primeiro usuário
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log('❌ Nenhum usuário encontrado! Crie um usuário primeiro.');
    return;
  }

  console.log(`✓ Usuário encontrado: ${user.nome} (${user.email})`);

  // 1. Criar sessões de teste
  console.log('\n📱 Criando sessões de teste...');

  const sessionsData = [
    {
      userId: user.id,
      token: `session_${Date.now()}_1`,
      device: 'Windows PC',
      browser: 'Chrome 120',
      os: 'Windows 11',
      ip: '192.168.1.100',
      location: 'São Paulo, Brasil',
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    },
    {
      userId: user.id,
      token: `session_${Date.now()}_2`,
      device: 'iPhone 14 Pro',
      browser: 'Safari',
      os: 'iOS 17',
      ip: '192.168.1.101',
      location: 'São Paulo, Brasil',
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      token: `session_${Date.now()}_3`,
      device: 'MacBook Pro',
      browser: 'Firefox 121',
      os: 'macOS Sonoma',
      ip: '192.168.1.102',
      location: 'Rio de Janeiro, Brasil',
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const sessionData of sessionsData) {
    await prisma.session.create({ data: sessionData });
  }

  console.log(`✓ ${sessionsData.length} sessões criadas`);

  // 2. Criar histórico de login
  console.log('\n📊 Criando histórico de login...');

  const loginHistoryData = [
    {
      userId: user.id,
      device: 'Windows PC',
      browser: 'Chrome 120',
      os: 'Windows 11',
      ip: '192.168.1.100',
      location: 'São Paulo, Brasil',
      success: true,
      createdAt: new Date(),
    },
    {
      userId: user.id,
      device: 'iPhone 14 Pro',
      browser: 'Safari',
      os: 'iOS 17',
      ip: '192.168.1.101',
      location: 'São Paulo, Brasil',
      success: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      device: 'Unknown Device',
      browser: 'Chrome',
      os: 'Windows',
      ip: '203.0.113.45',
      location: 'Location Unknown',
      success: false,
      failureReason: 'Senha incorreta',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      device: 'MacBook Pro',
      browser: 'Firefox 121',
      os: 'macOS Sonoma',
      ip: '192.168.1.102',
      location: 'Rio de Janeiro, Brasil',
      success: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      device: 'Android Phone',
      browser: 'Chrome Mobile',
      os: 'Android 14',
      ip: '192.168.1.103',
      location: 'Belo Horizonte, Brasil',
      success: true,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      device: 'Unknown Device',
      browser: 'Unknown',
      os: 'Unknown',
      ip: '198.51.100.23',
      location: 'Location Unknown',
      success: false,
      failureReason: 'Tentativa de força bruta detectada',
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    },
  ];

  for (const loginData of loginHistoryData) {
    await prisma.loginHistory.create({ data: loginData });
  }

  console.log(`✓ ${loginHistoryData.length} entradas de histórico criadas`);

  // 3. Criar logs de atividade
  console.log('\n📝 Criando logs de atividade...');

  const activityLogsData = [
    {
      userId: user.id,
      action: 'login',
      description: 'Login realizado com sucesso',
      ip: '192.168.1.100',
      device: 'Windows PC',
      createdAt: new Date(),
    },
    {
      userId: user.id,
      action: 'profile_updated',
      description: 'Perfil atualizado: nome e telefone alterados',
      ip: '192.168.1.100',
      device: 'Windows PC',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      action: '2fa_enabled',
      description: 'Autenticação em duas etapas ativada',
      ip: '192.168.1.100',
      device: 'Windows PC',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      action: 'password_changed',
      description: 'Senha alterada com sucesso',
      ip: '192.168.1.100',
      device: 'Windows PC',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  ];

  for (const activityData of activityLogsData) {
    await prisma.activityLog.create({ data: activityData });
  }

  console.log(`✓ ${activityLogsData.length} logs de atividade criados`);

  // 4. Atualizar data da última alteração de senha
  console.log('\n🔐 Atualizando data da última alteração de senha...');
  await prisma.user.update({
    where: { id: user.id },
    data: { lastPasswordChange: new Date(Date.now() - 48 * 60 * 60 * 1000) },
  });
  console.log('✓ Data atualizada');

  console.log('\n✅ Dados de segurança populados com sucesso!\n');
  console.log('Agora você pode:');
  console.log('1. Acessar /perfil e ir na aba Segurança');
  console.log('2. Ver sessões ativas, histórico de login e logs de atividades');
  console.log('3. Testar as funcionalidades de email de recuperação e perguntas de segurança\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
