import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params
  const convite = await prisma.convite.findUnique({
    where: { token },
    include: { empresa: true, convidadoPor: true },
  })

  if (!convite) return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 })

  const expired = convite.expiresAt < new Date()
  return NextResponse.json({
    email: convite.email,
    mensagem: convite.mensagem,
    status: convite.status,
    expired,
    empresa: { id: convite.empresaId, nome: convite.empresa.nomeEmpresa },
    convidadoPor: { email: convite.convidadoPor.email, id: convite.convidadoPorId },
    createdAt: convite.createdAt,
  })
}
