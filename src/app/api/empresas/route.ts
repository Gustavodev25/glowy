import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processarEnderecoDoBanco, formatarEndereco } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoria = searchParams.get('categoria');
    const search = searchParams.get('search');
    const minPreco = searchParams.get('minPreco');
    const maxPreco = searchParams.get('maxPreco');

    console.log('[API Empresas] Parâmetros recebidos:', { categoria, search, minPreco, maxPreco });

    // Buscar empresas ativas da tabela Empresa (sistema antigo)
    const empresasAntigas = await prisma.empresa.findMany({
      where: {
        ativo: true,
        donoId: { not: null }, // Apenas empresas com dono válido
        // Se houver busca por texto
        ...(search && {
          OR: [
            { nomeEmpresa: { contains: search, mode: 'insensitive' } },
            { nomeFantasia: { contains: search, mode: 'insensitive' } },
            { descricao: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        servicos: {
          where: {
            ativo: true,
            // Filtro de preço nos serviços
            ...(minPreco && { preco: { gte: parseFloat(minPreco) } }),
            ...(maxPreco && { preco: { lte: parseFloat(maxPreco) } }),
          },
          select: {
            id: true,
            nome: true,
            descricao: true,
            duracao: true,
            preco: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Buscar empresas da tabela CompanySettings (sistema novo - onboarding)
    const companySettings = await prisma.companySettings.findMany({
      where: {
        ...(search && {
          companyName: { contains: search, mode: 'insensitive' },
        }),
      },
      include: {
        services: {
          where: {
            active: true,
            // Filtro de preço nos serviços
            ...(minPreco && maxPreco && {
              price: {
                gte: parseFloat(minPreco),
                lte: parseFloat(maxPreco),
              },
            }),
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

    console.log(`[API Empresas] ✅ Encontradas: ${empresasAntigas.length} empresas antigas + ${companySettings.length} company settings`);
    
    if (empresasAntigas.length === 0 && companySettings.length === 0) {
      console.log('[API Empresas] ⚠️ NENHUMA EMPRESA ATIVA ENCONTRADA NO BANCO!');
    }

    // Transformar empresas antigas
    const empresasAntigasFormatadas = await Promise.all(empresasAntigas.map(async (empresa) => {
      const servicosAtivos = empresa.servicos;
      const precos = servicosAtivos.map((s) => parseFloat(s.preco.toString()));
      const precoMinimo = precos.length > 0 ? Math.min(...precos) : 0;

      // Buscar avaliações reais da empresa
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

      console.log(`[API Empresas] Empresa antiga: ${empresa.nomeEmpresa}, Serviços ativos: ${servicosAtivos.length}, Avaliações: ${totalAvaliacoes}`);

      return {
        id: empresa.id,
        nome: empresa.nomeFantasia || empresa.nomeEmpresa,
        logo: empresa.logoUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
        categoria: empresa.tipoDocumento === 'CNPJ' ? 'empresa' : 'profissional',
        descricao: empresa.descricao || 'Sem descrição disponível',
        endereco: formatarEndereco({
          logradouro: empresa.logradouro,
          numero: empresa.numero,
          bairro: empresa.bairro,
          localidade: empresa.cidade,
          uf: empresa.estado
        }),
        enderecoCompleto: empresa.enderecoCompleto || formatarEndereco({
          logradouro: empresa.logradouro,
          numero: empresa.numero,
          bairro: empresa.bairro,
          localidade: empresa.cidade,
          uf: empresa.estado
        }),
        telefone: empresa.telefone,
        email: empresa.email,
        cep: empresa.cep,
        precoMinimo,
        totalServicos: servicosAtivos.length,
        avaliacao: Math.round(avaliacaoMedia * 100) / 100,
        totalAvaliacoes,
        verificado: true,
        destaque: servicosAtivos.length >= 3,
        novo: new Date(empresa.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000,
      };
    }));

    // Transformar company settings em formato de empresas
    const empresasNovasFormatadas = await Promise.all(companySettings.map(async (cs) => {
      const servicosAtivos = cs.services;
      const precos = servicosAtivos.map((s) => s.price ? parseFloat(s.price.toString()) : 0).filter(p => p > 0);
      const precoMinimo = precos.length > 0 ? Math.min(...precos) : 0;

      // Pegar a primeira empresa do usuário, se existir
      const empresaVinculada = cs.user.empresas[0];
      const empresaId = empresaVinculada?.id || `cs-${cs.id}`;

      // Buscar avaliações reais da empresa
      const avaliacoes = await prisma.avaliacao.aggregate({
        where: {
          empresaId,
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

      console.log(`[API Empresas] Company Setting: ${cs.companyName}, Serviços ativos: ${servicosAtivos.length}, Avaliações: ${totalAvaliacoes}`);

      return {
        id: empresaId,
        nome: cs.companyName,
        logo: cs.logoUrl || empresaVinculada?.logoUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
        categoria: cs.businessType || 'servicos',
        descricao: `${cs.companyName} - ${cs.businessType}`,
        endereco: processarEnderecoDoBanco(cs.address),
        enderecoCompleto: empresaVinculada?.enderecoCompleto || processarEnderecoDoBanco(cs.address),
        telefone: cs.phone || empresaVinculada?.telefone || '',
        email: empresaVinculada?.email || cs.user.email,
        cep: empresaVinculada?.cep || '',
        precoMinimo,
        totalServicos: servicosAtivos.length,
        avaliacao: Math.round(avaliacaoMedia * 100) / 100,
        totalAvaliacoes,
        verificado: true,
        destaque: servicosAtivos.length >= 2,
        novo: new Date(cs.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000,
      };
    }));

    // Unificar todas as empresas e remover duplicatas por ID
    const todasEmpresas = [...empresasAntigasFormatadas, ...empresasNovasFormatadas];
    const empresasUnicas = todasEmpresas.filter((empresa, index, self) =>
      index === self.findIndex(e => e.id === empresa.id)
    );

    console.log(`[API Empresas] Retornando ${empresasUnicas.length} empresas únicas (${todasEmpresas.length - empresasUnicas.length} duplicatas removidas)`);

    return NextResponse.json({
      success: true,
      empresas: empresasUnicas,
      total: empresasUnicas.length,
    });
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar empresas' },
      { status: 500 }
    );
  }
}
