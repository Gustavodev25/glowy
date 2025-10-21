// lib/otp.ts
import { hashPassword, verifyPassword } from "@/lib/auth";

export function generateNumericOtp(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const n = Math.floor(Math.random() * (max - min + 1)) + min;
  return String(n);
}

export async function hashOtp(code: string) {
  return hashPassword(code);
}

export async function verifyOtp(code: string, hash: string) {
  return verifyPassword(code, hash);
}

