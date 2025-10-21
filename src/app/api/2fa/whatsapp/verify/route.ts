// app/api/2fa/whatsapp/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";
import { verifyOtp } from "@/lib/otp";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request);
  if (!auth.authenticated) return auth.response!;

  const { code } = await request.json().catch(() => ({}));
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Código é obrigatório" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  // Se já está com TOTP, não aceite WhatsApp verify
  if (user.twoFactorMethod === "TOTP") {
    return NextResponse.json({ error: "Método 2FA configurado é TOTP" }, { status: 400 });
  }

  if (!user.whatsappOtpHash || !user.whatsappOtpExpiresAt) {
    return NextResponse.json({ error: "2FA por WhatsApp não iniciado" }, { status: 400 });
  }

  if (user.whatsappOtpExpiresAt < new Date()) {
    return NextResponse.json({ error: "Código expirado" }, { status: 401 });
  }

  if ((user.whatsappOtpAttempts ?? 0) >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Muitas tentativas. Recomece o processo." }, { status: 429 });
  }

  const ok = await verifyOtp(code.replace(/\s+/g, ""), user.whatsappOtpHash);
  if (!ok) {
    await prisma.user.update({
      where: { id: user.id },
      data: { whatsappOtpAttempts: (user.whatsappOtpAttempts ?? 0) + 1 },
    });
    return NextResponse.json({ error: "Código inválido" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorConfirmedAt: new Date(),
      twoFactorMethod: "whatsapp",
      whatsappOtpHash: null,
      whatsappOtpExpiresAt: null,
      whatsappOtpAttempts: 0,
    },
  });

  return NextResponse.json({ message: "2FA por WhatsApp habilitado" });
}
