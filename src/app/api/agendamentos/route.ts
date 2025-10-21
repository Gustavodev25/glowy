import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      empresaId,
      servicoId,
      clienteNome,
      clienteEmail,
      clienteTelefone,
      dataAgendamento,
      horarioAgendamento,
      observacoes,
      formaPagamento,
    } = body;

    // Validações básicas
    if (
      !empresaId ||
      !servicoId ||
      !clienteNome ||
      !clienteEmail ||
      !dataAgendamento ||
      !horarioAgendamento
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 },
      );
    }

    // Log para debug
    console.log("📋 Dados recebidos:", {
      empresaId,
      servicoId,
      clienteNome,
      clienteEmail,
      clienteTelefone,
      dataAgendamento,
      horarioAgendamento,
      formaPagamento,
    });

    // Se o empresaId começar com 'cs-', buscar a empresa real vinculada
    let empresaIdReal = empresaId;
    console.log("🔍 empresaId recebido:", empresaId);

    if (empresaId.startsWith("cs-")) {
      const companySettingsId = empresaId.replace("cs-", "");
      console.log("🔍 Buscando CompanySettings com ID:", companySettingsId);

      const companySettings = await prisma.companySettings.findUnique({
        where: { id: companySettingsId },
        include: {
          user: {
            select: {
              id: true,
              nome: true,
              email: true,
              empresas: {
                where: { ativo: true },
                take: 1,
              },
            },
          },
        },
      });

      if (!companySettings) {
        console.log("❌ CompanySettings não encontrado");
        return NextResponse.json(
          { error: "Empresa não encontrada no sistema" },
          { status: 404 },
        );
      }

      // Se já existe uma empresa vinculada, usar ela
      if (companySettings.user.empresas[0]) {
        empresaIdReal = companySettings.user.empresas[0].id;
        console.log("✅ Empresa vinculada encontrada:", empresaIdReal);
      } else {
        // Se não existe empresa vinculada, criar uma na tabela antiga
        console.log(
          "⚠️ Empresa não encontrada na tabela antiga. Criando nova empresa...",
        );

        try {
          // Tentar parsear o endereço se for JSON
          let enderecoInfo = {
            cep: "00000-000",
            logradouro: "Endereço não informado",
            numero: "S/N",
            bairro: "Centro",
            cidade: "Cidade",
            estado: "UF",
            enderecoCompleto: companySettings.address || "",
          };

          if (companySettings.address) {
            try {
              const parsed = JSON.parse(companySettings.address);
              enderecoInfo = {
                cep: parsed.cep || "00000-000",
                logradouro: parsed.logradouro || "Endereço não informado",
                numero: parsed.numero || "S/N",
                bairro: parsed.bairro || "Centro",
                cidade: parsed.localidade || parsed.cidade || "Cidade",
                estado: parsed.uf || parsed.estado || "UF",
                enderecoCompleto: `${parsed.logradouro}, ${parsed.numero} - ${parsed.bairro}, ${parsed.localidade || parsed.cidade} - ${parsed.uf || parsed.estado}`,
              };
            } catch {
              // Se não for JSON, manter como string simples
              enderecoInfo.enderecoCompleto = companySettings.address;
            }
          }

          const novaEmpresa = await prisma.empresa.create({
            data: {
              donoId: companySettings.userId,
              tipoDocumento: "CNPJ",
              documento: `TEMP-${companySettings.id}`,
              nomeEmpresa: companySettings.companyName,
              nomeFantasia: companySettings.companyName,
              telefone: companySettings.phone || "(00) 00000-0000",
              email: companySettings.user.email,
              cep: enderecoInfo.cep,
              logradouro: enderecoInfo.logradouro,
              numero: enderecoInfo.numero,
              bairro: enderecoInfo.bairro,
              cidade: enderecoInfo.cidade,
              estado: enderecoInfo.estado,
              enderecoCompleto: enderecoInfo.enderecoCompleto,
              logoUrl: companySettings.logoUrl,
              ativo: true,
            },
          });

          empresaIdReal = novaEmpresa.id;
          console.log("✅ Nova empresa criada:", empresaIdReal);
        } catch (error) {
          console.error("❌ Erro ao criar empresa:", error);
          return NextResponse.json(
            { error: "Erro ao processar empresa no sistema" },
            { status: 500 },
          );
        }
      }
    }

    // Verificar se a empresa existe na tabela antiga
    const empresaExistente = await prisma.empresa.findUnique({
      where: { id: empresaIdReal, ativo: true },
    });

    if (!empresaExistente) {
      console.log(
        "❌ Empresa não encontrada na tabela Empresa:",
        empresaIdReal,
      );
      return NextResponse.json(
        { error: "Empresa não encontrada no sistema" },
        { status: 404 },
      );
    }

    console.log("✅ Empresa validada:", empresaIdReal);

    // Buscar o serviço para obter duração e preço
    let servico = await prisma.servico.findUnique({
      where: { id: servicoId },
    });

    // Se não encontrou na tabela antiga, buscar na tabela nova
    if (!servico) {
      console.log(
        "🔍 Serviço não encontrado na tabela antiga, buscando na tabela nova...",
      );
      const service = await prisma.service.findUnique({
        where: { id: servicoId },
      });

      if (!service) {
        console.log("❌ Serviço não encontrado em nenhuma tabela");
        return NextResponse.json(
          { error: "Serviço não encontrado" },
          { status: 404 },
        );
      }

      // Criar serviço na tabela antiga para manter compatibilidade
      console.log(
        "⚠️ Criando serviço na tabela antiga para compatibilidade...",
      );
      try {
        servico = await prisma.servico.create({
          data: {
            id: service.id, // Usar o mesmo ID para manter referência
            empresaId: empresaIdReal,
            nome: service.name,
            descricao: service.description,
            duracao: service.duration,
            preco: service.price || new Prisma.Decimal(0),
            imageUrl: service.imageUrl,
            ativo: service.active,
          },
        });
        console.log("✅ Serviço criado na tabela antiga:", servico.id);
      } catch (error: any) {
        // Se já existe (erro de ID duplicado), buscar ele
        if (error.code === "P2002") {
          console.log("ℹ️ Serviço já existe na tabela antiga, buscando...");
          servico = await prisma.servico.findUnique({
            where: { id: servicoId },
          });
        } else {
          console.error("❌ Erro ao criar serviço na tabela antiga:", error);
          throw error;
        }
      }
    }

    // Verificação final do serviço
    if (!servico) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 },
      );
    }

    // Buscar ou criar cliente
    let cliente = await prisma.cliente.findFirst({
      where: {
        empresaId: empresaIdReal,
        email: clienteEmail,
      },
    });

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          empresaId: empresaIdReal,
          nome: clienteNome,
          email: clienteEmail,
          telefone: clienteTelefone || "Não informado",
          ativo: true,
        },
      });
      console.log("✅ Cliente criado:", cliente.id);
    } else {
      // Atualizar dados do cliente se necessário
      cliente = await prisma.cliente.update({
        where: { id: cliente.id },
        data: {
          nome: clienteNome,
          telefone: clienteTelefone || cliente.telefone,
        },
      });
      console.log("✅ Cliente atualizado:", cliente.id);
    }

    // Combinar data e horário em um único DateTime
    const [horas, minutos] = horarioAgendamento.split(":");
    const dataHora = new Date(dataAgendamento);
    dataHora.setHours(parseInt(horas), parseInt(minutos), 0, 0);

    // Verificar conflitos de horário considerando a duração
    const endTime = new Date(dataHora.getTime() + servico!.duracao * 60000);

    const conflitos = await prisma.agendamento.findMany({
      where: {
        empresaId: empresaIdReal,
        status: {
          in: ["agendado", "confirmado"],
        },
        OR: [
          // Novo agendamento inicia durante um agendamento existente
          {
            AND: [
              { dataHora: { lte: dataHora } },
              {
                dataHora: {
                  gt: new Date(dataHora.getTime() - 24 * 60 * 60 * 1000), // Buscar no mesmo dia
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        dataHora: true,
        duracao: true,
      },
    });

    // Verificar overlap manualmente
    for (const agendamento of conflitos) {
      const agendamentoEnd = new Date(
        agendamento.dataHora.getTime() + agendamento.duracao * 60000,
      );

      // Verifica se há sobreposição
      const hasOverlap =
        (dataHora >= agendamento.dataHora && dataHora < agendamentoEnd) || // Inicia durante outro
        (endTime > agendamento.dataHora && endTime <= agendamentoEnd) || // Termina durante outro
        (dataHora <= agendamento.dataHora && endTime >= agendamentoEnd); // Engloba outro

      if (hasOverlap) {
        return NextResponse.json(
          {
            error: "Horário já está ocupado",
            conflito: {
              inicio: agendamento.dataHora.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              fim: agendamentoEnd.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          },
          { status: 409 },
        );
      }
    }

    // Criar agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        empresaId: empresaIdReal,
        servicoId,
        clienteId: cliente.id,
        dataHora,
        duracao: servico!.duracao,
        valor: servico!.preco,
        status: "agendado",
        observacoes: observacoes || null,
        formaPagamento: formaPagamento || null,
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

    console.log("✅ Agendamento criado com sucesso:", agendamento.id);

    // TODO: Aqui enviar emails de confirmação e notificações
    // - Email para o cliente
    // - Email/notificação para o dono

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
        formaPagamento,
        cliente: agendamento.cliente,
        servico: agendamento.servico,
        empresa: agendamento.empresa,
        createdAt: agendamento.createdAt.toISOString(),
      },
      message: "Agendamento criado com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
