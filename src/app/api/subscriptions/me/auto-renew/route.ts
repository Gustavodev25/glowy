import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { autoRenew } = body as { autoRenew?: boolean };

    if (typeof autoRenew !== 'boolean') {
      return NextResponse.json({ error: 'Parâmetro inválido' }, { status: 400 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { autoRenew },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao atualizar autoRenovação:', error);
    return NextResponse.json({ error: 'Erro ao atualizar autoRenovação' }, { status: 500 });
  }
}

