// middleware/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    tipoUsuario?: "dono" | "usuario";
  };
}

/**
 * Middleware para autenticar requisições
 * Verifica o token JWT e adiciona informações do usuário na requisição
 */
export async function authMiddleware(
  request: NextRequest
): Promise<{ authenticated: boolean; user: any; response?: NextResponse }> {
  const token = request.cookies.get("auth")?.value;

  if (!token) {
    return {
      authenticated: false,
      user: null,
      response: NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      ),
    };
  }

  const payload = await verifyJwt(token);

  if (!payload) {
    return {
      authenticated: false,
      user: null,
      response: NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      ),
    };
  }

  return {
    authenticated: true,
    user: {
      id: payload.sub,
      email: payload.email,
      tipoUsuario: payload.tipoUsuario,
    },
  };
}

/**
 * Middleware para verificar se o usuário é dono de empresa
 */
export async function requireDono(
  request: NextRequest
): Promise<{ authorized: boolean; user: any; response?: NextResponse }> {
  const auth = await authMiddleware(request);

  if (!auth.authenticated) {
    return {
      authorized: false,
      user: null,
      response: auth.response,
    };
  }

  if (auth.user.tipoUsuario !== "dono") {
    // Fallback: consulta banco para evitar falhas com token desatualizado
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: auth.user.id },
        select: { id: true, email: true, tipoUsuario: true },
      });
      if (dbUser?.tipoUsuario === "dono") {
        return { authorized: true, user: { ...auth.user, tipoUsuario: "dono" } };
      }
    } catch {}
    return {
      authorized: false,
      user: auth.user,
      response: NextResponse.json(
        { error: "Acesso negado. Apenas donos de empresa podem acessar este recurso." },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: auth.user,
  };
}

/**
 * Middleware para verificar se o usuário é cliente/usuário
 */
export async function requireUsuario(
  request: NextRequest
): Promise<{ authorized: boolean; user: any; response?: NextResponse }> {
  const auth = await authMiddleware(request);

  if (!auth.authenticated) {
    return {
      authorized: false,
      user: null,
      response: auth.response,
    };
  }

  if (auth.user.tipoUsuario !== "usuario") {
    return {
      authorized: false,
      user: auth.user,
      response: NextResponse.json(
        { error: "Acesso negado. Apenas usuários/clientes podem acessar este recurso." },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: auth.user,
  };
}

/**
 * Middleware para verificar se o usuário é dono OU profissional da empresa
 * Retorna a empresa do usuário (seja ele dono ou profissional)
 */
export async function requireDonoOrProfissional(
  request: NextRequest
): Promise<{
  authorized: boolean;
  user: any;
  empresa: any | null;
  response?: NextResponse
}> {
  const auth = await authMiddleware(request);

  if (!auth.authenticated) {
    return {
      authorized: false,
      user: null,
      empresa: null,
      response: auth.response,
    };
  }

  // Verifica se é dono ou profissional
  if (auth.user.tipoUsuario !== "dono" && auth.user.tipoUsuario !== "usuario") {
    return {
      authorized: false,
      user: auth.user,
      empresa: null,
      response: NextResponse.json(
        { error: "Acesso negado. Apenas donos ou profissionais podem acessar este recurso." },
        { status: 403 }
      ),
    };
  }

  try {
    let empresa = null;

    if (auth.user.tipoUsuario === "dono") {
      // Se é dono, busca a empresa onde ele é o dono
      empresa = await prisma.empresa.findFirst({
        where: { donoId: auth.user.id },
        select: {
          id: true,
          nomeEmpresa: true,
          donoId: true,
          logoUrl: true,
          telefone: true,
          email: true,
        },
      });
    } else if (auth.user.tipoUsuario === "usuario") {
      // Se é profissional, busca a empresa através da tabela funcionario
      const funcionario = await prisma.funcionario.findFirst({
        where: { userId: auth.user.id },
        include: {
          empresa: {
            select: {
              id: true,
              nomeEmpresa: true,
              donoId: true,
              logoUrl: true,
              telefone: true,
              email: true,
            },
          },
        },
      });
      empresa = funcionario?.empresa || null;
    }

    if (!empresa) {
      return {
        authorized: false,
        user: auth.user,
        empresa: null,
        response: NextResponse.json(
          { error: "Empresa não encontrada para este usuário." },
          { status: 404 }
        ),
      };
    }

    return {
      authorized: true,
      user: auth.user,
      empresa,
    };
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return {
      authorized: false,
      user: auth.user,
      empresa: null,
      response: NextResponse.json(
        { error: "Erro ao buscar dados da empresa." },
        { status: 500 }
      ),
    };
  }
}

/**
 * Helper para extrair informações do usuário autenticado de uma requisição
 */
export async function getUserFromRequest(request: NextRequest) {
  const auth = await authMiddleware(request);
  return auth.authenticated ? auth.user : null;
}
