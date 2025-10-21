import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary-server";
import { requireDono } from "@/middleware/auth";

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação e permissão de dono
    const auth = await requireDono(req);

    if (!auth.authorized) {
      return auth.response!;
    }

    const userId = auth.user.id;

    // Buscar dados do body
    const body = await req.json();
    const {
      tipoDocumento,
      documento,
      razaoSocial,
      nomeFantasia,
      nomeEmpresa,
      descricao,
      telefone,
      email,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      enderecoCompleto,
      logoBase64, // Imagem em base64
    } = body;

    // Validações básicas
    if (!tipoDocumento || !documento || !nomeEmpresa || !telefone || !email) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 },
      );
    }

    if (!cep || !logradouro || !numero || !bairro || !cidade || !estado) {
      return NextResponse.json(
        { error: "Endereço incompleto" },
        { status: 400 },
      );
    }

    // Verificar se já existe empresa para este usuário
    const empresaExistente = await prisma.empresa.findFirst({
      where: { donoId: userId },
    });

    if (empresaExistente) {
      return NextResponse.json(
        { error: "Usuário já possui uma empresa cadastrada" },
        { status: 400 },
      );
    }

    // Verificar se documento já está em uso
    const documentoExistente = await prisma.empresa.findUnique({
      where: { documento },
    });

    if (documentoExistente) {
      return NextResponse.json(
        { error: "Este CNPJ/CPF já está cadastrado" },
        { status: 400 },
      );
    }

    // Upload da logo para Cloudinary (se fornecida)
    let logoUrl = null;
    let logoPublicId = null;

    if (logoBase64) {
      try {
        const uploadResult = await uploadImage(logoBase64, "empresas/logos");
        logoUrl = uploadResult.url;
        logoPublicId = uploadResult.publicId;
      } catch (error) {
        console.error("Erro ao fazer upload da logo:", error);
        // Continua mesmo se o upload falhar
      }
    }

    // Criar empresa
    const empresa = await prisma.empresa.create({
      data: {
        donoId: userId,
        tipoDocumento,
        documento,
        razaoSocial,
        nomeFantasia,
        nomeEmpresa,
        descricao,
        telefone,
        email,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        enderecoCompleto:
          enderecoCompleto ||
          `${logradouro}, ${numero}, ${bairro}, ${cidade} - ${estado}`,
        logoUrl,
        logoPublicId,
        ativo: true,
      },
    });

    return NextResponse.json({
      success: true,
      empresa: {
        id: empresa.id,
        nomeEmpresa: empresa.nomeEmpresa,
        logoUrl: empresa.logoUrl,
      },
    });
  } catch (error: any) {
    console.error("Erro ao configurar empresa:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao configurar empresa" },
      { status: 500 },
    );
  }
}
