import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/avaliacoes/estatisticas - Obter estatísticas de avaliações
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const empresaId = searchParams.get('empresaId');
    const servicoId = searchParams.get('servicoId');

    if (!empresaId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a empresa existe
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId, ativo: true },
      select: {
        id: true,
        nomeEmpresa: true,
        nomeFantasia: true,
      },
    });

    if (!empresa) {
      return NextResponse.json(
        { success: false, error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Calcular estatísticas básicas
    const stats = await prisma.avaliacao.aggregate({
      where: {
        empresaId,
        ...(servicoId && { servicoId }),
        ativo: true,
      },
      _avg: {
        nota: true,
      },
      _count: {
        nota: true,
      },
      _min: {
        nota: true,
      },
      _max: {
        nota: true,
      },
    });

    // Calcular distribuição por estrelas
    const distribuicao = await prisma.avaliacao.groupBy({
      by: ['nota'],
      where: {
        empresaId,
        ...(servicoId && { servicoId }),
        ativo: true,
      },
      _count: {
        nota: true,
      },
      orderBy: {
        nota: 'desc',
      },
    });

    // Calcular percentual de cada nota
    const totalAvaliacoes = stats._count.nota || 0;
    const distribuicaoPercentual = distribuicao.map(item => ({
      nota: item.nota,
      quantidade: item._count.nota,
      percentual: totalAvaliacoes > 0 ? (item._count.nota / totalAvaliacoes) * 100 : 0,
    }));

    // Buscar avaliações recentes
    const avaliacoesRecentes = await prisma.avaliacao.findMany({
      where: {
        empresaId,
        ...(servicoId && { servicoId }),
        ativo: true,
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            avatarUrl: true,
          },
        },
        servico: {
          select: {
            id: true,
            nome: true,
          },
        },
        respostas: {
          where: { ativo: true },
          include: {
            empresa: {
              select: {
                id: true,
                nomeEmpresa: true,
                nomeFantasia: true,
              },
            },
          },
        },
      },
      orderBy: {
        dataAvaliacao: 'desc',
      },
      take: 5,
    });

    // Calcular tendência (últimos 30 dias vs período anterior)
    const agora = new Date();
    const trintaDiasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sessentaDiasAtras = new Date(agora.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [avaliacoesUltimos30Dias, avaliacoesPeriodoAnterior] = await Promise.all([
      prisma.avaliacao.aggregate({
        where: {
          empresaId,
          ...(servicoId && { servicoId }),
          ativo: true,
          dataAvaliacao: {
            gte: trintaDiasAtras,
          },
        },
        _avg: {
          nota: true,
        },
        _count: {
          nota: true,
        },
      }),
      prisma.avaliacao.aggregate({
        where: {
          empresaId,
          ...(servicoId && { servicoId }),
          ativo: true,
          dataAvaliacao: {
            gte: sessentaDiasAtras,
            lt: trintaDiasAtras,
          },
        },
        _avg: {
          nota: true,
        },
        _count: {
          nota: true,
        },
      }),
    ]);

    const mediaAtual = avaliacoesUltimos30Dias._avg.nota || 0;
    const mediaAnterior = avaliacoesPeriodoAnterior._avg.nota || 0;
    const tendencia = mediaAnterior > 0 ? ((mediaAtual - mediaAnterior) / mediaAnterior) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        empresa: {
          id: empresa.id,
          nome: empresa.nomeFantasia || empresa.nomeEmpresa,
        },
        estatisticas: {
          totalAvaliacoes,
          media: Math.round((stats._avg.nota || 0) * 100) / 100,
          menorNota: stats._min.nota || 0,
          maiorNota: stats._max.nota || 0,
          distribuicao: distribuicaoPercentual,
          tendencia: Math.round(tendencia * 100) / 100,
        },
        avaliacoesRecentes,
        periodo: {
          ultimos30Dias: {
            total: avaliacoesUltimos30Dias._count.nota || 0,
            media: Math.round((avaliacoesUltimos30Dias._avg.nota || 0) * 100) / 100,
          },
          periodoAnterior: {
            total: avaliacoesPeriodoAnterior._count.nota || 0,
            media: Math.round((avaliacoesPeriodoAnterior._avg.nota || 0) * 100) / 100,
          },
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

