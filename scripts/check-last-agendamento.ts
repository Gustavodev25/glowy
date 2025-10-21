import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLastAgendamento() {
  console.log('🔍 Verificando último agendamento...\n');

  try {
    // Buscar último agendamento
    const ultimoAgendamento = await prisma.agendamento.findFirst({
      orderBy: {
        createdAt: 'desc'
      },
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
      }
    });

    if (!ultimoAgendamento) {
      console.log('❌ Nenhum agendamento encontrado');
      return;
    }

    console.log('✅ Último Agendamento:');
    console.log('─────────────────────────────────────');
    console.log(`ID: ${ultimoAgendamento.id}`);
    console.log(`Status: ${ultimoAgendamento.status}`);
    console.log(`Data/Hora: ${ultimoAgendamento.dataHora.toLocaleString('pt-BR')}`);
    console.log(`Cliente: ${ultimoAgendamento.cliente.nome}`);
    console.log(`Serviço: ${ultimoAgendamento.servico.nome}`);
    console.log(`Criado em: ${ultimoAgendamento.createdAt.toLocaleString('pt-BR')}`);
    console.log('');
    
    console.log('🏢 Empresa do Agendamento:');
    console.log('─────────────────────────────────────');
    console.log(`Empresa ID: ${ultimoAgendamento.empresaId}`);
    console.log(`Empresa Nome: ${ultimoAgendamento.empresa.nomeEmpresa}`);
    console.log(`Dono ID: ${ultimoAgendamento.empresa.donoId}`);
    console.log(`Dono Nome: ${ultimoAgendamento.empresa.dono.nome}`);
    console.log(`Dono Email: ${ultimoAgendamento.empresa.dono.email}`);
    console.log('');

    // Verificar quantas empresas o dono tem
    const empresasDoDono = await prisma.empresa.findMany({
      where: {
        donoId: ultimoAgendamento.empresa.donoId,
        ativo: true
      },
      select: {
        id: true,
        nomeEmpresa: true,
        ativo: true
      }
    });

    console.log('🏢 Todas as empresas do dono:');
    console.log('─────────────────────────────────────');
    empresasDoDono.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.nomeEmpresa} (ID: ${emp.id}) - Ativo: ${emp.ativo}`);
    });
    console.log('');

    // Verificar se o empresaId do agendamento está na lista
    const empresaEncontrada = empresasDoDono.find(e => e.id === ultimoAgendamento.empresaId);
    if (empresaEncontrada) {
      console.log('✅ A empresa do agendamento está na lista de empresas do dono!');
    } else {
      console.log('❌ PROBLEMA: A empresa do agendamento NÃO está na lista de empresas do dono!');
      console.log(`   Empresa ID do agendamento: ${ultimoAgendamento.empresaId}`);
      console.log(`   IDs das empresas do dono: ${empresasDoDono.map(e => e.id).join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLastAgendamento();
