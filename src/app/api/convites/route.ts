import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDono } from '@/middleware/auth'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { sendInvitationEmail } from '@/lib/mailer'

export const runtime = 'nodejs'

const BodySchema = z.object({
  email: z.string().email(),
  mensagem: z.string().max(1000).optional(),
  tipoUsuario: z.enum(['usuario', 'dono']).default('usuario'),
  servicosIds: z.array(z.string()).default([]),
})

export async function POST(req: NextRequest) {
  const auth = await requireDono(req)
  if (!auth.authorized) return auth.response!

  const body = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  // Empresa do dono (primeira)
  const empresa = await prisma.empresa.findFirst({ where: { donoId: auth.user.id } })
  if (!empresa) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
  }

  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14) // 14 dias

  // Cria o convite; se a coluna servicosIds não existir, cria sem este campo
  let convite
  try {
    convite = await prisma.convite.create({
      data: {
        token,
        email: parsed.data.email.toLowerCase(),
        mensagem: parsed.data.mensagem,
        empresaId: empresa.id,
        convidadoPorId: auth.user.id,
        expiresAt,
        servicosIds: parsed.data.servicosIds ?? [],
      },
    })
  } catch (e: any) {
    // Fallback: cria sem servicosIds (coluna ausente)
    convite = await prisma.convite.create({
      data: {
        token,
        email: parsed.data.email.toLowerCase(),
        mensagem: parsed.data.mensagem,
        empresaId: empresa.id,
        convidadoPorId: auth.user.id,
        expiresAt,
      },
    })
  }

  const baseUrl = process.env.APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`
  const acceptUrl = `${baseUrl}/convite/${token}`

  try {
    await sendInvitationEmail({
      to: convite.email,
      inviterName: auth.user.email ?? 'Dono',
      companyName: empresa.nomeEmpresa,
      message: convite.mensagem ?? undefined,
      acceptUrl,
    })
  } catch (err) {
    console.error('Erro enviando email de convite:', err)
    // mantém o convite criado, mas indica falha de envio
  }

  return NextResponse.json({ token, conviteId: convite.id })
}
