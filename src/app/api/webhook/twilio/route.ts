// app/api/webhook/twilio/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();

    // Log para debug
    console.log("Webhook Twilio recebido:", {
      messageSid: body.get("MessageSid"),
      from: body.get("From"),
      to: body.get("To"),
      body: body.get("Body"),
      status: body.get("MessageStatus"),
    });

    // Para webhooks de status de mensagem
    const messageSid = body.get("MessageSid");
    const messageStatus = body.get("MessageStatus");

    if (messageSid && messageStatus) {
      console.log(`Status da mensagem ${messageSid}: ${messageStatus}`);

      // Aqui você pode salvar o status no banco de dados se necessário
      // await prisma.messageStatus.create({
      //   data: {
      //     messageSid: messageSid as string,
      //     status: messageStatus as string,
      //     timestamp: new Date(),
      //   }
      // });
    }

    // Para mensagens recebidas (se você quiser responder automaticamente)
    const from = body.get("From");
    const messageBody = body.get("Body");

    if (from && messageBody) {
      console.log(`Mensagem recebida de ${from}: ${messageBody}`);

      // Aqui você pode implementar lógica para responder automaticamente
      // ou processar mensagens recebidas
    }

    // Resposta obrigatória para o Twilio
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Erro no webhook do Twilio:", error);
    return new NextResponse("Error", { status: 500 });
  }
}

// Também aceitar GET para verificação
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Webhook Twilio funcionando",
    timestamp: new Date().toISOString()
  });
}



