import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const tipo = searchParams.get("tipo") || "proximos"; // proximos, passados, todos

    // Autenticar usando o middleware padrão
    const auth = await authMiddleware(request);

    if (!auth.authenticated) {
      return auth.response!;
    }

    // Buscar clientes associados ao email do usuário
    const clientes = await prisma.cliente.findMany({
      where: {
        email: auth.user.email
      },
      select: {
        id: true
      }
    });

    if (clientes.length === 0) {
      return NextResponse.json({
        success: true,
        agendamentos: [],
        message: "Nenhum agendamento encontrado"
      });
    }

    const clienteIds = clientes.map(c => c.id);

    // Construir filtros baseados no tipo
    const now = new Date();
    let where: any = {
      clienteId: {
        in: clienteIds
      }
    };

    if (tipo === "proximos") {
      where.dataHora = { gte: now };
      where.status = {
        in: ['agendado', 'confirmado']
      };
    } else if (tipo === "passados") {
      where.OR = [
        { dataHora: { lt: now } },
        { status: { in: ['concluido', 'cancelado'] } }
      ];
    }

    // Buscar agendamentos
    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
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
            estado: true
          }
        },
        servico: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            duracao: true,
            preco: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        dataHora: tipo === "passados" ? 'desc' : 'asc'
      }
    });

    // Formatar resposta
    const agendamentosFormatados = agendamentos.map(ag => ({
      id: ag.id,
      empresaId: ag.empresaId,
      servicoId: ag.servicoId,
      dataHora: ag.dataHora.toISOString(),
      duracao: ag.duracao,
      valor: ag.valor.toString(),
      status: ag.status,
      observacoes: ag.observacoes,
      empresa: ag.empresa,
      servico: ag.servico,
      createdAt: ag.createdAt.toISOString(),
      updatedAt: ag.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      agendamentos: agendamentosFormatados
    });

  } catch (error) {
    console.error("Erro ao buscar agendamentos do cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
