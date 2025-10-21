import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params;

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

    // Buscar cliente com informações completas
    const cliente = await prisma.cliente.findUnique({
      where: {
        id: id,
      },
      include: {
        agendamentos: {
          include: {
            servico: true,
          },
          orderBy: {
            dataHora: "desc",
          },
        },
        _count: {
          select: {
            agendamentos: true,
          },
        },
      },
    });

    if (!cliente || cliente.empresaId !== empresa.id) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 },
      );
    }

    // Buscar documentos manualmente (fallback caso Prisma Client não esteja atualizado)
    let documentos: any[] = [];
    let documentosCount = 0;

    try {
      // @ts-ignore - Pode não existir no tipo ainda
      documentos = await prisma.documento.findMany({
        where: {
          clienteId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      documentosCount = documentos.length;
      console.log(
        `✅ Documentos encontrados para cliente ${id}:`,
        documentosCount,
      );
    } catch (error) {
      console.log(
        "⚠️ Modelo Documento ainda não disponível no Prisma Client. Execute: npx prisma generate",
      );
      console.log("Erro:", error);
      documentos = [];
      documentosCount = 0;
    }

    // Adicionar contadores e relações
    const clienteComContadores = {
      ...cliente,
      documentos,
      respostasFormulario: [],
      _count: {
        ...cliente._count,
        documentos: documentosCount,
        respostasFormulario: 0,
      },
    };

    return NextResponse.json({ cliente: clienteComContadores });
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cliente" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params;

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
    const { nome, email, telefone, cpf, avatarUrl } = body;

    // Verificar se cliente pertence à empresa
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id: id },
    });

    if (!clienteExistente || clienteExistente.empresaId !== empresa.id) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 },
      );
    }

    // Atualizar cliente
    const cliente = await prisma.cliente.update({
      where: { id: id },
      data: {
        nome,
        email,
        telefone,
        cpf,
        // avatarUrl não existe no banco ainda, será adicionado na migration
      },
    });

    return NextResponse.json({ cliente });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params;

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

    // Verificar se cliente pertence à empresa
    const cliente = await prisma.cliente.findUnique({
      where: { id: id },
    });

    if (!cliente || cliente.empresaId !== empresa.id) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 },
      );
    }

    // Desativar cliente ao invés de deletar
    await prisma.cliente.update({
      where: { id: id },
      data: { ativo: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return NextResponse.json(
      { error: "Erro ao excluir cliente" },
      { status: 500 },
    );
  }
}
