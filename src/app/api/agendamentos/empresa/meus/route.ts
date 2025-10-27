import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const profissionalId = searchParams.get("profissionalId");

    console.log('🔍 Tentando buscar agendamentos da empresa');
    console.log('📝 Filtros:', { startDate, endDate, status, profissionalId });

    // Autenticar usando o middleware padrão
    const auth = await authMiddleware(request);

    if (!auth.authenticated) {
      console.log('❌ Usuário não autenticado');
      return auth.response!;
    }

    console.log('✅ Usuário autenticado:', {
      id: auth.user.id,
      email: auth.user.email,
      tipoUsuario: auth.user.tipoUsuario
    });

    // Verificar se o usuário é dono ou convidado
    const isDono = auth.user.tipoUsuario === 'dono';
    let empresaIds: string[] = [];
    let empresasInfo: Array<{ id: string; nome: string }> = [];

    if (isDono) {
      // Buscar TODAS as empresas onde o usuário é dono
      const todasEmpresas = await prisma.empresa.findMany({
        where: {
          donoId: auth.user.id,
          ativo: true
        },
        select: {
          id: true,
          nomeEmpresa: true,
          nomeFantasia: true
        }
      });

      console.log("🏢 Empresas do usuário (dono):", {
        userId: auth.user.id,
        userEmail: auth.user.email,
        totalEmpresas: todasEmpresas.length,
        empresas: todasEmpresas.map(e => ({
          id: e.id,
          nome: e.nomeFantasia || e.nomeEmpresa
        }))
      });

      if (todasEmpresas.length === 0) {
        return NextResponse.json({
          success: true,
          agendamentos: [],
          message: "Nenhuma empresa encontrada para este usuário"
        });
      }

      empresaIds = todasEmpresas.map(e => e.id);
      empresasInfo = todasEmpresas.map(e => ({
        id: e.id,
        nome: e.nomeFantasia || e.nomeEmpresa
      }));
    } else {
      // Usuário é convidado - buscar empresa onde ele é funcionário
      const funcionario = await prisma.funcionario.findFirst({
        where: {
          userId: auth.user.id,
          ativo: true
        },
        select: {
          empresaId: true,
          empresa: {
            select: {
              id: true,
              nomeEmpresa: true,
              nomeFantasia: true
            }
          }
        }
      });

      if (!funcionario) {
        return NextResponse.json({
          success: true,
          agendamentos: [],
          message: "Nenhuma empresa encontrada para este funcionário"
        });
      }

      empresaIds = [funcionario.empresaId];
      empresasInfo = [{
        id: funcionario.empresa.id,
        nome: funcionario.empresa.nomeFantasia || funcionario.empresa.nomeEmpresa
      }];
      console.log("🏢 Empresa do funcionário:", funcionario.empresaId);
    }

    console.log('🔍 IDs das empresas para buscar agendamentos:', empresaIds);

    // Construir filtros para buscar agendamentos
    const where: any = {
      empresaId: {
        in: empresaIds
      }
    };

    // Se não for dono, filtrar apenas agendamentos do próprio funcionário
    if (!isDono) {
      where.profissionalId = auth.user.id;
      console.log('👤 Filtrando agendamentos apenas do funcionário:', auth.user.id);
    } else if (profissionalId && profissionalId !== 'todos') {
      // Se o dono selecionou um profissional específico, filtrar por ele
      where.profissionalId = profissionalId;
      console.log('👤 Filtrando agendamentos do profissional selecionado:', profissionalId);
    }

    // Filtrar por data se fornecido
    if (startDate && endDate) {
      where.dataHora = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Filtrar por status se fornecido
    if (status) {
      where.status = status;
    }

    console.log('🔎 Filtros de busca de agendamentos:', JSON.stringify(where, null, 2));

    // Buscar agendamentos
    console.log('🔍 Executando query no Prisma...');
    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true
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
        dataHora: 'asc'
      }
    });

    console.log(`✅ Encontrados ${agendamentos.length} agendamentos`);
    
    if (agendamentos.length > 0) {
      console.log("📋 Agendamentos encontrados:", agendamentos.map(ag => ({
        id: ag.id,
        empresaId: ag.empresaId,
        servico: ag.servico.nome,
        cliente: ag.cliente.nome,
        dataHora: ag.dataHora.toISOString()
      })));
    }

    // Formatar resposta
    const agendamentosFormatados = agendamentos.map(ag => ({
      id: ag.id,
      empresaId: ag.empresaId,
      servicoId: ag.servicoId,
      clienteId: ag.clienteId,
      dataHora: ag.dataHora.toISOString(),
      duracao: ag.duracao,
      valor: ag.valor.toString(),
      status: ag.status,
      observacoes: ag.observacoes,
      cliente: ag.cliente,
      servico: ag.servico,
      createdAt: ag.createdAt.toISOString(),
      updatedAt: ag.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      agendamentos: agendamentosFormatados,
      empresas: empresasInfo,
      totalEmpresas: empresasInfo.length
    });

  } catch (error) {
    console.error("Erro ao buscar agendamentos da empresa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
