import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDonoOrProfissional } from '@/middleware/auth'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

// Helper para obter ou criar empresa do usuário (apenas para donos)
async function getOrCreateEmpresa(userId: string) {
  let empresa = await prisma.empresa.findFirst({
    where: { donoId: userId }
  })

  if (!empresa) {
    const companySettings = await prisma.companySettings.findFirst({
      where: { userId },
      include: {
        user: {
          select: { email: true, nome: true }
        }
      }
    })

    if (!companySettings) {
      // Criar empresa padrão automaticamente baseada nas informações do usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, nome: true }
      })

      if (!user) {
        return null
      }

      empresa = await prisma.empresa.create({
        data: {
          donoId: userId,
          tipoDocumento: "CNPJ",
          documento: `TEMP-${userId}`,
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

      console.log('✅ Empresa padrão criada com sucesso:', empresa.id)
    } else {
      let enderecoInfo = {
        cep: "00000-000",
        logradouro: "Endereço não informado",
        numero: "S/N",
        bairro: "Centro",
        cidade: "Cidade",
        estado: "UF",
        enderecoCompleto: companySettings.address || "",
      }

      if (companySettings.address) {
        try {
          const parsed = JSON.parse(companySettings.address)
          enderecoInfo = {
            cep: parsed.cep || "00000-000",
            logradouro: parsed.logradouro || "Endereço não informado",
            numero: parsed.numero || "S/N",
            bairro: parsed.bairro || "Centro",
            cidade: parsed.localidade || parsed.cidade || "Cidade",
            estado: parsed.uf || parsed.estado || "UF",
            enderecoCompleto: `${parsed.logradouro}, ${parsed.numero} - ${parsed.bairro}, ${parsed.localidade || parsed.cidade} - ${parsed.uf || parsed.estado}`,
          }
        } catch {
          enderecoInfo.enderecoCompleto = companySettings.address
        }
      }

      empresa = await prisma.empresa.create({
        data: {
          donoId: userId,
          tipoDocumento: "CNPJ",
          documento: `TEMP-${companySettings.id}`,
          nomeEmpresa: companySettings.companyName,
          nomeFantasia: companySettings.companyName,
          telefone: companySettings.phone || "(00) 00000-0000",
          email: companySettings.user.email,
          cep: enderecoInfo.cep,
          logradouro: enderecoInfo.logradouro,
          numero: enderecoInfo.numero,
          bairro: enderecoInfo.bairro,
          cidade: enderecoInfo.cidade,
          estado: enderecoInfo.estado,
          enderecoCompleto: enderecoInfo.enderecoCompleto,
          logoUrl: companySettings.logoUrl,
          ativo: true,
        },
      })
    }
  }

  return empresa
}

export async function GET(request: NextRequest, ctx: RouteContext) {
  try {
    const auth = await requireDonoOrProfissional(request)

    if (!auth.authorized || !auth.empresa) {
      return auth.response!
    }

    const { id } = await ctx.params
    let empresa = auth.empresa

    // Buscar cliente específico
    const cliente = await prisma.cliente.findFirst({
      where: {
        id,
        empresaId: empresa.id
      },
      include: {
        agendamentos: {
          include: {
            servico: {
              select: {
                id: true,
                nome: true,
                descricao: true
              }
            }
          },
          orderBy: {
            dataHora: 'desc'
          }
        },
        documentos: {
          where: {
            tipo: {
              not: 'anamnese' // Excluir anamneses dos documentos
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            agendamentos: true,
            documentos: true
          }
        }
      }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    // Buscar anamneses separadamente (documentos do tipo "anamnese")
    const anamnesesDocs = await prisma.documento.findMany({
      where: {
        empresaId: empresa.id,
        clienteId: id,
        tipo: 'anamnese'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transformar anamneses para o formato esperado
    const respostasFormulario = anamnesesDocs.map(doc => ({
      id: doc.id,
      respostas: JSON.parse(doc.descricao || '{}'),
      observacoes: doc.nome,
      createdAt: doc.createdAt.toISOString(),
      formulario: {
        id: 'anamnese-padrao',
        nome: 'Anamnese Estética',
        descricao: 'Formulário padrão de anamnese para procedimentos estéticos'
      }
    }))

    return NextResponse.json({
      cliente: {
        ...cliente,
        respostasFormulario,
        _count: {
          ...cliente._count,
          respostasFormulario: anamnesesDocs.length
        }
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cliente' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext) {
  try {
    const auth = await requireDonoOrProfissional(request)

    if (!auth.authorized || !auth.empresa) {
      return auth.response!
    }

    const { id } = await ctx.params
    const body = await request.json()
    const { nome, email, telefone, cpf } = body
    let empresa = auth.empresa

    // Atualizar cliente
    const cliente = await prisma.cliente.updateMany({
      where: { 
        id,
        empresaId: empresa.id
      },
      data: {
        nome: nome || undefined,
        email: email || null,
        telefone: telefone || undefined,
        cpf: cpf || null
      }
    })

    if (cliente.count === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    // Buscar cliente atualizado
    const updated = await prisma.cliente.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            agendamentos: true,
            documentos: true
          }
        }
      }
    })

    return NextResponse.json({ cliente: updated }, { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, ctx: RouteContext) {
  try {
    const auth = await requireDonoOrProfissional(request)

    if (!auth.authorized || !auth.empresa) {
      return auth.response!
    }

    const { id } = await ctx.params
    let empresa = auth.empresa

    // Soft delete - marcar como inativo ao invés de deletar
    const cliente = await prisma.cliente.updateMany({
      where: { 
        id,
        empresaId: empresa.id
      },
      data: {
        ativo: false
      }
    })

    if (cliente.count === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar cliente' },
      { status: 500 }
    )
  }
}

