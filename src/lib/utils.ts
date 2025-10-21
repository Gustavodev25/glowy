import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Função para formatar endereço
export function formatarEndereco(endereco: any): string {
  // Se já é uma string, retorna como está
  if (typeof endereco === 'string') {
    return endereco;
  }

  // Se é um objeto, tenta extrair as informações
  if (typeof endereco === 'object' && endereco !== null) {
    const { logradouro, numero, bairro, localidade, uf, cep } = endereco;

    // Monta o endereço de forma legível
    const partes = [];

    if (logradouro) {
      let enderecoCompleto = logradouro;
      if (numero) {
        enderecoCompleto += `, ${numero}`;
      }
      partes.push(enderecoCompleto);
    }

    if (bairro) {
      partes.push(bairro);
    }

    if (localidade && uf) {
      partes.push(`${localidade}/${uf}`);
    } else if (localidade) {
      partes.push(localidade);
    }

    return partes.join(' - ');
  }

  // Se não conseguir formatar, retorna uma mensagem padrão
  return 'Endereço não informado';
}

// Função para processar endereço do banco (pode ser string JSON ou objeto)
export function processarEnderecoDoBanco(endereco: any): string {
  if (!endereco) return 'Endereço não informado';

  // Se é string JSON, faz o parse
  if (typeof endereco === 'string') {
    try {
      const parsed = JSON.parse(endereco);
      return formatarEndereco(parsed);
    } catch (error) {
      // Se não conseguir fazer parse, trata como string normal
      return endereco;
    }
  }

  // Se já é objeto, formata diretamente
  return formatarEndereco(endereco);
}