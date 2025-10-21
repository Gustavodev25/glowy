import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

// GET - Histórico de login do usuário
export async function GET(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const loginHistory = await prisma.loginHistory.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ loginHistory });
  } catch (error) {
    console.error("Erro ao buscar histórico de login:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 }
    );
  }
}
