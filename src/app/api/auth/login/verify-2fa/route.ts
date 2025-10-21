// app/api/auth/login/verify-2fa/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAuthCookie, signJwt, verifyJwt, getClientIp } from "@/lib/auth";
import speakeasy from "speakeasy";
import { verifyOtp } from "@/lib/otp";

export const runtime = "nodejs";

const BodySchema = {
  parse(json: any) {
    if (!json || typeof json !== "object") throw new Error("Invalid body");
    const token = String(json.twoFactorToken || "");
    const code = String(json.code || "");
    if (!token || !code) throw new Error("Token e código são obrigatórios");
    return { token, code };
  },
};

export async function POST(request: NextRequest) {
  let parsed;
  try {
    const json = await request.json();
    parsed = BodySchema.parse(json);
  } catch {
    return NextResponse.json({ error: "Token e código são obrigatórios" }, { status: 400 });
  }

  const payload = await verifyJwt<{ sub: string; stage?: string }>(parsed.token);
  if (!payload || payload.stage !== "2fa" || !payload.sub) {
    return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 });
  }

  const user: any = await prisma.user.findUnique({ where: { id: payload.sub } });
  // WhatsApp 2FA path: verifica código e retorna sessão
  if (user && user.twoFactorEnabled && user.twoFactorMethod === "whatsapp") {
    if (!user.whatsappOtpHash || !user.whatsappOtpExpiresAt) {
      return NextResponse.json({ error: "Codigo nao solicitado" }, { status: 400 });
    }
    if (user.whatsappOtpExpiresAt < new Date()) {
      return NextResponse.json({ error: "Codigo expirado" }, { status: 401 });
    }
    const okW = await verifyOtp(parsed.code.replace(/\s+/g, ""), user.whatsappOtpHash);
    if (!okW) return NextResponse.json({ error: "Codigo invalido" }, { status: 401 });
    await prisma.user.update({ where: { id: user.id }, data: { whatsappOtpHash: null, whatsappOtpExpiresAt: null } });

    const authToken = await signJwt({ sub: user.id, email: user.email, tipoUsuario: user.tipoUsuario }, "30d");
    const res = NextResponse.json({ message: "Autenticado", user: { id: user.id, email: user.email, tipoUsuario: user.tipoUsuario } });
    setAuthCookie(res, authToken, 60 * 60 * 24 * 30); // 30 dias
    try {
      const ip = getClientIp(request as any);
      const ua = request.headers.get("user-agent") || null;
      const now = new Date();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
      await prisma.session.create({
        data: {
          userId: user.id,
          token: authToken,
          device: /Mobi|Android/i.test(ua || "") ? "Mobile" : "Desktop",
          browser: ua,
          os: /Windows/i.test(ua || "")
            ? "Windows"
            : /Mac OS|Macintosh/i.test(ua || "")
              ? "macOS/iOS"
              : /Linux/i.test(ua || "")
                ? "Linux"
                : /Android/i.test(ua || "")
                  ? "Android"
                  : null,
          ip,
          location: null,
          lastActivity: now,
          expiresAt,
        },
      });
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          device: /Mobi|Android/i.test(ua || "") ? "Mobile" : "Desktop",
          browser: ua,
          os: /Windows/i.test(ua || "")
            ? "Windows"
            : /Mac OS|Macintosh/i.test(ua || "")
              ? "macOS/iOS"
              : /Linux/i.test(ua || "")
                ? "Linux"
                : /Android/i.test(ua || "")
                  ? "Android"
                  : null,
          ip,
          location: null,
          success: true,
          failureReason: null,
        },
      });
    } catch { }
    return res;
  }
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: "2FA não habilitado" }, { status: 400 });
  }

  const ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: "base32", token: parsed.code.replace(/\s+/g, ""), window: 1 });
  if (!ok) return NextResponse.json({ error: "Código inválido" }, { status: 401 });

  const authToken = await signJwt({ sub: user.id, email: user.email, tipoUsuario: user.tipoUsuario }, "30d");
  const res = NextResponse.json({ message: "Autenticado", user: { id: user.id, email: user.email, tipoUsuario: user.tipoUsuario } });
  setAuthCookie(res, authToken, 60 * 60 * 24 * 30); // 30 dias
  try {
    const ip = getClientIp(request as any);
    const ua = request.headers.get("user-agent") || null;
    const now = new Date();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
    await prisma.session.create({
      data: {
        userId: user.id,
        token: authToken,
        device: /Mobi|Android/i.test(ua || "") ? "Mobile" : "Desktop",
        browser: ua,
        os: /Windows/i.test(ua || "")
          ? "Windows"
          : /Mac OS|Macintosh/i.test(ua || "")
            ? "macOS/iOS"
            : /Linux/i.test(ua || "")
              ? "Linux"
              : /Android/i.test(ua || "")
                ? "Android"
                : null,
        ip,
        location: null,
        lastActivity: now,
        expiresAt,
      },
    });
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        device: /Mobi|Android/i.test(ua || "") ? "Mobile" : "Desktop",
        browser: ua,
        os: /Windows/i.test(ua || "")
          ? "Windows"
          : /Mac OS|Macintosh/i.test(ua || "")
            ? "macOS/iOS"
            : /Linux/i.test(ua || "")
              ? "Linux"
              : /Android/i.test(ua || "")
                ? "Android"
                : null,
        ip,
        location: null,
        success: true,
        failureReason: null,
      },
    });
  } catch { }
  return res;
}
