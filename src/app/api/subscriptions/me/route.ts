import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: true,
        paymentMethod: true,
      },
    });

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
        plan: {
          id: subscription.plan.id,
          name: subscription.plan.name,
          description: subscription.plan.description,
          iconUrl: subscription.plan.iconUrl,
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
