import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) return NextResponse.json({ invoices: [] });

    const payments = await prisma.payment.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { dueDate: 'desc' },
    });

    return NextResponse.json({
      invoices: payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        method: p.method,
        dueDate: p.dueDate.toISOString(),
        paymentDate: p.paymentDate ? p.paymentDate.toISOString() : null,
        invoiceUrl: p.invoiceUrl,
      })),
    });
  } catch (e) {
    console.error('Erro ao listar faturas:', e);
    return NextResponse.json({ error: 'Erro ao listar faturas' }, { status: 500 });
  }
}

