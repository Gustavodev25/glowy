import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

// GET - Obter email de recuperação
export async function GET(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const userData = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        recoveryEmail: true,
        recoveryEmailVerified: true,
      },
    });

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Erro ao buscar email de recuperação:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}

// POST - Configurar/Atualizar email de recuperação
export async function POST(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const { recoveryEmail } = await req.json();

    if (!recoveryEmail || !recoveryEmail.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Atualizar email de recuperação (não verificado inicialmente)
    await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        recoveryEmail,
        recoveryEmailVerified: false,
      },
    });

    // TODO: Enviar email de verificação

    // Registrar log de atividade
    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "recovery_email_added",
        description: `Email de recuperação configurado: ${recoveryEmail}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email de recuperação configurado. Verifique seu email.",
    });
  } catch (error) {
    console.error("Erro ao configurar email de recuperação:", error);
    return NextResponse.json(
      { error: "Erro ao configurar email" },
      { status: 500 }
    );
  }
}

// DELETE - Remover email de recuperação
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authenticated) {
      return auth.response!;
    }

    await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        recoveryEmail: null,
        recoveryEmailVerified: false,
      },
    });

    // Registrar log de atividade
    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "recovery_email_removed",
        description: "Email de recuperação removido",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover email de recuperação:", error);
    return NextResponse.json(
      { error: "Erro ao remover email" },
      { status: 500 }
    );
  }
}
