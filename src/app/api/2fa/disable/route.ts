// app/api/2fa/disable/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";
import { verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request);
  if (!auth.authenticated) return auth.response!;

  const { senha } = await request.json().catch(() => ({}));
  if (!senha || typeof senha !== "string") {
    return NextResponse.json({ error: "Senha atual é obrigatória" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { id: true, senha: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const ok = await verifyPassword(senha, user.senha);
  if (!ok) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorConfirmedAt: null,
      whatsappOtpHash: null,
      whatsappOtpExpiresAt: null,
    },
  });

  return NextResponse.json({ message: "2FA desabilitado" });
}
