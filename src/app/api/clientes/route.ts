import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDonoOrProfissional } from '@/middleware/auth'

// Disable static optimization/caching for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Autenticar usuário (dono ou profissional) e buscar empresa
    const auth = await requireDonoOrProfissional(request)

    if (!auth.authorized || !auth.empresa) {
      return auth.response!
    }

    // Empresa do dono ou profissional
    let empresa = auth.empresa

    // Se não encontrou, verificar se tem CompanySettings e criar empresa automaticamente (apenas para donos)
    if (!empresa && auth.user.tipoUsuario === "dono") {
      const companySettings = await prisma.companySettings.findFirst({
        where: { userId: auth.user.id },
        include: {
          user: {
            select: { email: true, nome: true }
          }
        }
      })

      if (!companySettings) {
        // Criar empresa padrão automaticamente baseada nas informações do usuário
        console.log('🔧 Criando empresa padrão automaticamente...')

        empresa = await prisma.empresa.create({
          data: {
            donoId: auth.user.id,
            tipoDocumento: "CNPJ",
            documento: `TEMP-${auth.user.id}`,
            nomeEmpresa: auth.user.nome || "Minha Empresa",
            nomeFantasia: auth.user.nome || "Minha Empresa",
            telefone: "(00) 00000-0000",
            email: auth.user.email,
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
        // Criar empresa na tabela antiga baseada no CompanySettings
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
            donoId: auth.user.id,
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

    // Buscar clientes da empresa
    const clientes = await prisma.cliente.findMany({
      where: { 
        empresaId: empresa.id,
        ativo: true
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            agendamentos: true,
            documentos: true
          }
        }
      }
    })

    return NextResponse.json({ clientes }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Autenticar usuário (dono ou profissional) e buscar empresa
    const auth = await requireDonoOrProfissional(request)

    if (!auth.authorized || !auth.empresa) {
      return auth.response!
    }

    let empresa = auth.empresa

    // Se não encontrou, verificar se tem CompanySettings e criar empresa automaticamente (apenas para donos)
    if (!empresa && auth.user.tipoUsuario === "dono") {
      console.log('⚠️ Empresa não encontrada na tabela antiga. Verificando CompanySettings...')

      const companySettings = await prisma.companySettings.findFirst({
        where: { userId: auth.user.id },
        include: {
          user: {
            select: { email: true, nome: true }
          }
        }
      })

      if (!companySettings) {
        // Criar empresa padrão automaticamente baseada nas informações do usuário
        console.log('🔧 Criando empresa padrão automaticamente...')

        empresa = await prisma.empresa.create({
          data: {
            donoId: auth.user.id,
            tipoDocumento: "CNPJ",
            documento: `TEMP-${auth.user.id}`,
            nomeEmpresa: auth.user.nome || "Minha Empresa",
            nomeFantasia: auth.user.nome || "Minha Empresa",
            telefone: "(00) 00000-0000",
            email: auth.user.email,
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
        // Criar empresa na tabela antiga baseada no CompanySettings
        console.log('🔧 Criando empresa na tabela antiga baseada no CompanySettings...')

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
            donoId: auth.user.id,
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

        console.log('✅ Empresa criada com sucesso:', empresa.id)
      }
    }

    const body = await request.json()
    const { nome, email, telefone, cpf } = body

    // Validações
    if (!nome || !telefone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar cliente no banco de dados
    const cliente = await prisma.cliente.create({
      data: {
        empresaId: empresa.id,
        nome,
        email: email || null,
        telefone,
        cpf: cpf || null,
        ativo: true
      },
      include: {
        _count: {
          select: {
            agendamentos: true,
            documentos: true
          }
        }
      }
    })

    console.log('✅ Cliente criado no banco de dados:', cliente.id)

    return NextResponse.json({ cliente }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error)
    
    // Verificar erro de duplicação (se houver constraint de unique)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cliente já cadastrado' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    )
  }
}
