// Script para verificar se o sistema de documentos está configurado
const { PrismaClient } = require('@prisma/client');

async function verificar() {
  console.log('🔍 Verificando configuração do sistema de documentos...\n');

  const prisma = new PrismaClient();

  try {
    // 1. Verificar se o modelo Documento existe no Prisma Client
    console.log('1️⃣ Verificando Prisma Client...');
    if (prisma.documento) {
      console.log('   ✅ Modelo Documento existe no Prisma Client');
    } else {
      console.log('   ❌ Modelo Documento NÃO existe no Prisma Client');
      console.log('   📝 Execute: npx prisma generate');
      return;
    }

    // 2. Verificar se a tabela existe no banco
    console.log('\n2️⃣ Verificando tabela no banco de dados...');
    try {
      const count = await prisma.documento.count();
      console.log(`   ✅ Tabela 'documentos' existe (${count} registros)`);
    } catch (error) {
      console.log('   ❌ Tabela "documentos" NÃO existe no banco');
      console.log('   📝 Execute: npx prisma migrate dev --name add_documento_model');
      console.log('   OU execute o arquivo: migration_documentos.sql');
      return;
    }

    // 3. Listar todos os documentos
    console.log('\n3️⃣ Listando documentos cadastrados...');
    const documentos = await prisma.documento.findMany({
      include: {
        cliente: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (documentos.length === 0) {
      console.log('   ℹ️ Nenhum documento cadastrado ainda');
    } else {
      console.log(`   ✅ ${documentos.length} documento(s) encontrado(s):`);
      documentos.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.nome} (${doc.tipo}) - Cliente: ${doc.cliente?.nome || 'N/A'}`);
      });
    }

    console.log('\n✅ Sistema de documentos configurado corretamente!');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verificar();
