import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDono } from '@/middleware/auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const UpdateSchema = z.object({
  tipoUsuario: z.enum(['usuario', 'dono']).optional(),
  cargo: z.string().nullable().optional(),
  salario: z.number().nullable().optional(),
  servicosIds: z.array(z.string()).optional(),
})

// Detalhes do funcionário (serviços vinculados)
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireDono(req)
  if (!auth.authorized) return auth.response!

  const { id: userId } = await ctx.params

  // Descobrir a empresa do dono
  const empresa = await prisma.empresa.findFirst({ where: { donoId: auth.user.id } })
  if (!empresa) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
  }

  const funcionario = await prisma.funcionario.findFirst({
    where: { empresaId: empresa.id, userId },
    select: { id: true, cargo: true, salario: true, ativo: true },
  })
  if (!funcionario) {
    return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
  }

  // Serviços vinculados (fallback se tabela não existir)
  let vinculados: { servico: { id: string; nome: string } }[] = []
  try {
    vinculados = await prisma.funcionarioServico.findMany({
      where: { funcionarioId: funcionario.id },
      select: { servico: { select: { id: true, nome: true } } },
    })
  } catch (e: any) {
    if (e?.code !== 'P2021') throw e
  }

  return NextResponse.json({
    id: userId,
    cargo: funcionario.cargo,
    salario: funcionario.salario ? Number(funcionario.salario) : null,
    servicos: vinculados.map((v) => ({ id: v.servico.id, nome: v.servico.nome })),
  })
}

// Atualizar funcionário (cargo/salário/tipo e serviços)
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireDono(req)
  if (!auth.authorized) return auth.response!

  const { id: userId } = await ctx.params
  const body = await req.json().catch(() => null)
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  // Empresa do dono
  const empresa = await prisma.empresa.findFirst({ where: { donoId: auth.user.id } })
  if (!empresa) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
  }

  // Localizar registro de funcionário na empresa
  const funcionario = await prisma.funcionario.findFirst({
    where: { empresaId: empresa.id, userId },
  })
  if (!funcionario) {
    return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
  }

  // Atualiza cargo/salário
  if (parsed.data.cargo !== undefined || parsed.data.salario !== undefined) {
    await prisma.funcionario.update({
      where: { id: funcionario.id },
      data: {
        cargo: parsed.data.cargo === undefined ? undefined : parsed.data.cargo,
        salario: parsed.data.salario === undefined ? undefined : parsed.data.salario,
      },
    })
  }

  // Atualiza tipo do usuário (não altera dono da empresa)
  if (parsed.data.tipoUsuario) {
    await prisma.user.update({
      where: { id: userId },
      data: { tipoUsuario: parsed.data.tipoUsuario },
    })
  }

  // Atualiza serviços vinculados, validando que pertencem à mesma empresa
  if (parsed.data.servicosIds) {
    try {
      const validServicos = await prisma.servico.findMany({
        where: { empresaId: empresa.id, id: { in: parsed.data.servicosIds } },
        select: { id: true },
      })
      const validIds = validServicos.map((s) => s.id)

      await prisma.$transaction([
        prisma.funcionarioServico.deleteMany({ where: { funcionarioId: funcionario.id } }),
        ...validIds.map((servicoId) =>
          prisma.funcionarioServico.create({ data: { funcionarioId: funcionario.id, servicoId } })
        ),
      ])
    } catch (e: any) {
      if (e?.code !== 'P2021') throw e
      // sem tabela de vínculo: ignora atualização de serviços
    }
  }

  return NextResponse.json({ ok: true })
}
