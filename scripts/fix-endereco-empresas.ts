import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEnderecos() {
  console.log('🔧 Iniciando correção de endereços...\n');

  try {
    // Buscar todas as empresas
    const empresas = await prisma.empresa.findMany({
      select: {
        id: true,
        nomeEmpresa: true,
        enderecoCompleto: true,
        logradouro: true,
        numero: true,
        bairro: true,
        cidade: true,
        estado: true,
        cep: true
      }
    });

    console.log(`📋 Encontradas ${empresas.length} empresas\n`);

    let count = 0;

    for (const empresa of empresas) {
      let needsUpdate = false;
      let updateData: any = {};

      // Verificar se enderecoCompleto é JSON
      if (empresa.enderecoCompleto) {
        try {
          const parsed = JSON.parse(empresa.enderecoCompleto);
          
          // É um JSON, precisa formatar
          needsUpdate = true;
          
          updateData = {
            cep: parsed.cep || empresa.cep,
            logradouro: parsed.logradouro || empresa.logradouro,
            numero: parsed.numero || empresa.numero,
            bairro: parsed.bairro || empresa.bairro,
            cidade: parsed.localidade || parsed.cidade || empresa.cidade,
            estado: parsed.uf || parsed.estado || empresa.estado,
            enderecoCompleto: `${parsed.logradouro}, ${parsed.numero} - ${parsed.bairro}, ${parsed.localidade || parsed.cidade} - ${parsed.uf || parsed.estado}`
          };

          console.log(`✅ Corrigindo: ${empresa.nomeEmpresa}`);
          console.log(`   Antes: ${empresa.enderecoCompleto}`);
          console.log(`   Depois: ${updateData.enderecoCompleto}\n`);
          
        } catch {
          // Não é JSON, está ok
          continue;
        }
      }

      if (needsUpdate) {
        await prisma.empresa.update({
          where: { id: empresa.id },
          data: updateData
        });
        count++;
      }
    }

    console.log(`\n✅ Correção concluída! ${count} empresas atualizadas.`);

  } catch (error) {
    console.error('❌ Erro ao corrigir endereços:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEnderecos();
