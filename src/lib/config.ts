// lib/config.ts
// Configuração centralizada para funcionar em localhost e produção

export const isProduction = process.env.NODE_ENV === 'production';
export const isServer = typeof window === 'undefined';

// URL base da API
export const API_BASE_URL = isServer
  ? process.env.NEXT_PUBLIC_API_URL || (isProduction ? 'https://glowy-six.vercel.app' : 'http://localhost:3000')
  : ''; // No cliente, usar relative URLs

// URL pública do site
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (isProduction ? 'https://glowy-six.vercel.app' : 'http://localhost:3000');

// Configuração do banco de dados
export const DATABASE_URL = process.env.DATABASE_URL;

// Configuração de JWT
export const JWT_SECRET = process.env.JWT_SECRET;

// Configuração de pagamentos
export const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
export const ASAAS_SANDBOX = process.env.ASAAS_SANDBOX === 'true';
export const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY;

// Configuração de WhatsApp/Twilio
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

// Configuração de uploads
export const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Helper para construir URLs de API
export function getApiUrl(path: string): string {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  if (isServer) {
    return `${API_BASE_URL}${path}`;
  }

  // No cliente, usar relative URLs
  return path;
}

// Helper para verificar se estamos no Vercel
export function isVercel(): boolean {
  return process.env.VERCEL === '1';
}

// Helper para logs de debug
export function debugLog(message: string, data?: any) {
  if (!isProduction || process.env.DEBUG === 'true') {
    console.log(`[DEBUG] ${message}`, data || '');
  }
}
