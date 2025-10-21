import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar agendamento por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        servico: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            duracao: true,
            preco: true,
            imageUrl: true,
          },
        },
        empresa: {
          select: {
            id: true,
            nomeEmpresa: true,
            nomeFantasia: true,
            logoUrl: true,
            telefone: true,
            email: true,
            enderecoCompleto: true,
            logradouro: true,
            numero: true,
            bairro: true,
            cidade: true,
            estado: true,
            cep: true,
          },
        },
      },
    });

    if (!agendamento) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      agendamento: {
        id: agendamento.id,
        empresaId: agendamento.empresaId,
        servicoId: agendamento.servicoId,
        clienteId: agendamento.clienteId,
        dataHora: agendamento.dataHora.toISOString(),
        duracao: agendamento.duracao,
        valor: agendamento.valor.toString(),
        status: agendamento.status,
        observacoes: agendamento.observacoes,
        formaPagamento: "dinheiro", // TODO: adicionar campo no schema
        cliente: agendamento.cliente,
        servico: agendamento.servico,
        empresa: agendamento.empresa,
        createdAt: agendamento.createdAt.toISOString(),
        updatedAt: agendamento.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

// PUT - Atualizar agendamento (status, observações, etc)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { status, observacoes } = body;

    // Validar status permitidos
    const statusPermitidos = [
      "agendado",
      "confirmado",
      "concluido",
      "cancelado",
    ];

    if (status && !statusPermitidos.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(observacoes !== undefined && { observacoes }),
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        servico: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            duracao: true,
            preco: true,
            imageUrl: true,
          },
        },
        empresa: {
          select: {
            id: true,
            nomeEmpresa: true,
            nomeFantasia: true,
            logoUrl: true,
          },
        },
      },
    });

    console.log(
      `✅ Agendamento ${id} atualizado para status: ${agendamento.status}`,
    );

    return NextResponse.json({
      success: true,
      agendamento: {
        id: agendamento.id,
        status: agendamento.status,
        observacoes: agendamento.observacoes,
        dataHora: agendamento.dataHora.toISOString(),
        cliente: agendamento.cliente,
        servico: agendamento.servico,
        empresa: agendamento.empresa,
      },
      message: "Agendamento atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

// DELETE - Cancelar agendamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: {
        status: "cancelado",
      },
    });

    console.log(`✅ Agendamento ${id} cancelado`);

    return NextResponse.json({
      success: true,
      message: "Agendamento cancelado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
