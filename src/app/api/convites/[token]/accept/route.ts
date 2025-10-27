import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { hashPassword, normalizeEmail, setAuthCookie, signJwt } from '@/lib/auth'

export const runtime = 'nodejs'

const Body = z.object({
  nome: z.string().min(2).max(120),
  email: z.string().email(),
  senha: z.string().min(6).max(72),
})

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token: tokenParam } = await ctx.params
  // Buscar convite sem depender do campo servicosIds (caso DB não tenha a coluna)
  const convite = await prisma.convite.findUnique({
    where: { token: tokenParam },
    select: {
      id: true,
      email: true,
      empresaId: true,
      mensagem: true,
      status: true,
      expiresAt: true,
    },
  })
  if (!convite) return NextResponse.json({ error: 'Convite inválido' }, { status: 404 })
  if (convite.status !== 'PENDING') return NextResponse.json({ error: 'Convite já utilizado' }, { status: 400 })
  if (convite.expiresAt < new Date()) return NextResponse.json({ error: 'Convite expirado' }, { status: 400 })

  const body = await req.json().catch(() => null)
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

  const emailNorm = normalizeEmail(parsed.data.email)
  if (emailNorm !== convite.email.toLowerCase()) {
    return NextResponse.json({ error: 'E-mail não corresponde ao do convite' }, { status: 400 })
  }

  // Cria ou localiza usuário
  const passwordHash = await hashPassword(parsed.data.senha)
  const user = await prisma.user.upsert({
    where: { email: emailNorm },
    update: { nome: parsed.data.nome, senha: passwordHash, tipoUsuario: 'usuario' },
    create: { nome: parsed.data.nome, email: emailNorm, senha: passwordHash, tipoUsuario: 'usuario' },
    select: { id: true, email: true, nome: true }
  })

  // Vínculo como funcionário da empresa se ainda não existir
  let funcionario = await prisma.funcionario.findFirst({
    where: { empresaId: convite.empresaId, userId: user.id }
  })
  if (!funcionario) {
    funcionario = await prisma.funcionario.create({ data: { empresaId: convite.empresaId, userId: user.id } })
  }

  // Vincula serviços selecionados no convite, se houver (e se a coluna existir)
  try {
    const convComServicos = await prisma.convite.findUnique({
      where: { id: convite.id },
      select: { servicosIds: true },
    })
    const servicosIds = convComServicos?.servicosIds || []
    if (servicosIds.length > 0) {
      const validServicos = await prisma.servico.findMany({
        where: { empresaId: convite.empresaId, id: { in: servicosIds } },
        select: { id: true },
      })
      if (validServicos.length > 0) {
        await prisma.$transaction(
          validServicos.map((s) =>
            prisma.funcionarioServico.create({ data: { funcionarioId: funcionario!.id, servicoId: s.id } })
          )
        )
      }
    }
  } catch (e: any) {
    if (e?.code !== 'P2021') throw e
  }

  await prisma.convite.update({
    where: { id: convite.id },
    data: { status: 'ACCEPTED', acceptedAt: new Date(), convidadoId: user.id }
  })

  const token = await signJwt({ sub: user.id, email: user.email, tipoUsuario: 'usuario' })
  const res = NextResponse.json({ ok: true, user })
  setAuthCookie(res as any, token)
  return res
}
