// app/api/2fa/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request);
  if (!auth.authenticated) return auth.response!;

  const user: any = await prisma.user.findUnique({
    where: { id: auth.user.id },
    // select omitted to avoid type issues before prisma generate
  });

  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  // If already enabled, no need to generate
  if (user?.twoFactorEnabled) {
    return NextResponse.json({ error: "2FA já está habilitado" }, { status: 400 });
  }

  const secret = speakeasy.generateSecret({ length: 20, name: `Booky:${user.email}`, issuer: "Booky" });

  // Store base32 secret (not enabled until verified)
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: secret.base32 },
  });

  const otpauthUrl = secret.otpauth_url ?? `otpauth://totp/Booky:${encodeURIComponent(user.email)}?secret=${secret.base32}&issuer=Booky`;
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return NextResponse.json({ otpauthUrl, qrCodeDataUrl, secret: secret.base32 });
}
