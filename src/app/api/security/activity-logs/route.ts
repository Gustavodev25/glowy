import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

// GET - Listar logs de atividades
export async function GET(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const activityLogs = await prisma.activityLog.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ activityLogs });
  } catch (error) {
    console.error("Erro ao buscar logs de atividades:", error);
    return NextResponse.json(
      { error: "Erro ao buscar logs" },
      { status: 500 }
    );
  }
}
