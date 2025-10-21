import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    
    if (!auth.authenticated) {
      return auth.response!;
    }

    const userId = auth.user.id;

    // Reseta o onboarding do usuário
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: false },
    });

    console.log("🔄 Onboarding resetado para usuário:", userId);

    return NextResponse.json({ success: true, message: "Onboarding resetado com sucesso" });
  } catch (error) {
    console.error("Erro ao resetar onboarding:", error);
    return NextResponse.json({ error: "Erro ao resetar onboarding" }, { status: 500 });
  }
}
