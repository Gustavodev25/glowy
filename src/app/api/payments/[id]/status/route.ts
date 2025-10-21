import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { abacatePayService } from "@/lib/abacatepay";
import { verifyAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    console.log("🔍 Verificando status do pagamento...");

    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // No Next.js 15+, params é uma Promise
    const resolvedParams = await params;
    const paymentId = resolvedParams.id;

    console.log("📋 Payment ID recebido:", paymentId);

    // Buscar pagamento no banco
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 },
      );
    }

    // Verificar se o pagamento pertence ao usuário
    if (payment.subscription.userId !== user.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Se o pagamento já foi recebido, retornar status direto
    if (payment.status === "RECEIVED" || payment.status === "CONFIRMED") {
      return NextResponse.json({
        status: payment.status,
        paymentDate: payment.paymentDate,
        message: "Pagamento confirmado!",
      });
    }

    // Se for PIX, verificar status na API do AbacatePay
    if (payment.method === "PIX" && payment.abacatePayId) {
      try {
        const pixStatus = await abacatePayService.getPixQrCodeStatus(
          payment.abacatePayId,
        );

        console.log("📊 Status do PIX no AbacatePay:", {
          id: pixStatus.id,
          status: pixStatus.status,
          fullResponse: pixStatus,
        });

        // Verificar todos os possíveis valores de status pago
        const isPaid =
          pixStatus.status &&
          (pixStatus.status.toUpperCase() === "PAID" ||
            pixStatus.status.toUpperCase() === "COMPLETED" ||
            pixStatus.status.toUpperCase() === "CONFIRMED");

        // Se o status mudou para PAID
        if (isPaid) {
          // Atualizar pagamento no banco
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "RECEIVED",
              paymentDate: new Date(),
            },
          });

          // Atualizar assinatura para ativa
          await prisma.subscription.update({
            where: { id: payment.subscriptionId },
            data: {
              status: "active",
            },
          });

          console.log("✅ Pagamento PIX confirmado via polling!");

          return NextResponse.json({
            status: "RECEIVED",
            paymentDate: new Date(),
            message: "Pagamento confirmado!",
          });
        }

        // Status ainda pendente
        return NextResponse.json({
          status: pixStatus.status || "PENDING",
          message: "Aguardando pagamento...",
        });
      } catch (error: any) {
        console.error("❌ Erro ao verificar status do PIX:", error);
        // Se houver erro na API, retornar status do banco
        return NextResponse.json({
          status: payment.status,
          message: "Aguardando confirmação...",
        });
      }
    }

    // Para outros métodos, retornar status do banco
    return NextResponse.json({
      status: payment.status,
      paymentDate: payment.paymentDate,
    });
  } catch (error: any) {
    console.error("❌ Erro ao verificar status do pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao verificar status do pagamento" },
      { status: 500 },
    );
  }
}
