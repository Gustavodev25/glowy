import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar planos
  const plans = [
    {
      name: 'Grátis',
      description: 'Plano gratuito para experimentar',
      price: 0,
      interval: 'MONTHLY',
      features: [
        '1 empresa cadastrada',
        'Até 5 agendamentos por mês',
        'Recursos básicos',
        'Suporte por email',
      ],
      maxEmpresas: 1,
      maxUsers: 1,
      active: true,
    },
    {
      name: 'Básico',
      description: 'Ideal para pequenos negócios',
      price: 29.90,
      interval: 'MONTHLY',
      features: [
        'Até 2 empresas cadastradas',
        'Até 50 agendamentos por mês',
        'Suporte por email',
        'Painel básico de controle',
        'Relatórios simples',
      ],
      maxEmpresas: 2,
      maxUsers: 2,
      active: true,
    },
    {
      name: 'Profissional',
      description: 'Para negócios em crescimento',
      price: 59.90,
      interval: 'MONTHLY',
      features: [
        'Até 5 empresas cadastradas',
        'Agendamentos ilimitados',
        'Suporte prioritário',
        'Relatórios avançados',
        'Lembretes por WhatsApp',
        'Personalização de marca',
      ],
      maxEmpresas: 5,
      maxUsers: 10,
      active: true,
    },
    {
      name: 'Empresarial',
      description: 'Para grandes empresas',
      price: 99.90,
      interval: 'MONTHLY',
      features: [
        'Empresas ilimitadas',
        'Tudo do plano Profissional',
        'API de integração',
        'Suporte 24/7',
        'Gerente de conta dedicado',
        'Customização completa',
      ],
      maxEmpresas: 999,
      maxUsers: 999,
      active: true,
    },
  ];

  for (const plan of plans) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: plan.name },
    });

    if (!existingPlan) {
      await prisma.plan.create({
        data: plan,
      });
      console.log(`✅ Plano "${plan.name}" criado`);
    } else {
      console.log(`⏭️  Plano "${plan.name}" já existe`);
    }
  }

  console.log('✨ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
