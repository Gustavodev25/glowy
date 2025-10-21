import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

// GET - Listar sessões ativas do usuário
export async function GET(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: auth.user.id,
        expiresAt: { gte: new Date() },
      },
      orderBy: { lastActivity: "desc" },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Erro ao buscar sessões:", error);
    return NextResponse.json(
      { error: "Erro ao buscar sessões" },
      { status: 500 }
    );
  }
}

// DELETE - Encerrar sessão(ões)
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const { sessionId, allExceptCurrent } = await req.json();
    const currentToken = req.cookies.get("auth")?.value;

    if (allExceptCurrent) {
      // Encerrar todas as sessões exceto a atual
      await prisma.session.deleteMany({
        where: {
          userId: auth.user.id,
          ...(currentToken && { token: { not: currentToken } }),
        },
      });
    } else if (sessionId) {
      // Encerrar sessão específica
      await prisma.session.delete({
        where: { id: sessionId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao encerrar sessão:", error);
    return NextResponse.json(
      { error: "Erro ao encerrar sessão" },
      { status: 500 }
    );
  }
}
