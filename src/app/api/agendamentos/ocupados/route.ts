import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const empresaId = searchParams.get("empresaId");
    const ano = searchParams.get("ano");
    const mes = searchParams.get("mes");

    if (!empresaId || !ano || !mes) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios: empresaId, ano, mes" },
        { status: 400 }
      );
    }

    // Calcular primeiro e último dia do mês
    const primeiroDia = new Date(parseInt(ano), parseInt(mes) - 1, 1);
    const ultimoDia = new Date(parseInt(ano), parseInt(mes), 0, 23, 59, 59);

    // Buscar agendamentos do mês
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        empresaId,
        dataHora: {
          gte: primeiroDia,
          lte: ultimoDia,
        },
        status: {
          in: ["agendado", "confirmado"], // Apenas agendamentos ativos
        },
      },
      select: {
        dataHora: true,
        duracao: true,
      },
    });

    // Agrupar horários ocupados por data
    const horariosOcupados: Record<string, string[]> = {};

    agendamentos.forEach((agendamento) => {
      const data = agendamento.dataHora.toISOString().split("T")[0];
      const horaInicio = agendamento.dataHora.getHours();
      const minutoInicio = agendamento.dataHora.getMinutes();

      // Calcular todos os horários ocupados baseado na duração
      const duracaoMinutos = agendamento.duracao;
      const totalSlots = Math.ceil(duracaoMinutos / 30); // Slots de 30 minutos

      if (!horariosOcupados[data]) {
        horariosOcupados[data] = [];
      }

      // Adicionar o horário de início e os próximos slots ocupados
      for (let i = 0; i < totalSlots; i++) {
        const minutoAtual = minutoInicio + i * 30;
        const horaAtual = horaInicio + Math.floor(minutoAtual / 60);
        const minutoFinal = minutoAtual % 60;

        const horarioFormatado = `${horaAtual.toString().padStart(2, "0")}:${minutoFinal.toString().padStart(2, "0")}`;

        if (!horariosOcupados[data].includes(horarioFormatado)) {
          horariosOcupados[data].push(horarioFormatado);
        }
      }
    });

    return NextResponse.json({
      success: true,
      horariosOcupados,
    });
  } catch (error) {
    console.error("Erro ao buscar horários ocupados:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
