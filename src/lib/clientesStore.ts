export type Cliente = {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  cpf?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  agendamentos: any[];
  documentos: any[];
  respostasFormulario: any[];
  _count: {
    agendamentos: number;
    documentos: number;
    respostasFormulario: number;
  };
} & Record<string, any>;

const clientes: Cliente[] = [];

function genId(): string {
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      // @ts-ignore
      return crypto.randomUUID();
    }
  } catch {}
  return 'cl_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getClientes(): Cliente[] {
  return clientes;
}

export function findCliente(id: string): Cliente | undefined {
  return clientes.find(c => c.id === id);
}

export function createCliente(data: Partial<Cliente>): Cliente {
  const now = new Date().toISOString();
  const id = (data && data.id) ? String(data.id) : genId();
  const base: Cliente = {
    id,
    nome: String(data.nome || ''),
    email: data.email ? String(data.email) : undefined,
    telefone: String(data.telefone || ''),
    cpf: data.cpf ? String(data.cpf) : undefined,
    avatarUrl: data.avatarUrl ? String(data.avatarUrl) : undefined,
    createdAt: now,
    updatedAt: now,
    agendamentos: [],
    documentos: [],
    respostasFormulario: [],
    _count: {
      agendamentos: 0,
      documentos: 0,
      respostasFormulario: 0,
    },
  };

  const cliente: Cliente = {
    ...base,
    ...data,
    id: base.id,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
    agendamentos: base.agendamentos,
    documentos: base.documentos,
    respostasFormulario: base.respostasFormulario,
    _count: base._count,
  };

  clientes.push(cliente);
  return cliente;
}

export function updateCliente(id: string, data: Partial<Cliente>): Cliente | undefined {
  const existing = findCliente(id);
  if (!existing) return undefined;
  const now = new Date().toISOString();
  existing.nome = data.nome !== undefined ? String(data.nome) : existing.nome;
  existing.email = data.email !== undefined ? String(data.email) : existing.email;
  existing.telefone = data.telefone !== undefined ? String(data.telefone) : existing.telefone;
  existing.cpf = data.cpf !== undefined ? String(data.cpf) : existing.cpf;
  existing.avatarUrl = data.avatarUrl !== undefined ? String(data.avatarUrl) : existing.avatarUrl;
  existing.updatedAt = now;
  return existing;
}

export function deleteCliente(id: string): boolean {
  const idx = clientes.findIndex(c => c.id === id);
  if (idx === -1) return false;
  clientes.splice(idx, 1);
  return true;
}

