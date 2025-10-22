import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verificar token do webhook (segurança)
    const webhookToken = request.headers.get('asaas-access-token');
    if (webhookToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
      console.error('Token de webhook inválido');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { event, payment } = body;

    console.log('Webhook recebido:', { event, paymentId: payment?.id });

    if (!payment?.id) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Buscar pagamento no banco
    const dbPayment = await prisma.payment.findUnique({
      where: { abacatePayId: payment.id },
      include: {
        subscription: true,
      },
    });

    if (!dbPayment) {
      console.log('Pagamento não encontrado no banco:', payment.id);
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    // Processar eventos
    switch (event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        // Atualizar pagamento
        await prisma.payment.update({
          where: { id: dbPayment.id },
          data: {
            status: 'CONFIRMED',
            paymentDate: new Date(),
          },
        });

        // Ativar assinatura
        {
          const sub = await prisma.subscription.findUnique({ where: { id: dbPayment.subscriptionId } });
          const now = new Date();
          const end = new Date(now);
          const monthsToAdd = sub?.cycle === 'YEARLY' ? 12 : 1;
          end.setMonth(end.getMonth() + monthsToAdd);
          await prisma.subscription.update({
            where: { id: dbPayment.subscriptionId },
            data: {
              status: 'active',
              startDate: now,
              endDate: end,
              nextDueDate: end,
            },
          });
        }

        console.log('Pagamento confirmado:', payment.id);
        break;

      case 'PAYMENT_OVERDUE':
        await prisma.payment.update({
          where: { id: dbPayment.id },
          data: {
            status: 'OVERDUE',
          },
        });

        // Suspender assinatura
        await prisma.subscription.update({
          where: { id: dbPayment.subscriptionId },
          data: {
            status: 'suspended',
          },
        });

        console.log('Pagamento vencido:', payment.id);
        break;

      case 'PAYMENT_REFUNDED':
        await prisma.payment.update({
          where: { id: dbPayment.id },
          data: {
            status: 'REFUNDED',
          },
        });

        console.log('Pagamento reembolsado:', payment.id);
        break;

      case 'PAYMENT_DELETED':
      case 'PAYMENT_RESTORED':
      case 'PAYMENT_UPDATED':
        // Atualizar status
        await prisma.payment.update({
          where: { id: dbPayment.id },
          data: {
            status: payment.status || dbPayment.status,
          },
        });
        break;

      default:
        console.log('Evento não tratado:', event);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}
