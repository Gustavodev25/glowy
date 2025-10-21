import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugAgendamentos() {
  console.log('🔍 Debug de Agendamentos\n');

  try {
    // Buscar todos os agendamentos
    const agendamentos = await prisma.agendamento.findMany({
      include: {
        empresa: {
          select: {
            id: true,
            nomeEmpresa: true,
            donoId: true,
            dono: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        },
        cliente: {
          select: {
            nome: true,
            email: true
          }
        },
        servico: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`📋 Total de agendamentos encontrados: ${agendamentos.length}\n`);

    agendamentos.forEach((ag, index) => {
      console.log(`\n--- Agendamento ${index + 1} ---`);
      console.log(`ID: ${ag.id}`);
      console.log(`Empresa ID: ${ag.empresaId}`);
      console.log(`Empresa Nome: ${ag.empresa.nomeEmpresa}`);
      console.log(`Dono ID: ${ag.empresa.donoId}`);
      console.log(`Dono Nome: ${ag.empresa.dono.nome}`);
      console.log(`Dono Email: ${ag.empresa.dono.email}`);
      console.log(`Cliente: ${ag.cliente.nome} (${ag.cliente.email})`);
      console.log(`Serviço: ${ag.servico.nome}`);
      console.log(`Data/Hora: ${ag.dataHora.toLocaleString('pt-BR')}`);
      console.log(`Status: ${ag.status}`);
      console.log(`Criado em: ${ag.createdAt.toLocaleString('pt-BR')}`);
    });

    // Verificar empresas sem dono vinculado
    console.log('\n\n🏢 Verificando todas as empresas...\n');
    
    const empresas = await prisma.empresa.findMany({
      include: {
        dono: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        _count: {
          select: {
            agendamentos: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`Total de empresas: ${empresas.length}\n`);

    empresas.forEach((emp, index) => {
      console.log(`\n--- Empresa ${index + 1} ---`);
      console.log(`ID: ${emp.id}`);
      console.log(`Nome: ${emp.nomeEmpresa}`);
      console.log(`Dono: ${emp.dono.nome} (${emp.dono.email})`);
      console.log(`Agendamentos: ${emp._count.agendamentos}`);
      console.log(`Ativo: ${emp.ativo}`);
      console.log(`Criado em: ${emp.createdAt.toLocaleString('pt-BR')}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAgendamentos();
