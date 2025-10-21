import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

function formatDate(d?: Date | null) {
  if (!d) return '';
  const iso = d.toISOString();
  return iso.slice(0, 19).replace('T', ' ');
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const period = (params.get('period') || 'monthly').toLowerCase();
    let start: Date | undefined;
    let end: Date | undefined;

    const now = new Date();
    if (period === 'monthly') {
      start = new Date(now);
      start.setDate(now.getDate() - 30);
      end = now;
    } else if (period === 'yearly') {
      start = new Date(now);
      start.setDate(now.getDate() - 365);
      end = now;
    } else if (period === 'custom') {
      const s = params.get('start');
      const e = params.get('end');
      if (!s || !e) return NextResponse.json({ error: 'Parâmetros start e end são obrigatórios' }, { status: 400 });
      start = new Date(s);
      end = new Date(e);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return NextResponse.json({ error: 'Datas inválidas' }, { status: 400 });
      // incluir dia final completo
      end.setHours(23, 59, 59, 999);
    } else if (period === 'all') {
      // sem filtro de data
    } else {
      return NextResponse.json({ error: 'Período inválido' }, { status: 400 });
    }

    const where: any = { subscription: { userId: user.userId } };
    if (start && end) {
      where.dueDate = { gte: start, lte: end };
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { dueDate: 'desc' },
      include: { subscription: { include: { plan: true } } },
    });

    const rows = [
      ['ID', 'Status', 'Método', 'Valor', 'Vencimento', 'Pagamento', 'Plano', 'Invoice URL'],
      ...payments.map((p) => [
        p.id,
        p.status,
        p.method || '',
        String(Number(p.amount).toFixed(2)).replace('.', ','),
        formatDate(p.dueDate),
        formatDate(p.paymentDate),
        p.subscription?.plan?.name || '',
        p.invoiceUrl || '',
      ]),
    ];

    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

    const filename = `relatorio_pagamentos_${period}_${new Date().toISOString().slice(0,10)}.csv`;
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename=${filename}`);
    return new NextResponse(csv, { headers });
  } catch (e) {
    console.error('Erro ao gerar relatório de pagamentos:', e);
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 });
  }
}

