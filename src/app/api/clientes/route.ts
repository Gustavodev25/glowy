import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar empresa do usuário
    const empresa = await prisma.empresa.findFirst({
      where: { donoId: user.userId },
    });

    if (!empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 },
      );
    }

    // Buscar TODOS os clientes ativos da empresa com contagem de agendamentos
    const clientes = await prisma.cliente.findMany({
      where: {
        empresaId: empresa.id,
        ativo: true,
      },
      include: {
        _count: {
          select: {
            agendamentos: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Mais recentes primeiro
      },
    });

    return NextResponse.json({ clientes });
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar clientes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar empresa do usuário
    const empresa = await prisma.empresa.findFirst({
      where: { donoId: user.userId },
    });

    if (!empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { nome, email, telefone, cpf } = body;

    // Validações básicas
    if (!nome || !telefone) {
      return NextResponse.json(
        { error: "Nome e telefone são obrigatórios" },
        { status: 400 },
      );
    }

    // Criar cliente
    const cliente = await prisma.cliente.create({
      data: {
        empresaId: empresa.id,
        nome,
        email,
        telefone,
        cpf,
        // avatarUrl será adicionado após migration SQL
      },
    });

    return NextResponse.json({ cliente }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 },
    );
  }
}
