// lib/auth.ts
import { SignJWT, jwtVerify } from "jose";

// Lazy initialization to avoid build-time errors
function getSecretKey() {
  const SECRET = process.env.JWT_SECRET;
  if (!SECRET) {
    throw new Error("JWT_SECRET não configurado");
  }
  return new TextEncoder().encode(SECRET);
}

// Hash de senha usando bcryptjs em todos os ambientes
// Isso garante compatibilidade entre desenvolvimento e produção
async function getHasher() {
  const bcrypt = await import('bcryptjs');
  return {
    hash: async (plain: string) => bcrypt.hash(plain, 12),
    verify: async (hash: string, plain: string) => bcrypt.compare(plain, hash)
  };
}

export async function hashPassword(plain: string) {
  const hasher = await getHasher();
  return hasher.hash(plain);
}

export async function verifyPassword(plain: string, hash: string) {
  try {
    const hasher = await getHasher();
    return await hasher.verify(hash, plain);
  } catch (error) {
    console.error('[verifyPassword] Error:', error);
    return false;
  }
}

export async function signJwt(payload: Record<string, any>, expiresIn = "7d") {
  const secretKey = getSecretKey();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function verifyJwt<T = any>(token: string): Promise<T | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as T;
  } catch {
    return null;
  }
}

export function setAuthCookie(
  res: import("next/server").NextResponse,
  token: string,
  maxAgeSec = 60 * 60 * 24 * 7
) {
  res.cookies.set({
    name: "auth",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSec,
  });
}

// Mitiga enumera��ǜo: atraso ~300ms consistente
export async function uniformDelay(ms = 300) {
  await new Promise((r) => setTimeout(r, ms));
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase().normalize("NFKC");
}

export function getClientIp(
  req: Request | import("next/server").NextRequest
) {
  // NextRequest tem .ip em alguns hosts; XFF funciona na maioria
  const xff = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  // @ts-ignore
  return xff || (req as any).ip || "unknown";
}

export async function getUserFromCookie(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const token = cookies.auth;
  if (!token) return null;

  const payload = await verifyJwt<{ userId: string }>(token);
  if (!payload?.userId) return null;

  const { prisma } = await import("./prisma");
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      nome: true,
      email: true,
      tipoUsuario: true,
    },
  });

  return user;
}

// Função auxiliar para verificar autenticação em rotas de API
export async function verifyAuth(req: Request | import("next/server").NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      console.error('[verifyAuth] No cookie header found');
      return null;
    }

    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const token = cookies.auth;

    if (!token) {
      console.error('[verifyAuth] No auth token found in cookies');
      return null;
    }

    const payload = await verifyJwt<any>(token);

    if (!payload) {
      console.error('[verifyAuth] Failed to verify JWT');
      return null;
    }

    // Log para debug - ver o que vem no payload
    console.log('[verifyAuth] Token payload received:', {
      hasUserId: !!payload.userId,
      hasSub: !!payload.sub,
      keys: Object.keys(payload),
      sub: payload.sub,
      userId: payload.userId
    });

    // O JWT pode ter userId ou sub (subject)
    const userId = payload.userId || payload.sub;

    if (!userId) {
      console.error('[verifyAuth] No userId or sub found. Full payload:', JSON.stringify(payload, null, 2));
      return null;
    }

    console.log('[verifyAuth] User authenticated successfully. userId:', userId);
    return { userId, email: payload.email, tipoUsuario: payload.tipoUsuario };
  } catch (error) {
    console.error('[verifyAuth] Error:', error);
    return null;
  }
}

