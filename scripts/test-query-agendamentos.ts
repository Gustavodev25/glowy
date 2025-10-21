import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testQueryAgendamentos() {
  console.log('🔍 Testando query de agendamentos...\n');

  try {
    const donoId = '7a727aad-eeb1-4aee-b17c-9eeb1965ead6'; // Seu ID
    const empresaId = 'c7d87e5a-19f6-4819-ad06-4186cc95ebda'; // ID da empresa

    console.log('📝 Dados do teste:');
    console.log(`Dono ID: ${donoId}`);
    console.log(`Empresa ID: ${empresaId}\n`);

    // Teste 1: Buscar empresas do dono
    console.log('--- TESTE 1: Buscar empresas do dono ---');
    const empresasDoDono = await prisma.empresa.findMany({
      where: {
        donoId: donoId,
        ativo: true
      },
      select: {
        id: true,
        nomeEmpresa: true,
        ativo: true
      }
    });
    console.log(`✅ Encontradas ${empresasDoDono.length} empresas:`);
    empresasDoDono.forEach(e => console.log(`   - ${e.nomeEmpresa} (${e.id})`));
    console.log('');

    // Teste 2: Buscar TODOS os agendamentos da empresa (sem filtro de status)
    console.log('--- TESTE 2: Buscar TODOS os agendamentos da empresa ---');
    const todosAgendamentos = await prisma.agendamento.findMany({
      where: {
        empresaId: empresaId
      },
      select: {
        id: true,
        status: true,
        dataHora: true,
        cliente: {
          select: {
            nome: true
          }
        },
        servico: {
          select: {
            nome: true
          }
        }
      }
    });
    console.log(`✅ Encontrados ${todosAgendamentos.length} agendamentos (todos os status):`);
    todosAgendamentos.forEach(a => {
      console.log(`   - ${a.cliente.nome} | ${a.servico.nome} | Status: ${a.status} | ${new Date(a.dataHora).toLocaleString('pt-BR')}`);
    });
    console.log('');

    // Teste 3: Buscar agendamentos com status "agendado"
    console.log('--- TESTE 3: Buscar agendamentos com status "agendado" ---');
    const agendamentosAgendados = await prisma.agendamento.findMany({
      where: {
        empresaId: empresaId,
        status: 'agendado'
      },
      select: {
        id: true,
        status: true,
        dataHora: true,
        cliente: {
          select: {
            nome: true
          }
        }
      }
    });
    console.log(`✅ Encontrados ${agendamentosAgendados.length} agendamentos com status "agendado":`);
    agendamentosAgendados.forEach(a => {
      console.log(`   - ${a.cliente.nome} | Status: ${a.status} | ${new Date(a.dataHora).toLocaleString('pt-BR')}`);
    });
    console.log('');

    // Teste 4: Buscar agendamentos com IN (como a API faz)
    console.log('--- TESTE 4: Buscar com empresaId IN [] (como a API faz) ---');
    const empresaIds = empresasDoDono.map(e => e.id);
    const agendamentosIN = await prisma.agendamento.findMany({
      where: {
        empresaId: {
          in: empresaIds
        },
        status: 'agendado'
      },
      select: {
        id: true,
        empresaId: true,
        status: true,
        cliente: {
          select: {
            nome: true
          }
        }
      }
    });
    console.log(`✅ Encontrados ${agendamentosIN.length} agendamentos usando IN [${empresaIds.join(', ')}]:`);
    agendamentosIN.forEach(a => {
      console.log(`   - ${a.cliente.nome} | Empresa: ${a.empresaId} | Status: ${a.status}`);
    });
    console.log('');

    // Resumo
    console.log('='.repeat(50));
    console.log('📊 RESUMO:');
    console.log(`Total de empresas do dono: ${empresasDoDono.length}`);
    console.log(`Total de agendamentos (todos): ${todosAgendamentos.length}`);
    console.log(`Total com status "agendado": ${agendamentosAgendados.length}`);
    console.log(`Total usando query da API: ${agendamentosIN.length}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQueryAgendamentos();
