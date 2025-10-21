import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/avaliacoes - Listar avaliações de uma empresa
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const empresaId = searchParams.get('empresaId');
    const servicoId = searchParams.get('servicoId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeRespostas = searchParams.get('includeRespostas') === 'true';

    if (!empresaId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa é obrigatório' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Buscar avaliações
    const avaliacoes = await prisma.avaliacao.findMany({
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
        ...(includeRespostas && {
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
        }),
      },
      orderBy: {
        dataAvaliacao: 'desc',
      },
      skip,
      take: limit,
    });

    // Contar total de avaliações
    const total = await prisma.avaliacao.count({
      where: {
        empresaId,
        ...(servicoId && { servicoId }),
        ativo: true,
      },
    });

    // Calcular estatísticas
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
    });

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
    });

    return NextResponse.json({
      success: true,
      data: {
        avaliacoes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        estatisticas: {
          media: stats._avg.nota || 0,
          total: stats._count.nota || 0,
          distribuicao: distribuicao.reduce((acc, item) => {
            acc[`${item.nota}_estrelas`] = item._count.nota;
            return acc;
          }, {} as Record<string, number>),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/avaliacoes - Criar nova avaliação
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }
    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { empresaId, servicoId, nota, comentario } = body;

    // Validações
    if (!empresaId || !nota) {
      return NextResponse.json(
        { success: false, error: 'Empresa ID e nota são obrigatórios' },
        { status: 400 }
      );
    }

    if (nota < 1 || nota > 5) {
      return NextResponse.json(
        { success: false, error: 'Nota deve estar entre 1 e 5' },
        { status: 400 }
      );
    }

    // Verificar se a empresa existe
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId, ativo: true },
    });

    if (!empresa) {
      return NextResponse.json(
        { success: false, error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o serviço existe (se fornecido)
    if (servicoId) {
      const servico = await prisma.servico.findUnique({
        where: { id: servicoId, ativo: true },
      });

      if (!servico) {
        return NextResponse.json(
          { success: false, error: 'Serviço não encontrado' },
          { status: 404 }
        );
      }
    }

    // Verificar se já existe avaliação do mesmo cliente para a mesma empresa/serviço
    const avaliacaoExistente = await prisma.avaliacao.findUnique({
      where: {
        clienteId_empresaId_servicoId: {
          clienteId: userId,
          empresaId,
          servicoId: servicoId || null,
        },
      },
    });

    if (avaliacaoExistente) {
      return NextResponse.json(
        { success: false, error: 'Você já avaliou esta empresa/serviço' },
        { status: 400 }
      );
    }

    // Criar avaliação
    const avaliacao = await prisma.avaliacao.create({
      data: {
        empresaId,
        clienteId: userId,
        servicoId,
        nota,
        comentario,
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
      },
    });

    return NextResponse.json({
      success: true,
      data: avaliacao,
      message: 'Avaliação criada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

