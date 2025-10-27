import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.authenticated) {
      return auth.response!;
    }

    const userId = auth.user.id;
    const { id } = await params;
    const body = await request.json();
    const { name, description, duration, price, imageUrl, active } = body;

    // Validar dados obrigatórios
    if (!name || !duration) {
      return NextResponse.json(
        { error: "Nome e duração são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar dados do usuário com suas empresas e funcionários
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        empresas: true,
        funcionarios: {
          include: {
            empresa: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Determinar a empresa (dono tem empresas[], funcionário tem funcionarios[])
    let empresaId: string;
    if (user.tipoUsuario === 'dono' && user.empresas.length > 0) {
      empresaId = user.empresas[0].id;
    } else if (user.funcionarios.length > 0) {
      empresaId = user.funcionarios[0].empresaId;
    } else {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o serviço pertence à empresa do usuário
    const existingServico = await prisma.servico.findFirst({
      where: {
        id,
        empresaId,
      },
    });

    if (!existingServico) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar serviço
    const servico = await prisma.servico.update({
      where: { id },
      data: {
        nome: name,
        descricao: description || null,
        duracao: parseInt(duration),
        preco: price ? parseFloat(price) : 0,
        imageUrl: imageUrl || null,
        ativo: active !== undefined ? active : true,
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        duracao: true,
        preco: true,
        imageUrl: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      service: {
        id: servico.id,
        name: servico.nome,
        description: servico.descricao,
        duration: servico.duracao,
        price: servico.preco ? Number(servico.preco) : null,
        imageUrl: servico.imageUrl,
        active: servico.ativo,
        createdAt: servico.createdAt,
        updatedAt: servico.updatedAt,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.authenticated) {
      return auth.response!;
    }

    const userId = auth.user.id;
    const { id } = await params;

    // Buscar dados do usuário com suas empresas e funcionários
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        empresas: true,
        funcionarios: {
          include: {
            empresa: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Determinar a empresa (dono tem empresas[], funcionário tem funcionarios[])
    let empresaId: string;
    if (user.tipoUsuario === 'dono' && user.empresas.length > 0) {
      empresaId = user.empresas[0].id;
    } else if (user.funcionarios.length > 0) {
      empresaId = user.funcionarios[0].empresaId;
    } else {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o serviço pertence à empresa do usuário
    const existingServico = await prisma.servico.findFirst({
      where: {
        id,
        empresaId,
      },
    });

    if (!existingServico) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    // Soft delete - marcar como inativo
    await prisma.servico.update({
      where: { id },
      data: { ativo: false },
    });

    return NextResponse.json({ message: "Serviço removido com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar serviço:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
