import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando migração do sistema de avaliações...');

  try {
    // Verificar se as tabelas já existem
    const avaliacoesCount = await prisma.avaliacao.count();
    console.log(`📊 Tabela de avaliações já possui ${avaliacoesCount} registros`);

    // Inserir algumas avaliações de exemplo (opcional)
    const empresas = await prisma.empresa.findMany({
      where: { ativo: true },
      take: 2,
    });

    if (empresas.length > 0 && avaliacoesCount === 0) {
      console.log('📝 Inserindo avaliações de exemplo...');

      // Buscar usuários para criar avaliações
      const usuarios = await prisma.user.findMany({
        where: { ativo: true },
        take: 3,
      });

      if (usuarios.length > 0) {
        const avaliacoesExemplo = [
          {
            empresaId: empresas[0].id,
            clienteId: usuarios[0].id,
            nota: 5,
            comentario: 'Excelente atendimento! Profissionais muito qualificados e ambiente agradável.',
          },
          {
            empresaId: empresas[0].id,
            clienteId: usuarios[1]?.id || usuarios[0].id,
            nota: 4,
            comentario: 'Muito bom serviço, recomendo!',
          },
          {
            empresaId: empresas[0].id,
            clienteId: usuarios[2]?.id || usuarios[0].id,
            nota: 5,
            comentario: 'Perfeito! Voltarei com certeza.',
          },
        ];

        if (empresas.length > 1) {
          avaliacoesExemplo.push(
            {
              empresaId: empresas[1].id,
              clienteId: usuarios[0].id,
              nota: 3,
              comentario: 'Atendimento regular, mas pode melhorar.',
            },
            {
              empresaId: empresas[1].id,
              clienteId: usuarios[1]?.id || usuarios[0].id,
              nota: 4,
              comentario: 'Bom serviço, preço justo.',
            }
          );
        }

        for (const avaliacao of avaliacoesExemplo) {
          try {
            await prisma.avaliacao.create({
              data: avaliacao,
            });
            console.log(`✅ Avaliação criada para empresa ${avaliacao.empresaId}`);
          } catch (error) {
            console.log(`⚠️  Avaliação já existe ou erro: ${error}`);
          }
        }
      }
    }

    // Verificar estatísticas finais
    const totalAvaliacoes = await prisma.avaliacao.count();
    const mediaGeral = await prisma.avaliacao.aggregate({
      _avg: {
        nota: true,
      },
    });

    console.log('📈 Estatísticas finais:');
    console.log(`   Total de avaliações: ${totalAvaliacoes}`);
    console.log(`   Média geral: ${mediaGeral._avg.nota?.toFixed(2) || '0.00'}`);

    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Falha na migração:', e);
    process.exit(1);
  });

