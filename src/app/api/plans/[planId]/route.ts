import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } },
) {
  try {
    const raw = params.planId;
    const planId = decodeURIComponent((raw || "").trim());

    if (!planId) {
      return NextResponse.json(
        { error: "Parâmetro planId é obrigatório" },
        { status: 400 },
      );
    }

    // Buscar plano por ID (UUID) ou nome, garantindo que esteja ativo
    const plan = await prisma.plan.findFirst({
      where: {
        active: true,
        OR: [
          { id: planId },
          { name: { equals: planId, mode: "insensitive" } },
        ],
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Erro ao buscar plano:", error);
    return NextResponse.json(
      { error: "Erro ao buscar plano" },
      { status: 500 },
    );
  }
}
