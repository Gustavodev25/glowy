// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth")?.value;
  if (token) {
    try {
      await prisma.session.deleteMany({ where: { token } });
    } catch {}
  }
  const res = NextResponse.json({ message: "OK" }, { status: 200 });
  res.cookies.set({ name: "auth", value: "", path: "/", httpOnly: true, maxAge: 0 });
  return res;
}

