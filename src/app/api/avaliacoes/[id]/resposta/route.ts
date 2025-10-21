import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// POST /api/avaliacoes/[id]/resposta - Responder a uma avaliação
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { id: avaliacaoId } = await params;
    const body = await request.json();
    const { resposta } = body;

    if (!resposta || resposta.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Resposta é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar a avaliação
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: avaliacaoId, ativo: true },
      include: {
        empresa: {
          include: {
            dono: true,
          },
        },
      },
    });

    if (!avaliacao) {
      return NextResponse.json(
        { success: false, error: 'Avaliação não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é dono da empresa
    if (avaliacao.empresa.donoId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Você não tem permissão para responder esta avaliação' },
        { status: 403 }
      );
    }

    // Verificar se já existe resposta
    const respostaExistente = await prisma.respostaAvaliacao.findUnique({
      where: { avaliacaoId },
    });

    if (respostaExistente) {
      return NextResponse.json(
        { success: false, error: 'Esta avaliação já possui uma resposta' },
        { status: 400 }
      );
    }

    // Criar resposta
    const novaResposta = await prisma.respostaAvaliacao.create({
      data: {
        avaliacaoId,
        empresaId: avaliacao.empresaId,
        resposta: resposta.trim(),
      },
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

    return NextResponse.json({
      success: true,
      data: novaResposta,
      message: 'Resposta criada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar resposta:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/avaliacoes/[id]/resposta - Atualizar resposta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const userId = await verifyToken(token);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { id: avaliacaoId } = await params;
    const body = await request.json();
    const { resposta } = body;

    if (!resposta || resposta.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Resposta é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar a resposta existente
    const respostaExistente = await prisma.respostaAvaliacao.findUnique({
      where: { avaliacaoId },
      include: {
        empresa: {
          include: {
            dono: true,
          },
        },
      },
    });

    if (!respostaExistente) {
      return NextResponse.json(
        { success: false, error: 'Resposta não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é dono da empresa
    if (respostaExistente.empresa.donoId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Você não tem permissão para editar esta resposta' },
        { status: 403 }
      );
    }

    // Atualizar resposta
    const respostaAtualizada = await prisma.respostaAvaliacao.update({
      where: { avaliacaoId },
      data: {
        resposta: resposta.trim(),
      },
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

    return NextResponse.json({
      success: true,
      data: respostaAtualizada,
      message: 'Resposta atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar resposta:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/avaliacoes/[id]/resposta - Deletar resposta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { id: avaliacaoId } = await params;

    // Buscar a resposta existente
    const respostaExistente = await prisma.respostaAvaliacao.findUnique({
      where: { avaliacaoId },
      include: {
        empresa: {
          include: {
            dono: true,
          },
        },
      },
    });

    if (!respostaExistente) {
      return NextResponse.json(
        { success: false, error: 'Resposta não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é dono da empresa
    if (respostaExistente.empresa.donoId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Você não tem permissão para deletar esta resposta' },
        { status: 403 }
      );
    }

    // Deletar resposta (soft delete)
    await prisma.respostaAvaliacao.update({
      where: { avaliacaoId },
      data: { ativo: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Resposta deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar resposta:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

