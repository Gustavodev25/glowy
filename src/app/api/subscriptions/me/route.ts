import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca dados do usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        tipoUsuario: true,
        funcionarios: {
          include: {
            empresa: {
              include: {
                dono: true
              }
            }
          }
        }
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    let subscription;
    let isInherited = false;
    let ownerName = null;
    let ownerPlanName = null;

    // Se for usuário convidado (tipo "usuario"), busca o plano do dono
    if (currentUser.tipoUsuario === 'usuario' && currentUser.funcionarios.length > 0) {
      const empresa = currentUser.funcionarios[0].empresa;
      const donoId = empresa.donoId;

      // Busca a subscription do dono
      subscription = await prisma.subscription.findFirst({
        where: { userId: donoId },
        orderBy: { createdAt: 'desc' },
        include: {
          plan: true,
          paymentMethod: true,
        },
      });

      if (subscription) {
        isInherited = true;
        ownerName = empresa.dono.nome;
        ownerPlanName = subscription.plan.name;
      }
    } else {
      // Se for dono, busca sua própria subscription
      subscription = await prisma.subscription.findFirst({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
        include: {
          plan: true,
          paymentMethod: true,
        },
      });
    }

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cycle: subscription.cycle,
        amount: subscription.amount,
        autoRenew: subscription.autoRenew,
        paymentType: subscription.paymentType,
        nextDueDate: subscription.nextDueDate,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        isInherited,
        ownerName,
        ownerPlanName,
        plan: {
          id: subscription.plan.id,
          name: subscription.plan.name,
          description: subscription.plan.description,
        },
        paymentMethod: subscription.paymentMethod ? {
          id: subscription.paymentMethod.id,
          type: subscription.paymentMethod.type,
          brand: subscription.paymentMethod.brand,
          last4: subscription.paymentMethod.last4,
          expMonth: subscription.paymentMethod.expMonth,
          expYear: subscription.paymentMethod.expYear,
          isDefault: subscription.paymentMethod.isDefault,
        } : null,
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar assinatura do usuário:', error);
    return NextResponse.json({ error: 'Erro ao buscar assinatura' }, { status: 500 });
  }
}
