// app/api/auth/tipo-usuario/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";
import { verifyJwt, signJwt, setAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";

const TipoUsuarioSchema = z.object({
  tipoUsuario: z.enum(["dono", "usuario"], {
    message: "Tipo de usuário deve ser 'dono' ou 'usuario'",
  }),
});

export async function POST(request: NextRequest) {
  const key = `tipo-usuario:${request.headers.get("x-forwarded-for") ?? ""}`;
  const rl = checkRateLimit(key, 5, 5 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429 }
    );
  }

  const token = request.cookies.get("auth")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const payload = await verifyJwt<{ sub: string; email: string }>(token);
  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = TipoUsuarioSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { tipoUsuario } = parsed.data;

  try {
    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: { tipoUsuario },
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        updatedAt: true,
      },
    });

    // Reemite JWT com o novo tipo para refletir nas próximas requisições
    const newToken = await signJwt({
      sub: user.id,
      email: user.email,
      tipoUsuario: user.tipoUsuario,
    });
    const res = NextResponse.json(
      { message: "Tipo de usuário atualizado com sucesso", user },
      { status: 200 }
    );
    setAuthCookie(res, newToken);
    return res;
  } catch (err) {
    console.error("Erro ao atualizar tipo de usuário:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

