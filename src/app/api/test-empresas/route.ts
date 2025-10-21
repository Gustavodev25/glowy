import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('[TEST] Iniciando teste de busca de empresas...');

    // Buscar todas as empresas sem filtros
    const todasEmpresas = await prisma.empresa.findMany({
      include: {
        servicos: true,
        dono: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
    });

    console.log(`[TEST] Total de empresas no banco: ${todasEmpresas.length}`);

    // Buscar apenas empresas ativas
    const empresasAtivas = await prisma.empresa.findMany({
      where: {
        ativo: true,
      },
      include: {
        servicos: {
          where: {
            ativo: true,
          },
        },
        dono: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
    });

    console.log(`[TEST] Empresas ativas: ${empresasAtivas.length}`);

    // Detalhes de cada empresa
    const detalhes = todasEmpresas.map(emp => ({
      id: emp.id,
      nome: emp.nomeEmpresa,
      nomeFantasia: emp.nomeFantasia,
      ativo: emp.ativo,
      totalServicos: emp.servicos.length,
      servicosAtivos: emp.servicos.filter(s => s.ativo).length,
      servicos: emp.servicos.map(s => ({
        id: s.id,
        nome: s.nome,
        preco: s.preco.toString(),
        ativo: s.ativo,
      })),
    }));

    return NextResponse.json({
      success: true,
      totalEmpresas: todasEmpresas.length,
      empresasAtivas: empresasAtivas.length,
      detalhes,
    });
  } catch (error) {
    console.error('[TEST] Erro ao buscar empresas:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
