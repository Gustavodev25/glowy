import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatarEndereco, processarEnderecoDoBanco } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;

    console.log(`[API Empresa Individual] Buscando empresa com ID: ${empresaId}`);

    // Buscar empresa na tabela antiga (Empresa)
    let empresa = await prisma.empresa.findUnique({
      where: {
        id: empresaId,
        ativo: true
      },
      include: {
        servicos: {
          where: { ativo: true },
          select: {
            id: true,
            nome: true,
            descricao: true,
            duracao: true,
            preco: true,
            imageUrl: true,
            ativo: true,
          },
        },
        dono: {
          select: {
            nome: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Se não encontrou na tabela antiga, buscar na tabela CompanySettings
    if (!empresa) {
      console.log(`[API Empresa Individual] Empresa não encontrada na tabela antiga, buscando em CompanySettings`);

      // Buscar por ID que comece com "cs-" ou buscar por empresa vinculada
      const companySetting = await prisma.companySettings.findFirst({
        where: {
          OR: [
            { id: empresaId.replace('cs-', '') },
            {
              user: {
                empresas: {
                  some: {
                    id: empresaId,
                    ativo: true,
                  },
                },
              },
            },
          ],
        },
        include: {
          services: {
            where: { active: true },
            select: {
              id: true,
              name: true,
              description: true,
              duration: true,
              price: true,
              imageUrl: true,
              active: true,
            },
          },
          user: {
            select: {
              id: true,
              nome: true,
              email: true,
              avatarUrl: true,
              empresas: {
                where: { ativo: true },
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
          },
        },
      });

      if (companySetting) {
        const empresaVinculada = companySetting.user.empresas[0];
        const empresaIdReal = empresaVinculada?.id || `cs-${companySetting.id}`;

        // Buscar horários de funcionamento do banco de dados
        const businessHours = await prisma.businessHours.findMany({
          where: {
            companyId: companySetting.id,
          },
          orderBy: {
            dayOfWeek: 'asc',
          },
        });

        // Buscar avaliações
        const avaliacoes = await prisma.avaliacao.aggregate({
          where: {
            empresaId: empresaIdReal,
            ativo: true,
          },
          _avg: {
            nota: true,
          },
          _count: {
            nota: true,
          },
        });

        const avaliacaoMedia = avaliacoes._avg.nota || 0;
        const totalAvaliacoes = avaliacoes._count.nota || 0;

        // Buscar avaliações individuais
        const avaliacoesDetalhadas = await prisma.avaliacao.findMany({
          where: {
            empresaId: empresaIdReal,
            ativo: true,
          },
          include: {
            cliente: {
              select: {
                nome: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        });

        // Formatar horários detalhados para o frontend
        const horariosDetalhados = businessHours.map(bh => ({
          dia: bh.dayOfWeek,
          aberto: bh.isOpen,
          abertura: bh.openTime,
          fechamento: bh.closeTime,
          intervaloInicio: bh.breakStart || undefined,
          intervaloFim: bh.breakEnd || undefined,
        }));

        const empresaFormatada = {
          id: empresaIdReal,
          nome: companySetting.companyName,
          logo: companySetting.logoUrl || empresaVinculada?.logoUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
          banner: companySetting.bannerUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=200&fit=crop',
          biografia: companySetting.description || `${companySetting.companyName} - ${companySetting.businessType}`,
          avaliacao: Math.round(avaliacaoMedia * 100) / 100,
          totalAvaliacoes,
          endereco: processarEnderecoDoBanco(companySetting.address),
          telefone: companySetting.phone || empresaVinculada?.telefone || '',
          email: empresaVinculada?.email || companySetting.user.email,
          horario: businessHours.length > 0 ? 'Ver horários detalhados' : 'Seg-Sex: 8h-18h',
          horariosDetalhados,
          servicos: companySetting.services.map(servico => ({
            id: servico.id,
            nome: servico.name,
            descricao: servico.description || '',
            preco: parseFloat(servico.price?.toString() || '0'),
            duracao: servico.duration || '30 min',
            imagem: servico.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
          })),
          avaliacoes: avaliacoesDetalhadas.map(av => ({
            id: av.id,
            nome: av.cliente.nome,
            avatar: av.cliente.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
            nota: av.nota,
            comentario: av.comentario || '',
            data: av.dataAvaliacao.toLocaleDateString('pt-BR'),
          })),
        };

        console.log(`[API Empresa Individual] Empresa encontrada em CompanySettings: ${companySetting.companyName}`);
        return NextResponse.json({
          success: true,
          empresa: empresaFormatada,
          servicos: empresaFormatada.servicos,
          avaliacoes: empresaFormatada.avaliacoes,
        });
      }
    }

    // Se encontrou na tabela antiga, formatar os dados
    if (empresa) {
      // Buscar horários de funcionamento (se houver CompanySettings vinculado)
      const companySettings = await prisma.companySettings.findUnique({
        where: {
          userId: empresa.donoId,
        },
        include: {
          businessHours: {
            orderBy: {
              dayOfWeek: 'asc',
            },
          },
        },
      });

      // Buscar avaliações
      const avaliacoes = await prisma.avaliacao.aggregate({
        where: {
          empresaId: empresa.id,
          ativo: true,
        },
        _avg: {
          nota: true,
        },
        _count: {
          nota: true,
        },
      });

      const avaliacaoMedia = avaliacoes._avg.nota || 0;
      const totalAvaliacoes = avaliacoes._count.nota || 0;

      // Buscar avaliações individuais
      const avaliacoesDetalhadas = await prisma.avaliacao.findMany({
        where: {
          empresaId: empresa.id,
          ativo: true,
        },
        include: {
          cliente: {
            select: {
              nome: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      // Formatar horários detalhados para o frontend
      const horariosDetalhados = companySettings?.businessHours?.map(bh => ({
        dia: bh.dayOfWeek,
        aberto: bh.isOpen,
        abertura: bh.openTime,
        fechamento: bh.closeTime,
        intervaloInicio: bh.breakStart || undefined,
        intervaloFim: bh.breakEnd || undefined,
      })) || [];

      const empresaFormatada = {
        id: empresa.id,
        nome: empresa.nomeFantasia || empresa.nomeEmpresa,
        logo: empresa.logoUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
        banner: empresa.bannerUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=200&fit=crop',
        biografia: empresa.descricao || 'Sem descrição disponível',
        avaliacao: Math.round(avaliacaoMedia * 100) / 100,
        totalAvaliacoes,
        endereco: formatarEndereco({
          logradouro: empresa.logradouro,
          numero: empresa.numero,
          bairro: empresa.bairro,
          localidade: empresa.cidade,
          uf: empresa.estado
        }),
        telefone: empresa.telefone,
        email: empresa.email,
        horario: horariosDetalhados.length > 0 ? 'Ver horários detalhados' : 'Seg-Sex: 8h-18h, Sáb: 8h-14h',
        horariosDetalhados,
        servicos: empresa.servicos.map(servico => ({
          id: servico.id,
          nome: servico.nome,
          descricao: servico.descricao || '',
          preco: parseFloat(servico.preco.toString()),
          duracao: servico.duracao || '30 min',
          imagem: servico.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
        })),
        avaliacoes: avaliacoesDetalhadas.map(av => ({
          id: av.id,
          nome: av.cliente.nome,
          avatar: av.cliente.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          nota: av.nota,
          comentario: av.comentario || '',
          data: av.dataAvaliacao.toLocaleDateString('pt-BR'),
        })),
      };

      console.log(`[API Empresa Individual] Empresa encontrada na tabela antiga: ${empresa.nomeEmpresa}`);
      return NextResponse.json({
        success: true,
        empresa: empresaFormatada,
        servicos: empresaFormatada.servicos,
        avaliacoes: empresaFormatada.avaliacoes,
      });
    }

    // Se não encontrou em nenhuma tabela
    console.log(`[API Empresa Individual] Empresa não encontrada: ${empresaId}`);
    return NextResponse.json(
      {
        success: false,
        error: "Empresa não encontrada"
      },
      { status: 404 }
    );

  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor"
      },
      { status: 500 }
    );
  }
}