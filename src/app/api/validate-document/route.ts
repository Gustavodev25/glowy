import { NextRequest, NextResponse } from "next/server";

// Função para validar CNPJ
function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]/g, '');

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let sum = 0;
  let weight = 5;

  // Primeiro dígito verificador
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }

  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cnpj[12]) !== digit1) return false;

  // Segundo dígito verificador
  sum = 0;
  weight = 6;

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }

  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return parseInt(cnpj[13]) === digit2;
}

// Função para validar CPF
function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;

  // Primeiro dígito verificador
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }

  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cpf[9]) !== digit1) return false;

  // Segundo dígito verificador
  sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }

  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return parseInt(cpf[10]) === digit2;
}

// Simulação de consulta à Receita Federal (mock)
async function consultarReceitaFederal(documento: string, tipo: "CNPJ" | "CPF") {
  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (tipo === "CNPJ") {
    // Mock de dados da empresa
    return {
      valid: true,
      empresa: {
        razaoSocial: "Empresa Exemplo Ltda",
        nomeFantasia: "Empresa Exemplo",
        cnpj: documento,
        situacao: "ATIVA",
        dataAbertura: "01/01/2020",
        naturezaJuridica: "Sociedade Empresária Limitada",
        logradouro: "Rua Exemplo, 123",
        municipio: "São Paulo",
        uf: "SP",
        cep: "01234-567",
        telefone: "(11) 99999-9999",
        email: "contato@empresaexemplo.com.br"
      }
    };
  } else {
    // Mock de dados do CPF
    return {
      valid: true,
      pessoa: {
        nome: "João da Silva",
        cpf: documento,
        situacao: "REGULAR",
        dataNascimento: "01/01/1990",
        sexo: "M",
        nacionalidade: "BRASILEIRA"
      }
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { documento, tipo } = await request.json();

    if (!documento || !tipo) {
      return NextResponse.json(
        { error: "Documento e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    // Validação básica de formato
    if (tipo === "CNPJ" && documento.length !== 14) {
      return NextResponse.json(
        { valid: false, error: "CNPJ deve ter 14 dígitos" },
        { status: 200 }
      );
    }

    if (tipo === "CPF" && documento.length !== 11) {
      return NextResponse.json(
        { valid: false, error: "CPF deve ter 11 dígitos" },
        { status: 200 }
      );
    }

    // Validação matemática
    let isValid = false;
    if (tipo === "CNPJ") {
      isValid = isValidCNPJ(documento);
    } else {
      isValid = isValidCPF(documento);
    }

    if (!isValid) {
      return NextResponse.json(
        { valid: false, error: `${tipo} inválido` },
        { status: 200 }
      );
    }

    // Consulta à Receita Federal (simulada)
    const receitaData = await consultarReceitaFederal(documento, tipo);

    return NextResponse.json({
      valid: true,
      documento: documento,
      tipo: tipo,
      ...receitaData
    });

  } catch (error) {
    console.error("Erro na validação de documento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}








