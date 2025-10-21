import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasAsaasApiKey: !!process.env.ASAAS_API_KEY,
    asaasApiKeyPrefix: process.env.ASAAS_API_KEY?.substring(0, 20) || 'NOT_FOUND',
    asaasEnv: process.env.ASAAS_ENV || 'NOT_SET',
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
  });
}
