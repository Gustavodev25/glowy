import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    
    if (!auth.authenticated) {
      console.log("❌ Usuário não autenticado");
      return auth.response!;
    }

    const userId = auth.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        onboardingCompleted: true,
        tipoUsuario: true,
        companySettings: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      console.log("❌ Usuário não encontrado");
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const hasCompanySettings = !!user.companySettings;
    const needsOnboarding = user.tipoUsuario === "dono" && !user.onboardingCompleted;

    console.log("📊 Status do Onboarding:", {
      userId: user.id,
      tipoUsuario: user.tipoUsuario,
      onboardingCompleted: user.onboardingCompleted,
      hasCompanySettings,
      needsOnboarding,
    });

    return NextResponse.json({
      onboardingCompleted: user.onboardingCompleted,
      needsOnboarding,
      hasCompanySettings,
    });
  } catch (error) {
    console.error("❌ Erro ao verificar status:", error);
    return NextResponse.json({ error: "Erro ao verificar status" }, { status: 500 });
  }
}
