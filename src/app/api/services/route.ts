import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.authenticated) {
      return auth.response!;
    }

    const userId = auth.user.id;

    // Buscar as configurações da empresa do usuário
    const companySettings = await prisma.companySettings.findUnique({
      where: { userId },
      select: {
        id: true,
        companyName: true,
      },
    });

    if (!companySettings) {
      return NextResponse.json(
        { error: "Configurações da empresa não encontradas" },
        { status: 404 }
      );
    }

    // Buscar todos os serviços da empresa
    const services = await prisma.service.findMany({
      where: {
        companyId: companySettings.id,
        active: true
      },
      orderBy: { createdAt: 'desc' },
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
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price ? Number(service.price) : null,
        imageUrl: service.imageUrl,
        active: service.active,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.authenticated) {
      return auth.response!;
    }

    const userId = auth.user.id;
    const body = await request.json();
    const { name, description, duration, price, imageUrl } = body;

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

    // Criar novo serviço
    const service = await prisma.service.create({
      data: {
        companyId: companySettings.id,
        name,
        description: description || null,
        duration: parseInt(duration),
        price: price ? parseFloat(price) : null,
        imageUrl: imageUrl || null,
        active: true,
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
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
