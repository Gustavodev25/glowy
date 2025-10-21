// app/api/2fa/whatsapp/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";
import { generateNumericOtp, hashOtp } from "@/lib/otp";
import { sendWhatsAppMessage } from "@/lib/twilio";

export const runtime = "nodejs";

function normalizePhone(input: string) {
  const trimmed = (input || "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed.replace(/\s+/g, "");
  const digits = trimmed.replace(/\D+/g, "");
  return digits ? `+${digits}` : "";
}

export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request);
  if (!auth.authenticated) return auth.response!;

  const body = await request.json().catch(() => ({}));
  const rawPhone = String(body.phone || "");
  const phone = normalizePhone(rawPhone);
  if (!phone || phone.length < 8) {
    return NextResponse.json(
      { error: "Telefone inválido. Use formato E.164, ex: +5511999999999" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  // Se já estiver habilitado com WHATSAPP, não iniciar novamente
  if (user.twoFactorEnabled && user.twoFactorMethod === "whatsapp") {
    return NextResponse.json({ error: "2FA por WhatsApp já está habilitado" }, { status: 400 });
  }

  // (Opcional) rate limit simples de reenvio:
  // if (user.whatsappOtpExpiresAt) {
  //   const msDesdeUltimo = Date.now() - new Date(user.whatsappOtpExpiresAt).getTime() + (10*60*1000 - 10*60*1000);
  // }

  const code = generateNumericOtp(6);
  const hash = await hashOtp(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await prisma.user.update({
    where: { id: user.id },
    data: {
      whatsappPhoneE164: phone,
      // Se você usa TOTP em paralelo, não mexa no secret aqui.
      // twoFactorSecret: null, // só se quiser limpar TOTP ao iniciar WhatsApp
      whatsappOtpHash: hash,
      whatsappOtpExpiresAt: expiresAt,
      whatsappOtpAttempts: 0, // zera tentativas
      twoFactorMethod: null, // só será confirmado no verify
    },
  });

  try {
    await sendWhatsAppMessage(
      phone,
      `Seu código 2FA da Booky é ${code}. Ele expira em 10 minutos.`
    );
  } catch (err) {
    console.error("Falha ao enviar WhatsApp:", err);
    return NextResponse.json(
      { error: "Falha ao enviar mensagem no WhatsApp. Verifique configuração do Twilio." },
      { status: 502 }
    );
  }

  return NextResponse.json({ message: "Código enviado por WhatsApp" });
}
