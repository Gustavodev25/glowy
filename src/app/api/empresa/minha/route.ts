// app/api/empresa/minha/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDono } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireDono(request);

    if (!auth.authorized) {
      return auth.response!;
    }

    const empresa = await prisma.empresa.findFirst({
      where: { donoId: auth.user.id },
      include: {
        _count: {
          select: {
            servicos: true,
            funcionarios: true,
          },
        },
      },
    });

    if (!empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ empresa });
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
