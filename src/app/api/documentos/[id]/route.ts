import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params;

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

    const documento = await prisma.documento.findUnique({
      where: { id: id },
      include: {
        cliente: true,
        agendamento: true,
      },
    });

    if (!documento || documento.empresaId !== empresa.id) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ documento });
  } catch (error) {
    console.error("Erro ao buscar documento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar documento" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params;

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

    const documento = await prisma.documento.findUnique({
      where: { id: id },
    });

    if (!documento || documento.empresaId !== empresa.id) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 },
      );
    }

    // TODO: Se usar Cloudinary, deletar arquivo do Cloudinary aqui

    await prisma.documento.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir documento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir documento" },
      { status: 500 },
    );
  }
}
