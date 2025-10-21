import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function limparPlanosTest() {
  try {
    // Deletar plano de teste
    const resultado = await prisma.plan.deleteMany({
      where: {
        name: "Plano Teste",
      },
    });

    console.log(`✅ ${resultado.count} plano(s) de teste deletado(s)`);

    // Listar planos restantes
    const planos = await prisma.plan.findMany();
    console.log(`\n📋 Planos no banco: ${planos.length}`);
    planos.forEach((p) => console.log(`  - ${p.name}`));
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

limparPlanosTest();
