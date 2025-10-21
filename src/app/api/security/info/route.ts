import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

// GET - Informações gerais de segurança
export async function GET(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const userData = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        lastPasswordChange: true,
        twoFactorEnabled: true,
        recoveryEmail: true,
        recoveryEmailVerified: true,
        _count: {
          select: {
            securityQuestions: true,
            sessions: true,
          },
        },
      },
    });

    // Calcular nível de segurança (0-100)
    let securityLevel = 0;
    const factors = [];

    // Senha alterada recentemente (20 pontos)
    if (userData?.lastPasswordChange) {
      const daysSinceChange = Math.floor(
        (Date.now() - new Date(userData.lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceChange < 90) {
        securityLevel += 20;
        factors.push({ name: "Senha recente", status: "good" });
      } else {
        factors.push({ name: "Senha antiga", status: "warning" });
      }
    } else {
      factors.push({ name: "Senha nunca alterada", status: "bad" });
    }

    // 2FA ativado (30 pontos)
    if (userData?.twoFactorEnabled) {
      securityLevel += 30;
      factors.push({ name: "2FA ativado", status: "good" });
    } else {
      factors.push({ name: "2FA desativado", status: "bad" });
    }

    // Email de recuperação configurado (25 pontos)
    if (userData?.recoveryEmail) {
      if (userData.recoveryEmailVerified) {
        securityLevel += 25;
        factors.push({ name: "Email de recuperação verificado", status: "good" });
      } else {
        securityLevel += 15;
        factors.push({ name: "Email de recuperação não verificado", status: "warning" });
      }
    } else {
      factors.push({ name: "Email de recuperação não configurado", status: "bad" });
    }

    // Perguntas de segurança (25 pontos - proporcional)
    const questionCount = userData?._count.securityQuestions || 0;
    const questionPoints = (questionCount / 3) * 25;
    securityLevel += questionPoints;
    if (questionCount === 3) {
      factors.push({ name: "Perguntas de segurança completas", status: "good" });
    } else if (questionCount > 0) {
      factors.push({ name: `${questionCount}/3 perguntas configuradas`, status: "warning" });
    } else {
      factors.push({ name: "Perguntas de segurança não configuradas", status: "bad" });
    }

    // Determinar nível
    let level: "baixo" | "medio" | "alto" = "baixo";
    if (securityLevel >= 75) level = "alto";
    else if (securityLevel >= 50) level = "medio";

    return NextResponse.json({
      securityLevel: Math.round(securityLevel),
      level,
      factors,
      lastPasswordChange: userData?.lastPasswordChange,
      twoFactorEnabled: userData?.twoFactorEnabled,
      recoveryEmail: userData?.recoveryEmail,
      recoveryEmailVerified: userData?.recoveryEmailVerified,
      securityQuestionsCount: questionCount,
      activeSessions: userData?._count.sessions || 0,
    });
  } catch (error) {
    console.error("Erro ao buscar informações de segurança:", error);
    return NextResponse.json(
      { error: "Erro ao buscar informações" },
      { status: 500 }
    );
  }
}
