// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  normalizeEmail,
  signJwt,
  setAuthCookie,
} from "@/lib/auth";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const RegisterSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  email: z.string().email().max(320),
  senha: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .max(72, "Limite de 72 chars (bcrypt safe-range)"),
});

export async function POST(request: NextRequest) {
  const ip = request ? (request as any) : undefined;
  const key = `register:${(request as any)?.ip ?? ""}:${request.headers.get("x-forwarded-for") ?? ""}`;
  const rl = checkRateLimit(key, 10, 10 * 60_000); // 10 requisições/10min por IP
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  const { nome, email, senha } = parsed.data;
  const emailNorm = normalizeEmail(email);

  try {
    const hash = await hashPassword(senha);

    // cria usuário; trata duplicidade
    const user = await prisma.user.create({
      data: { nome, email: emailNorm, senha: hash },
      select: { id: true, nome: true, email: true, createdAt: true },
    });

    // (Opcional) já autenticar após cadastro:
    const token = await signJwt({ sub: user.id, email: user.email });
    const res = NextResponse.json(
      { message: "Usuário criado", user },
      { status: 201 },
    );
    setAuthCookie(res, token);
    return res;
  } catch (err: any) {
    // Prisma P2002 = unique violation (email duplicado)
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Este e-mail já está em uso" },
        { status: 409 },
      );
    }
    console.error("Erro no cadastro:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
