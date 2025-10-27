import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.authenticated) {
      return auth.response!;
    }

    const userId = auth.user.id;

    // Buscar dados do usuário com suas empresas e funcionários
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        empresas: true,
        funcionarios: {
          include: {
            empresa: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Determinar a empresa (dono tem empresas[], funcionário tem funcionarios[]). Se dono não tiver, cria uma.
    let empresaId: string | null = null;
    if (user.tipoUsuario === 'dono') {
      if (user.empresas.length > 0) {
        empresaId = user.empresas[0].id;
      } else {
        const created = await prisma.empresa.create({
          data: {
            donoId: user.id,
            tipoDocumento: 'CNPJ',
            documento: `TEMP-${user.id}`,
            nomeEmpresa: user.nome || 'Minha Empresa',
            nomeFantasia: user.nome || 'Minha Empresa',
            telefone: '(00) 00000-0000',
            email: user.email,
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
        });
        empresaId = created.id;
      }
    } else if (user.funcionarios.length > 0) {
      empresaId = user.funcionarios[0].empresaId;
    }

    if (!empresaId) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Buscar todos os serviços da empresa
    const servicos = await prisma.servico.findMany({
      where: {
        empresaId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nome: true,
        descricao: true,
        duracao: true,
        preco: true,
        imageUrl: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      services: servicos.map(servico => ({
        id: servico.id,
        name: servico.nome,
        description: servico.descricao,
        duration: servico.duracao,
        price: servico.preco ? Number(servico.preco) : null,
        imageUrl: servico.imageUrl,
        active: servico.ativo,
        createdAt: servico.createdAt,
        updatedAt: servico.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.authenticated) {
      return auth.response!;
    }

    const userId = auth.user.id;
    const body = await request.json();
    const { name, description, duration, price, imageUrl, active } = body;

    // Validar dados obrigatórios
    if (!name || !duration) {
      return NextResponse.json(
        { error: "Nome e duração são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar dados do usuário com suas empresas e funcionários
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        empresas: true,
        funcionarios: {
          include: {
            empresa: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Determinar a empresa (dono tem empresas[], funcionário tem funcionarios[])
    let empresaId: string;
    if (user.tipoUsuario === 'dono' && user.empresas.length > 0) {
      empresaId = user.empresas[0].id;
    } else if (user.funcionarios.length > 0) {
      empresaId = user.funcionarios[0].empresaId;
    } else {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Criar novo serviço
    const servico = await prisma.servico.create({
      data: {
        empresaId,
        nome: name,
        descricao: description || null,
        duracao: parseInt(duration),
        preco: price ? parseFloat(price) : 0,
        imageUrl: imageUrl || null,
        ativo: active !== undefined ? active : true,
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        duracao: true,
        preco: true,
        imageUrl: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      service: {
        id: servico.id,
        name: servico.nome,
        description: servico.descricao,
        duration: servico.duracao,
        price: servico.preco ? Number(servico.preco) : null,
        imageUrl: servico.imageUrl,
        active: servico.ativo,
        createdAt: servico.createdAt,
        updatedAt: servico.updatedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
