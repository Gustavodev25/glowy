import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAgendamentos() {
  try {
    console.log('🔍 Verificando agendamentos no banco...\n');

    // Buscar a empresa
    const empresa = await prisma.empresa.findFirst({
      where: {
        id: 'c7d87e5a-19f6-4819-ad06-4186cc95ebda'
      },
      select: {
        id: true,
        nomeEmpresa: true,
        nomeFantasia: true,
        donoId: true
      }
    });

    console.log('🏢 Empresa encontrada:', empresa);
    console.log('');

    // Buscar TODOS os agendamentos dessa empresa (sem filtro de status)
    const todosAgendamentos = await prisma.agendamento.findMany({
      where: {
        empresaId: 'c7d87e5a-19f6-4819-ad06-4186cc95ebda'
      },
      select: {
        id: true,
        status: true,
        dataHora: true,
        valor: true,
        observacoes: true,
        createdAt: true,
        cliente: {
          select: {
            nome: true,
            email: true,
            telefone: true
          }
        },
        servico: {
          select: {
            nome: true,
            preco: true,
            duracao: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📋 Total de agendamentos encontrados: ${todosAgendamentos.length}\n`);

    if (todosAgendamentos.length > 0) {
      todosAgendamentos.forEach((ag, index) => {
        console.log(`--- Agendamento ${index + 1} ---`);
        console.log('ID:', ag.id);
        console.log('Status:', ag.status);
        console.log('Data/Hora:', ag.dataHora.toISOString());
        console.log('Valor:', ag.valor.toString());
        console.log('Cliente:', ag.cliente.nome);
        console.log('Serviço:', ag.servico.nome);
        console.log('Criado em:', ag.createdAt.toISOString());
        console.log('');
      });
    } else {
      console.log('❌ Nenhum agendamento encontrado!');
      console.log('');
      console.log('Verificando se existem agendamentos em outras empresas...');
      
      const outrosAgendamentos = await prisma.agendamento.findMany({
        take: 5,
        select: {
          id: true,
          empresaId: true,
          status: true,
          empresa: {
            select: {
              nomeEmpresa: true,
              nomeFantasia: true
            }
          }
        }
      });

      if (outrosAgendamentos.length > 0) {
        console.log(`\n✅ Encontrados ${outrosAgendamentos.length} agendamentos em outras empresas:`);
        outrosAgendamentos.forEach((ag) => {
          console.log(`- Empresa: ${ag.empresa.nomeFantasia || ag.empresa.nomeEmpresa} (ID: ${ag.empresaId})`);
          console.log(`  Status: ${ag.status}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAgendamentos();
