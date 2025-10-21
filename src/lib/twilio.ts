// lib/twilio.ts
// Lightweight helper to send WhatsApp messages via Twilio

export async function sendWhatsAppMessage(toE164: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
  const authToken = process.env.TWILIO_AUTH_TOKEN || "";
  const from = process.env.TWILIO_WHATSAPP_FROM || ""; // e.g., 'whatsapp:+14155238886' (sandbox) or your enabled number

  if (!accountSid || !authToken || !from) {
    throw new Error("Twilio env vars missing: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM");
  }

  // dynamic import to keep edge bundles lean when needed
  const mod: any = await import("twilio");
  const twilio = mod.default ?? mod;
  const client = twilio(accountSid, authToken);

  const to = toE164.startsWith("whatsapp:") ? toE164 : `whatsapp:${toE164}`;
  const fromWhats = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;

  const msg = await client.messages.create({ from: fromWhats, to, body });
  return msg.sid as string;
}

