// app/api/2fa/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";
import speakeasy from "speakeasy";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request);
  if (!auth.authenticated) return auth.response!;

  const { code } = await request.json().catch(() => ({}));
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Código é obrigatório" }, { status: 400 });
  }

  const user: any = await prisma.user.findUnique({ where: { id: auth.user.id } });
  if (!user || !user.twoFactorSecret) {
    return NextResponse.json({ error: "2FA não iniciado" }, { status: 400 });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code.replace(/\s+/g, ""),
    window: 1,
  });

  if (!verified) {
    return NextResponse.json({ error: "Código inválido" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true, twoFactorConfirmedAt: new Date() },
  });

  return NextResponse.json({ message: "2FA habilitado" });
}
