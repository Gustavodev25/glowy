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

    // Buscar as configurações da empresa do usuário
    const companySettings = await prisma.companySettings.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!companySettings) {
      return NextResponse.json(
        { error: "Configurações da empresa não encontradas" },
        { status: 404 }
      );
    }

    // Verificar se o serviço pertence à empresa do usuário
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        companyId: companySettings.id,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar serviço
    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description: description || null,
        duration: parseInt(duration),
        price: price ? parseFloat(price) : null,
        imageUrl: imageUrl || null,
        active: active !== undefined ? active : true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        price: true,
        imageUrl: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price ? Number(service.price) : null,
        imageUrl: service.imageUrl,
        active: service.active,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
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

    // Buscar as configurações da empresa do usuário
    const companySettings = await prisma.companySettings.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!companySettings) {
      return NextResponse.json(
        { error: "Configurações da empresa não encontradas" },
        { status: 404 }
      );
    }

    // Verificar se o serviço pertence à empresa do usuário
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        companyId: companySettings.id,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    // Soft delete - marcar como inativo
    await prisma.service.update({
      where: { id },
      data: { active: false },
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
