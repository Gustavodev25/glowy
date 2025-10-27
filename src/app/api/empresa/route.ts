import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/middleware/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)

    if (!auth.authenticated) {
      return auth.response!
    }

    // Buscar empresa do usuário
    let empresa = await prisma.empresa.findFirst({
      where: { donoId: auth.user.id }
    })

    // Se não encontrou, tentar criar automaticamente
    if (!empresa) {
      const user = await prisma.user.findUnique({
        where: { id: auth.user.id },
        select: { email: true, nome: true }
      })

      if (user) {
        empresa = await prisma.empresa.create({
          data: {
            donoId: auth.user.id,
            tipoDocumento: "CNPJ",
            documento: `TEMP-${auth.user.id}`,
            nomeEmpresa: user.nome || "Minha Empresa",
            nomeFantasia: user.nome || "Minha Empresa",
            telefone: "(00) 00000-0000",
            email: user.email,
            cep: "00000-000",
            logradouro: "Endereço não informado",
            numero: "S/N",
            bairro: "Centro",
            cidade: "Cidade",
            estado: "UF",
            enderecoCompleto: "Configure o endereço da sua empresa nas configurações",
            ativo: true,
          },
        })
      }
    }

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ empresa }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar empresa:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar empresa' },
      { status: 500 }
    )
  }
}
