import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: servicoId } = await params;

    console.log(`[API Serviço Individual] Buscando serviço com ID: ${servicoId}`);

    // Buscar serviço na tabela antiga (Servico)
    let servico = await prisma.servico.findUnique({
      where: {
        id: servicoId,
        ativo: true
      },
      include: {
        empresa: {
          select: {
            id: true,
            nomeEmpresa: true,
            logoUrl: true,
          }
        }
      }
    });

    if (servico) {
      console.log(`[API Serviço Individual] Serviço encontrado na tabela antiga: ${servico.nome}`);

      const servicoFormatado = {
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
        preco: servico.preco ? Number(servico.preco) : 0,
        duracao: servico.duracao,
        imagem: servico.imageUrl || "https://via.placeholder.com/300x200",
        empresaId: servico.empresaId,
        empresa: servico.empresa
      };

      return NextResponse.json(servicoFormatado);
    }

    // Se não encontrou na tabela antiga, buscar na tabela Service
    const service = await prisma.service.findUnique({
      where: {
        id: servicoId,
        active: true
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
          }
        }
      }
    });

    if (service) {
      console.log(`[API Serviço Individual] Serviço encontrado na tabela nova: ${service.name}`);

      const servicoFormatado = {
        id: service.id,
        nome: service.name,
        descricao: service.description,
        preco: service.price ? Number(service.price) : 0,
        duracao: service.duration,
        imagem: service.imageUrl || "https://via.placeholder.com/300x200",
        empresaId: service.companyId,
        empresa: service.company
      };

      return NextResponse.json(servicoFormatado);
    }

    // Se não encontrou em nenhuma tabela
    console.log(`[API Serviço Individual] Serviço não encontrado: ${servicoId}`);
    return NextResponse.json(
      { error: "Serviço não encontrado" },
      { status: 404 }
    );

  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
