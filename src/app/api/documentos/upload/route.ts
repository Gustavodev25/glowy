import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar empresa do usuário
    const empresa = await prisma.empresa.findFirst({
      where: { donoId: user.userId },
    });

    if (!empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tipo = formData.get("tipo") as string;
    const descricao = formData.get("descricao") as string | null;
    const clienteId = formData.get("clienteId") as string | null;
    const agendamentoId = formData.get("agendamentoId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não fornecido" },
        { status: 400 },
      );
    }

    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Tamanho máximo: 10MB" },
        { status: 400 },
      );
    }

    // Converter arquivo para base64 (solução temporária - ideal seria usar Cloudinary)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Criar documento no banco
    const documento = await prisma.documento.create({
      data: {
        empresaId: empresa.id,
        clienteId: clienteId,
        agendamentoId: agendamentoId,
        tipo: tipo || "documento",
        nome: file.name,
        descricao: descricao || undefined,
        url: dataUrl, // Em produção, usar URL do Cloudinary
        tamanho: file.size,
        mimeType: file.type,
        uploadedBy: user.userId,
      },
    });

    return NextResponse.json({ documento }, { status: 201 });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do documento" },
      { status: 500 },
    );
  }
}
