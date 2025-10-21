// app/api/2fa/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request);
  if (!auth.authenticated) return auth.response!;

  const user: any = await prisma.user.findUnique({
    where: { id: auth.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ enabled: !!user?.twoFactorEnabled });
}
