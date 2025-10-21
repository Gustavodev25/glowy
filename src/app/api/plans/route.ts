import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os planos ativos
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: [
        { recommended: "desc" }, // Planos recomendados primeiro
        { price: "asc" }, // Depois por preço crescente
      ],
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Erro ao buscar planos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar planos" },
      { status: 500 },
    );
  }
}
