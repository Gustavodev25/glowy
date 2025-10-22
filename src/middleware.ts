// middleware.ts (raiz do projeto)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    "/",
    "/login",
    "/cadastro",
    "/api/auth/login",
    "/api/auth/cadastro",
    "/api/auth/logout",
    "/api/", // Permitir todas as rotas de API passarem (autenticação é feita internamente)
  ];

  // Rotas que requerem autenticação
  const protectedRoutes = [
    "/dashboard",
    "/empresa",
    "/clientes",
    "/agendamentos",
    "/configuracoes",
  ];

  // Rotas exclusivas para donos
  const donoRoutes = [
    "/dashboard/dono",
    "/empresa/configurar",
    "/empresa/editar",
    "/servicos",
    "/funcionarios",
    "/relatorios",
  ];

  // Rotas exclusivas para usuários/clientes
  const usuarioRoutes = [
    "/dashboard/usuario",
    "/meus-agendamentos",
    "/agendar",
  ];

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar token de autenticação
  const token = request.cookies.get("auth")?.value;

  if (!token) {
    // Redirecionar para página inicial (login) se não estiver autenticado
    const url = new URL("/", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Verificar validade do token
  let payload: any;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload: jwtPayload } = await jwtVerify(token, secret);
    payload = jwtPayload;
  } catch (error) {
    // Token inválido, redirecionar para página inicial (login)
    const url = new URL("/", request.url);
    url.searchParams.set("redirect", pathname);
    url.searchParams.set("error", "session-expired");

    const response = NextResponse.redirect(url);
    // Limpar cookie inválido
    response.cookies.set("auth", "", { maxAge: 0 });
    return response;
  }

  // Verificar permissões baseadas no tipo de usuário
  const tipoUsuario = payload.tipoUsuario as "dono" | "usuario" | undefined;

  // Se for uma rota exclusiva de dono
  const isDonoRoute = donoRoutes.some((route) => pathname.startsWith(route));
  if (isDonoRoute && tipoUsuario !== "dono") {
    return NextResponse.redirect(new URL("/dashboard/usuario", request.url));
  }

  // Se for uma rota exclusiva de usuário
  const isUsuarioRoute = usuarioRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isUsuarioRoute && tipoUsuario !== "usuario") {
    return NextResponse.redirect(new URL("/dashboard/dono", request.url));
  }

  // Adicionar headers com informações do usuário para as páginas
  const response = NextResponse.next();
  response.headers.set("x-user-id", payload.sub as string);
  response.headers.set("x-user-email", payload.email as string);
  if (tipoUsuario) {
    response.headers.set("x-user-type", tipoUsuario);
  }

  return response;
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|assets/).*)",
  ],
};
