import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const empresaId = searchParams.get("empresaId");
    const data = searchParams.get("data"); // formato: YYYY-MM-DD
    const duracao = searchParams.get("duracao"); // duração do serviço em minutos

    if (!empresaId || !data || !duracao) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios: empresaId, data, duracao" },
        { status: 400 }
      );
    }

    const dataConsulta = new Date(data);
    const diaDaSemana = dataConsulta.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    const duracaoMinutos = parseInt(duracao);

    // Buscar o horário de funcionamento para o dia da semana
    let businessHour = await prisma.businessHours.findFirst({
      where: {
        company: {
          user: {
            empresas: {
              some: {
                id: empresaId,
                ativo: true
              }
            }
          }
        },
        dayOfWeek: diaDaSemana,
        isOpen: true
      }
    });

    // Se não encontrou na tabela nova, usar horário padrão
    if (!businessHour) {
      console.log(`ℹ️ BusinessHours não encontrado para dia ${diaDaSemana}, usando horário padrão 8h-20h`);
      businessHour = {
        openTime: "08:00",
        closeTime: "20:00",
        breakStart: null,
        breakEnd: null,
        isOpen: true
      } as any;
    }

    // Se o estabelecimento está fechado neste dia
    if (!businessHour.isOpen) {
      return NextResponse.json({
        success: true,
        horarios: [],
        message: "Estabelecimento fechado neste dia"
      });
    }

    // Converter horários para minutos
    const [openHour, openMinute] = businessHour.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = businessHour.closeTime.split(':').map(Number);

    const openTimeMinutes = openHour * 60 + openMinute;
    const closeTimeMinutes = closeHour * 60 + closeMinute;

    let breakStartMinutes = null;
    let breakEndMinutes = null;

    if (businessHour.breakStart && businessHour.breakEnd) {
      const [breakStartHour, breakStartMinute] = businessHour.breakStart.split(':').map(Number);
      const [breakEndHour, breakEndMinute] = businessHour.breakEnd.split(':').map(Number);

      breakStartMinutes = breakStartHour * 60 + breakStartMinute;
      breakEndMinutes = breakEndHour * 60 + breakEndMinute;
    }

    // Buscar agendamentos já existentes para o dia
    const inicioDia = new Date(dataConsulta);
    inicioDia.setHours(0, 0, 0, 0);

    const fimDia = new Date(dataConsulta);
    fimDia.setHours(23, 59, 59, 999);

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        empresaId,
        dataHora: {
          gte: inicioDia,
          lte: fimDia
        },
        status: {
          in: ['agendado', 'confirmado']
        }
      },
      select: {
        dataHora: true,
        duracao: true
      }
    });

    // Gerar lista de horários disponíveis (a cada 30 minutos)
    const horariosDisponiveis: string[] = [];
    const intervaloMinutos = 30;

    for (let minutos = openTimeMinutes; minutos + duracaoMinutos <= closeTimeMinutes; minutos += intervaloMinutos) {
      const hora = Math.floor(minutos / 60);
      const minuto = minutos % 60;

      const horarioInicio = new Date(dataConsulta);
      horarioInicio.setHours(hora, minuto, 0, 0);

      const horarioFim = new Date(horarioInicio.getTime() + duracaoMinutos * 60000);

      // Verificar se está no horário de intervalo
      if (breakStartMinutes !== null && breakEndMinutes !== null) {
        const minutosFim = Math.floor(horarioFim.getTime() / 60000) % 1440; // Minutos do dia

        // Se o horário cai dentro do intervalo, pular
        if (
          (minutos >= breakStartMinutes && minutos < breakEndMinutes) ||
          (minutosFim > breakStartMinutes && minutosFim <= breakEndMinutes) ||
          (minutos < breakStartMinutes && minutosFim > breakEndMinutes)
        ) {
          continue;
        }
      }

      // Verificar se há conflito com agendamentos existentes
      let temConflito = false;

      for (const agendamento of agendamentos) {
        const agendamentoFim = new Date(agendamento.dataHora.getTime() + agendamento.duracao * 60000);

        // Verifica se há sobreposição
        const hasOverlap =
          (horarioInicio >= agendamento.dataHora && horarioInicio < agendamentoFim) ||
          (horarioFim > agendamento.dataHora && horarioFim <= agendamentoFim) ||
          (horarioInicio <= agendamento.dataHora && horarioFim >= agendamentoFim);

        if (hasOverlap) {
          temConflito = true;
          break;
        }
      }

      if (!temConflito) {
        horariosDisponiveis.push(`${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`);
      }
    }

    return NextResponse.json({
      success: true,
      horarios: horariosDisponiveis,
      businessHours: {
        openTime: businessHour.openTime,
        closeTime: businessHour.closeTime,
        breakStart: businessHour.breakStart,
        breakEnd: businessHour.breakEnd
      }
    });

  } catch (error) {
    console.error("❌ Erro ao buscar horários disponíveis:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
