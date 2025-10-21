import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";
import { verifyPassword, hashPassword, getClientIp } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authenticated) return auth.response!;

    const { senhaAtual, novaSenha } = await req.json().catch(() => ({}));

    if (!senhaAtual || !novaSenha) {
      return NextResponse.json(
        { error: "Senha atual e nova senha são obrigatórias" },
        { status: 400 }
      );
    }

    if (typeof novaSenha !== "string" || novaSenha.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { id: true, senha: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar senha atual (Argon2)
    const ok = await verifyPassword(senhaAtual, user.senha);
    if (!ok) {
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 400 }
      );
    }

    // Hash Argon2 da nova senha
    const novaSenhaHash = await hashPassword(novaSenha);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        senha: novaSenhaHash,
        lastPasswordChange: new Date(),
      },
    });

    // Registrar log de atividade
    const ip = getClientIp(req);
    const deviceInfo = req.headers.get("user-agent") || null;
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "password_change",
        description: "Senha alterada com sucesso",
        ip,
        device: deviceInfo,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Senha alterada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json({ error: "Erro ao alterar senha" }, { status: 500 });
  }
}

