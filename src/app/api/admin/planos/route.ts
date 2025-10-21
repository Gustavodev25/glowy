import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";
import { uploadImage, deleteImage } from "@/lib/cloudinary-server";

// GET - Listar todos os planos
export async function GET(request: NextRequest) {
  try {
    const planos = await prisma.plan.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(planos);
  } catch (error) {
    console.error("Erro ao buscar planos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

// POST - Criar novo plano
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const nome = formData.get("nome") as string;
    const descricao = formData.get("descricao") as string;
    const preco = formData.get("preco") as string;
    const intervalo = formData.get("intervalo") as string;
    const funcionalidades = JSON.parse(
      formData.get("funcionalidades") as string,
    );
    const maxProfissionais = parseInt(
      formData.get("maxProfissionais") as string,
    );
    const maxClientes = parseInt(formData.get("maxClientes") as string);
    const maxAgendamentosMes = parseInt(
      formData.get("maxAgendamentosMes") as string,
    );
    const permiteMultiEmpresa = formData.get("permiteMultiEmpresa") === "true";
    const permiteRelatorios = formData.get("permiteRelatorios") === "true";
    const permiteIntegracoes = formData.get("permiteIntegracoes") === "true";
    const permiteWhatsapp = formData.get("permiteWhatsapp") === "true";
    const permiteSms = formData.get("permiteSms") === "true";
    const permiteAgendaOnline = formData.get("permiteAgendaOnline") === "true";
    const permitePersonalizacao =
      formData.get("permitePersonalizacao") === "true";
    const recommended = formData.get("recommended") === "true";

    // Validações
    if (!nome || !descricao || !preco || !intervalo) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 },
      );
    }

    // Criar plano
    const plano = await prisma.plan.create({
      data: {
        name: nome,
        description: descricao,
        price: parseFloat(preco),
        interval: intervalo,
        features: funcionalidades,
        maxProfissionais,
        maxClientes,
        maxAgendamentosMes,
        permiteMultiEmpresa,
        permiteRelatorios,
        permiteIntegracoes,
        permiteWhatsapp,
        permiteSms,
        permiteAgendaOnline,
        permitePersonalizacao,
        recommended,
        active: true,
      },
    });

    return NextResponse.json(
      {
        message: "Plano criado com sucesso",
        plano,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar plano:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

// PUT - Atualizar plano
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();

    const id = formData.get("id") as string;
    const nome = formData.get("nome") as string;
    const descricao = formData.get("descricao") as string;
    const preco = formData.get("preco") as string;
    const intervalo = formData.get("intervalo") as string;
    const funcionalidades = JSON.parse(
      formData.get("funcionalidades") as string,
    );
    const maxProfissionais = parseInt(
      formData.get("maxProfissionais") as string,
    );
    const maxClientes = parseInt(formData.get("maxClientes") as string);
    const maxAgendamentosMes = parseInt(
      formData.get("maxAgendamentosMes") as string,
    );
    const permiteMultiEmpresa = formData.get("permiteMultiEmpresa") === "true";
    const permiteRelatorios = formData.get("permiteRelatorios") === "true";
    const permiteIntegracoes = formData.get("permiteIntegracoes") === "true";
    const permiteWhatsapp = formData.get("permiteWhatsapp") === "true";
    const permiteSms = formData.get("permiteSms") === "true";
    const permiteAgendaOnline = formData.get("permiteAgendaOnline") === "true";
    const permitePersonalizacao =
      formData.get("permitePersonalizacao") === "true";
    const recommended = formData.get("recommended") === "true";

    // Validações
    if (!id || !nome || !descricao || !preco || !intervalo) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 },
      );
    }

    // Buscar plano existente
    const planoExistente = await prisma.plan.findUnique({
      where: { id },
    });

    if (!planoExistente) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 },
      );
    }

    // Atualizar plano
    const plano = await prisma.plan.update({
      where: { id },
      data: {
        name: nome,
        description: descricao,
        price: parseFloat(preco),
        interval: intervalo,
        features: funcionalidades,
        maxProfissionais,
        maxClientes,
        maxAgendamentosMes,
        permiteMultiEmpresa,
        permiteRelatorios,
        permiteIntegracoes,
        permiteWhatsapp,
        permiteSms,
        permiteAgendaOnline,
        permitePersonalizacao,
        recommended,
      },
    });

    return NextResponse.json({
      message: "Plano atualizado com sucesso",
      plano,
    });
  } catch (error) {
    console.error("Erro ao atualizar plano:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

// DELETE - Deletar plano
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do plano não fornecido" },
        { status: 400 },
      );
    }

    // Buscar plano
    const plano = await prisma.plan.findUnique({
      where: { id },
    });

    if (!plano) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 },
      );
    }

    // Deletar plano
    await prisma.plan.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Plano deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar plano:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}