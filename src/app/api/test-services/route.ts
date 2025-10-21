import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('[TEST SERVICES] Testando tabelas de serviços...');

    // Tabela Servico (relacionada a Empresa)
    const servicosEmpresa = await prisma.servico.findMany({
      include: {
        empresa: {
          select: {
            id: true,
            nomeEmpresa: true,
            nomeFantasia: true,
          },
        },
      },
    });

    console.log(`[TEST SERVICES] Serviços na tabela Servico: ${servicosEmpresa.length}`);

    // Tabela Service (relacionada a CompanySettings)
    const servicosCompany = await prisma.service.findMany({
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            userId: true,
          },
        },
      },
    });

    console.log(`[TEST SERVICES] Serviços na tabela Service: ${servicosCompany.length}`);

    // Verificar CompanySettings
    const companySettings = await prisma.companySettings.findMany({
      include: {
        services: true,
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    console.log(`[TEST SERVICES] CompanySettings encontradas: ${companySettings.length}`);

    return NextResponse.json({
      success: true,
      servicosEmpresa: {
        total: servicosEmpresa.length,
        dados: servicosEmpresa.map(s => ({
          id: s.id,
          nome: s.nome,
          preco: s.preco.toString(),
          duracao: s.duracao,
          empresa: s.empresa,
        })),
      },
      servicosCompany: {
        total: servicosCompany.length,
        dados: servicosCompany.map(s => ({
          id: s.id,
          name: s.name,
          price: s.price?.toString(),
          duration: s.duration,
          company: s.company,
        })),
      },
      companySettings: {
        total: companySettings.length,
        dados: companySettings.map(cs => ({
          id: cs.id,
          companyName: cs.companyName,
          businessType: cs.businessType,
          userId: cs.userId,
          user: cs.user,
          totalServices: cs.services.length,
          services: cs.services,
        })),
      },
    });
  } catch (error) {
    console.error('[TEST SERVICES] Erro:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
