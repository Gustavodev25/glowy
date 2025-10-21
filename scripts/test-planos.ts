import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testPlanos() {
  try {
    console.log("🔍 Testando conexão com tabela plans...");

    // Buscar todos os planos
    const planos = await prisma.plan.findMany();
    console.log(`✅ Planos encontrados: ${planos.length}`);
    console.log(planos);

    // Criar plano de teste
    console.log("\n🔨 Criando plano de teste...");
    const novoPlano = await prisma.plan.create({
      data: {
        name: "Plano Teste",
        description: "Plano de teste do sistema",
        price: 99.9,
        interval: "MONTHLY",
        features: ["Recurso 1", "Recurso 2", "Recurso 3"],
        maxProfissionais: 5,
        maxClientes: 200,
        maxAgendamentosMes: 100,
        permiteMultiEmpresa: true,
        permiteRelatorios: true,
        permiteIntegracoes: false,
        permiteWhatsapp: true,
        permiteSms: false,
        permiteAgendaOnline: true,
        permitePersonalizacao: true,
        active: true,
      },
    });

    console.log("✅ Plano criado com sucesso:");
    console.log(novoPlano);

    // Buscar novamente
    const planosAtualizados = await prisma.plan.findMany();
    console.log(`\n✅ Total de planos: ${planosAtualizados.length}`);
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPlanos();
