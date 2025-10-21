// app/api/auth/me/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.authenticated) {
      return auth.response!;
    }

    // Buscar dados completos do usuário
    const user: any = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipoUsuario: true,
        isAdmin: true,
        avatarUrl: true,
        createdAt: true,
        lastLoginAt: true,
        ativo: true,
        onboardingCompleted: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    // Se for dono, buscar dados da empresa
    let empresa = null;
    if (user.tipoUsuario === "dono") {
      empresa = await prisma.empresa.findFirst({
        where: { donoId: user.id },
        select: {
          id: true,
          nomeEmpresa: true,
          logoUrl: true,
          ativo: true,
        },
      });
    }

    return NextResponse.json({
      user: {
        ...user,
        empresa,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
