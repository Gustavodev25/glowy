import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Ler o corpo da requisição
    const body = await request.text();
    const data = JSON.parse(body);

    console.log("🥑 Webhook AbacatePay recebido (RAW):", body);
    console.log("🥑 Webhook AbacatePay recebido (PARSED):", {
      event: data.event,
      id: data.id,
      status: data.status,
      fullData: data,
    });

    // Eventos suportados pelo AbacatePay:
    // - pixQrCode.paid: Quando um PIX QR Code é pago
    // - billing.paid: Quando um billing (cartão) é pago
    // - billing.cancelled: Quando um billing é cancelado
    // - billing.expired: Quando um billing expira

    switch (data.event) {
      case "pixQrCode.paid":
        await handlePixPaid(data);
        break;

      case "billing.paid":
        await handleBillingPaid(data);
        break;

      case "billing.cancelled":
        await handleBillingCancelled(data);
        break;

      case "billing.expired":
        await handleBillingExpired(data);
        break;

      default:
        console.log("⚠️ Evento não reconhecido:", data.event);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Erro ao processar webhook AbacatePay:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 },
    );
  }
}

/**
 * Processar pagamento PIX confirmado
 */
async function handlePixPaid(data: any) {
  console.log("✅ PIX pago! Dados completos:", JSON.stringify(data, null, 2));

  try {
    // O ID pode vir em data.id ou data.data.id dependendo da versão da API
    const pixId = data.id || data.data?.id;

    if (!pixId) {
      console.error("❌ ID do PIX não encontrado no webhook:", data);
      return;
    }

    console.log("🔍 Procurando pagamento com abacatePayId:", pixId);

    // Buscar pagamento pelo abacatePayId
    const payment = await prisma.payment.findUnique({
      where: { abacatePayId: pixId },
      include: { subscription: true },
    });

    if (!payment) {
      console.error("❌ Pagamento não encontrado para PIX ID:", pixId);

      // Tentar buscar também pelo subscriptionId se estiver presente
      if (data.metadata?.subscriptionId) {
        console.log(
          "🔍 Tentando buscar por metadata.subscriptionId:",
          data.metadata.subscriptionId,
        );
        const paymentByMetadata = await prisma.payment.findFirst({
          where: {
            subscriptionId: data.metadata.subscriptionId,
            status: "PENDING",
          },
          include: { subscription: true },
          orderBy: { createdAt: "desc" },
        });

        if (paymentByMetadata) {
          console.log("✅ Pagamento encontrado via metadata!");
          await updatePaymentAndSubscription(paymentByMetadata);
          return;
        }
      }

      return;
    }

    console.log("📋 Atualizando pagamento:", payment.id);
    await updatePaymentAndSubscription(payment);
  } catch (error) {
    console.error("❌ Erro ao processar PIX pago:", error);
    throw error;
  }
}

/**
 * Atualizar pagamento e assinatura
 */
async function updatePaymentAndSubscription(payment: any) {
  // Atualizar status do pagamento
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "RECEIVED",
      paymentDate: new Date(),
    },
  });

  // Atualizar status da assinatura para ativa
  await prisma.subscription.update({
    where: { id: payment.subscriptionId },
    data: {
      status: "active",
    },
  });

  console.log("✅ Pagamento e assinatura atualizados com sucesso!");
}

/**
 * Processar billing (cartão) confirmado
 */
async function handleBillingPaid(data: any) {
  console.log(
    "✅ Billing pago! Dados completos:",
    JSON.stringify(data, null, 2),
  );

  try {
    // Verificar se é um pagamento PIX (AbacatePay envia billing.paid para PIX também)
    if (data.data?.pixQrCode) {
      console.log("🔍 Detectado pagamento PIX dentro de billing.paid");
      const pixData = data.data.pixQrCode;
      const pixId = pixData.id;

      console.log("📋 PIX ID:", pixId);

      // Buscar pagamento pelo abacatePayId do PIX
      const payment = await prisma.payment.findUnique({
        where: { abacatePayId: pixId },
        include: { subscription: true },
      });

      if (!payment) {
        console.error("❌ Pagamento não encontrado para PIX ID:", pixId);

        // Tentar buscar pelo metadata
        if (pixData.metadata?.userId) {
          console.log("🔍 Tentando buscar por metadata:", pixData.metadata);
          const paymentByMetadata = await prisma.payment.findFirst({
            where: {
              method: "PIX",
              status: "PENDING",
            },
            include: { subscription: true },
            orderBy: { createdAt: "desc" },
          });

          if (
            paymentByMetadata &&
            paymentByMetadata.subscription.userId === pixData.metadata.userId
          ) {
            console.log("✅ Pagamento encontrado via metadata!");
            await updatePaymentAndSubscription(paymentByMetadata);
            return;
          }
        }

        return;
      }

      console.log("📋 Atualizando pagamento PIX:", payment.id);
      await updatePaymentAndSubscription(payment);
      return;
    }

    // Se não for PIX, processar como billing normal (cartão)
    console.log("💳 Processando billing de cartão...");

    // Buscar assinatura pelo abacatePayId
    const subscription = await prisma.subscription.findUnique({
      where: { abacatePayId: data.id },
      include: { payments: true },
    });

    if (!subscription) {
      console.error("❌ Assinatura não encontrada para Billing ID:", data.id);
      return;
    }

    console.log("📋 Atualizando assinatura:", subscription.id);

    // Buscar o pagamento pendente mais recente
    const payment = await prisma.payment.findFirst({
      where: {
        subscriptionId: subscription.id,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    if (payment) {
      // Atualizar status do pagamento
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "RECEIVED",
          paymentDate: new Date(),
        },
      });
    }

    // Atualizar status da assinatura para ativa
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "active",
      },
    });

    console.log("✅ Billing e assinatura atualizados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao processar billing pago:", error);
    throw error;
  }
}

/**
 * Processar billing cancelado
 */
async function handleBillingCancelled(data: any) {
  console.log("⚠️ Billing cancelado! ID:", data.id);

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { abacatePayId: data.id },
    });

    if (!subscription) {
      console.error("❌ Assinatura não encontrada para Billing ID:", data.id);
      return;
    }

    // Atualizar status da assinatura para cancelada
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });

    console.log("✅ Assinatura cancelada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao processar billing cancelado:", error);
    throw error;
  }
}

/**
 * Processar billing expirado
 */
async function handleBillingExpired(data: any) {
  console.log("⏰ Billing expirado! ID:", data.id);

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { abacatePayId: data.id },
    });

    if (!subscription) {
      console.error("❌ Assinatura não encontrada para Billing ID:", data.id);
      return;
    }

    // Atualizar status da assinatura para suspensa
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "suspended",
      },
    });

    console.log("✅ Assinatura suspensa por expiração!");
  } catch (error) {
    console.error("❌ Erro ao processar billing expirado:", error);
    throw error;
  }
}
