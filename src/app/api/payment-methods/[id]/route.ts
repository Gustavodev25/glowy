import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const method = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!method || method.userId !== user.userId) {
      return NextResponse.json({ error: 'Método não encontrado' }, { status: 404 });
    }

    await prisma.paymentMethod.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Erro ao excluir método de pagamento:', e);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}

