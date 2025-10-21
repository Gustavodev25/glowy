// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, verifyPassword, signJwt, setAuthCookie, uniformDelay, getClientIp } from "@/lib/auth";
import { generateNumericOtp, hashOtp } from "@/lib/otp";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const LoginSchema = z.object({
  email: z.string().email().max(320),
  senha: z.string().min(1),
});

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(
    `login:${request.headers.get("x-forwarded-for") ?? ""}`,
    30,           // 30 req/min por IP
    60_000
  );
  if (!rl.allowed) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco e tente de novo." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const senha = parsed.data.senha;

  try {
    const user: any = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true, nome: true, email: true, senha: true,
        failedLoginAttempts: true, lockedUntil: true, createdAt: true,
        twoFactorEnabled: true,
        twoFactorMethod: true,
        twoFactorSecret: true,
        telefone: true,
        whatsappPhoneE164: true,
      },
    });

    // Mitiga enumeração com atraso fixo
    await uniformDelay(300);

    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Checa bloqueio temporário
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: "Conta temporariamente bloqueada por tentativas falhas. Tente novamente mais tarde." },
        { status: 423 } // Locked
      );
    }

    const ok = await verifyPassword(senha, user.senha);

    if (!ok) {
      const fails = (user.failedLoginAttempts ?? 0) + 1;
      const lock = fails >= MAX_FAILS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: fails, lockedUntil: lock },
      });

      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Sucesso: zera contadores
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
      select: { id: true, nome: true, email: true, tipoUsuario: true, createdAt: true },
    });

    // Se 2FA via WhatsApp, envie o código e retorne o token de 2FA
    if (user?.twoFactorEnabled && user.twoFactorMethod === "whatsapp") {
      const twoFactorToken = await signJwt({ stage: "2fa", sub: updated.id }, "5m");
      const phoneNumber = user.whatsappPhoneE164 || user.telefone;
      if (!phoneNumber) {
        return NextResponse.json({ error: "Telefone nao cadastrado para 2FA por WhatsApp" }, { status: 400 });
      }
      const code = generateNumericOtp(6);
      const hash = await hashOtp(code);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: { whatsappOtpHash: hash, whatsappOtpExpiresAt: expiresAt },
      });
      try {
        const phone = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber.replace(/[^0-9]/g, "")}`;
        await sendWhatsAppMessage(phone, `Seu codigo 2FA da Booky e ${code}. Ele expira em 10 minutos.`);
      } catch (err) {
        console.error("Falha ao enviar WhatsApp no login:", err);
        return NextResponse.json({ error: "Falha ao enviar codigo por WhatsApp" }, { status: 502 });
      }
      return NextResponse.json({ twoFactorRequired: true, twoFactorToken, method: "whatsapp" }, { status: 200 });
    }

    // Se 2FA estiver habilitado, não emitir cookie ainda
    if (user?.twoFactorEnabled) {
      const twoFactorToken = await signJwt({ stage: "2fa", sub: updated.id }, "5m");
      return NextResponse.json({ twoFactorRequired: true, twoFactorToken }, { status: 200 });
    }

    // Caso contrário, autentica normalmente
    const token = await signJwt({ sub: updated.id, email: updated.email, tipoUsuario: updated.tipoUsuario }, "30d");
    const res = NextResponse.json({ message: "Autenticado", user: updated }, { status: 200 });
    setAuthCookie(res, token, 60 * 60 * 24 * 30); // 30 dias
    try {
      const ip = getClientIp(request as any);
      const ua = request.headers.get("user-agent") || null;
      const now = new Date();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
      await prisma.session.create({
        data: {
          userId: updated.id,
          token,
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
          userId: updated.id,
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
  } catch (err) {
    console.error("Erro no login:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
