import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar a empresa do usuário
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        empresas: true,
        funcionarios: {
          include: {
            empresa: true,
          },
        },
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Determinar a empresa (dono tem empresas[], funcionário tem funcionarios[])
    let empresaId: string | null = null;
    if (currentUser.tipoUsuario === 'dono') {
      if (currentUser.empresas.length > 0) {
        empresaId = currentUser.empresas[0].id;
      } else {
        // Criar empresa padrão para donos sem empresa
        const created = await prisma.empresa.create({
          data: {
            donoId: currentUser.id,
            tipoDocumento: 'CNPJ',
            documento: `TEMP-${currentUser.id}`,
            nomeEmpresa: currentUser.nome || 'Minha Empresa',
            nomeFantasia: currentUser.nome || 'Minha Empresa',
            telefone: '(00) 00000-0000',
            email: currentUser.email,
            cep: '00000-000',
            logradouro: 'Endereço não informado',
            numero: 'S/N',
            bairro: 'Centro',
            cidade: 'Cidade',
            estado: 'UF',
            enderecoCompleto: 'Configure o endereço da sua empresa nas configurações',
            ativo: true,
          },
          select: { id: true },
        })
        empresaId = created.id
      }
    } else if (currentUser.funcionarios.length > 0) {
      empresaId = currentUser.funcionarios[0].empresaId;
    }

    if (!empresaId) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    // Buscar todos os funcionários ativos da empresa
    let funcionarios: any[] = []
    let temRelacaoServicos = true
    try {
      const allFuncionarios = await prisma.funcionario.findMany({
        where: {
          empresaId,
          ativo: true,
        },
        include: {
          user: {
            select: {
              id: true,
              nome: true,
              email: true,
              avatarUrl: true,
              tipoUsuario: true,
            },
          },
          servicos: {
            include: {
              servico: {
                select: { id: true, nome: true },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      // Filtrar apenas funcionários com usuário válido
      funcionarios = allFuncionarios.filter(f => f.user !== null);
    } catch (e: any) {
      // Se a tabela de relação ainda não existe, faz fallback sem incluir serviços
      if (e?.code === 'P2021') {
        temRelacaoServicos = false
        const allFuncionarios = await prisma.funcionario.findMany({
          where: {
            empresaId,
            ativo: true,
          },
          include: {
            user: {
              select: { id: true, nome: true, email: true, avatarUrl: true, tipoUsuario: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        })
        // Filtrar apenas funcionários com usuário válido
        funcionarios = allFuncionarios.filter(f => f.user !== null);
      } else {
        throw e
      }
    }

    // Buscar todos os convites da empresa
    const convites = await prisma.convite.findMany({
      where: {
        empresaId,
      },
      include: {
        convidadoPor: {
          select: {
            nome: true,
            email: true,
          },
        },
        convidado: {
          select: {
            id: true,
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

    // Mapear funcionários para o formato da resposta
    const membros = funcionarios.map((func) => ({
      id: func.user.id,
      nome: func.user.nome,
      email: func.user.email,
      avatarUrl: func.user.avatarUrl,
      cargo: func.cargo,
      salario: func.salario,
      ativo: func.ativo,
      tipoUsuario: func.user.tipoUsuario,
      dataAdmissao: func.createdAt.toISOString(),
      tipo: 'membro' as const,
      servicos: temRelacaoServicos && func.servicos
        ? func.servicos.map((fs: any) => ({ id: fs.servico.id, nome: fs.servico.nome }))
        : [],
    }));

    // Mapear convites para o formato da resposta
    const convitesFormatados = convites.map((conv) => {
      // Verificar se o convite expirou
      const now = new Date();
      const isExpired = conv.expiresAt && new Date(conv.expiresAt) < now;

      // Determinar o status real
      let statusReal = conv.status;
      if (statusReal === 'PENDING' && isExpired) {
        statusReal = 'EXPIRED';
      }

      return {
        id: conv.id,
        email: conv.email,
        nome: conv.convidado?.nome || null,
        avatarUrl: conv.convidado?.avatarUrl || null,
        status: statusReal,
        mensagem: conv.mensagem,
        convidadoPor: conv.convidadoPor.nome,
        createdAt: conv.createdAt.toISOString(),
        acceptedAt: conv.acceptedAt?.toISOString() || null,
        expiresAt: conv.expiresAt?.toISOString() || null,
        tipo: 'convite' as const,
      };
    });

    // Combinar membros e convites não aceitos
    const equipe = [
      ...membros,
      ...convitesFormatados.filter((c) => c.status !== 'ACCEPTED'),
    ];

    return NextResponse.json({
      equipe,
      estatisticas: {
        totalMembros: membros.length,
        convitesPendentes: convitesFormatados.filter((c) => c.status === 'PENDING').length,
        convitesExpirados: convitesFormatados.filter((c) => c.status === 'EXPIRED').length,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar equipe:', error);
    return NextResponse.json({ error: 'Erro ao buscar equipe' }, { status: 500 });
  }
}
