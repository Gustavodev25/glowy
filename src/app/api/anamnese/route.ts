import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/middleware/auth'

export const dynamic = 'force-dynamic'

// Helper para obter ou criar empresa do usuário
async function getOrCreateEmpresa(userId: string) {
  let empresa = await prisma.empresa.findFirst({
    where: { donoId: userId }
  })

  if (!empresa) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, nome: true }
    })

    if (!user) return null

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
  }

  return empresa
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)

    if (!auth.authenticated) {
      return auth.response!
    }

    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get('clienteId')

    if (!clienteId) {
      return NextResponse.json(
        { error: 'clienteId é obrigatório' },
        { status: 400 }
      )
    }

    const empresa = await getOrCreateEmpresa(auth.user.id)

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    // Buscar anamneses (salvas como documentos do tipo "anamnese")
    const anamneses = await prisma.documento.findMany({
      where: {
        empresaId: empresa.id,
        clienteId: clienteId,
        tipo: 'anamnese'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transformar para o formato esperado
    const respostas = anamneses.map(doc => ({
      id: doc.id,
      respostas: JSON.parse(doc.descricao || '{}'),
      observacoes: doc.nome, // Usamos o campo nome para observações
      createdAt: doc.createdAt.toISOString(),
      formulario: {
        id: 'anamnese-padrao',
        nome: 'Anamnese Estética',
        descricao: 'Formulário padrão de anamnese para procedimentos estéticos'
      }
    }))

    return NextResponse.json({ respostas }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar anamneses:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar anamneses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)

    if (!auth.authenticated) {
      return auth.response!
    }

    const body = await request.json()
    const { clienteId, respostas, observacoes } = body

    if (!clienteId || !respostas) {
      return NextResponse.json(
        { error: 'clienteId e respostas são obrigatórios' },
        { status: 400 }
      )
    }

    const empresa = await getOrCreateEmpresa(auth.user.id)

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o cliente pertence à empresa
    const cliente = await prisma.cliente.findFirst({
      where: {
        id: clienteId,
        empresaId: empresa.id
      }
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Salvar anamnese como documento
    const anamnese = await prisma.documento.create({
      data: {
        empresaId: empresa.id,
        clienteId: clienteId,
        tipo: 'anamnese',
        nome: observacoes || 'Anamnese',
        descricao: JSON.stringify(respostas),
        url: '', // Não tem URL, é um documento virtual
        tamanho: JSON.stringify(respostas).length,
        mimeType: 'application/json',
        uploadedBy: auth.user.id
      }
    })

    console.log('✅ Anamnese criada com sucesso:', anamnese.id)

    return NextResponse.json({
      anamnese: {
        id: anamnese.id,
        respostas: respostas,
        observacoes: observacoes,
        createdAt: anamnese.createdAt.toISOString(),
        formulario: {
          id: 'anamnese-padrao',
          nome: 'Anamnese Estética',
          descricao: 'Formulário padrão de anamnese para procedimentos estéticos'
        }
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar anamnese:', error)
    return NextResponse.json(
      { error: 'Erro ao criar anamnese' },
      { status: 500 }
    )
  }
}
