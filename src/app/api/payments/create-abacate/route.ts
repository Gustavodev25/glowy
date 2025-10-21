import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { abacatePayService } from "@/lib/abacatepay";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { planId, billingType, pixData, cycle } = body as any;

    // Buscar plano
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.active) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 },
      );
    }

    // Buscar dados do usuário
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!userData) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    // Validar telefone obrigatório para AbacatePay
    if (!userData.telefone || userData.telefone.trim() === "") {
      return NextResponse.json(
        {
          error: "Telefone obrigatório",
          message:
            "Por favor, adicione seu telefone no perfil antes de continuar com o pagamento.",
          requiresPhone: true,
        },
        { status: 400 },
      );
    }

    // Determinar CPF do usuário ou do formulário PIX
    let taxId = (userData as any).cpf;

    if (!taxId && billingType === "PIX" && pixData?.cpf) {
      taxId = pixData.cpf.replace(/\D/g, "");
    }

    console.log("📋 Dados do pagamento:", {
      userId: user.userId,
      planId,
      billingType,
      cycle,
      taxId: taxId ? "***" : "não informado",
    });

    // Determinar ciclo e valor (mensal ou anual)
    const selectedCycle: "MONTHLY" | "YEARLY" =
      cycle === "YEARLY" ? "YEARLY" : "MONTHLY";
    const monthlyPrice = Number(plan.price);
    const amount =
      selectedCycle === "YEARLY"
        ? Number((monthlyPrice * 12 * 0.8).toFixed(2))
        : monthlyPrice;

    // Converter para centavos (AbacatePay usa centavos)
    const amountInCents = Math.round(amount * 100);

    // URL base da aplicação
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Criar billing no AbacatePay
    // AbacatePay usa ONE_TIME para pagamentos únicos e MULTIPLE_PAYMENTS para recorrentes
    const billing = await abacatePayService.createBilling({
      frequency: selectedCycle === "YEARLY" ? "ONE_TIME" : "MULTIPLE_PAYMENTS",
      methods: billingType === "PIX" ? ["PIX"] : ["PIX", "CARD"],
      products: [
        {
          externalId: plan.id,
          name: `Plano ${plan.name}`,
          description:
            plan.description ||
            `Assinatura ${selectedCycle === "MONTHLY" ? "mensal" : "anual"} do plano ${plan.name}`,
          quantity: 1,
          price: amountInCents,
        },
      ],
      returnUrl: `${baseUrl}/views/manager`,
      completionUrl: `${baseUrl}/views/manager?planActivated=true`,
      customer: {
        email: userData.email,
        name: userData.nome,
        cellphone: userData.telefone || undefined,
        taxId: taxId || undefined,
      },
      metadata: {
        userId: user.userId,
        planId: plan.id,
        cycle: selectedCycle,
      },
    });

    console.log("✅ Billing criado no AbacatePay:", {
      id: billing.id,
      url: billing.url,
      status: billing.status,
    });

    // Calcular data de renovação com base no ciclo
    const now = new Date();
    let nextDueDate: Date;

    if (selectedCycle === "YEARLY") {
      // Adicionar 1 ano
      nextDueDate = new Date(now);
      nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
    } else {
      // MONTHLY - Adicionar 1 mês
      nextDueDate = new Date(now);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }

    console.log("📅 Data de renovação calculada:", {
      cycle: selectedCycle,
      nextDueDate: nextDueDate.toISOString(),
    });

    // Criar assinatura no banco
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.userId,
        planId: plan.id,
        status: "pending",
        paymentType: billingType,
        cycle: selectedCycle,
        amount: amount,
        nextDueDate: nextDueDate,
        autoRenew: true,
        startDate: now,
        abacatePayId: billing.id, // ID do billing no AbacatePay
      },
    });

    // Criar pagamento no banco
    const payment = await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        abacatePayId: billing.id, // ID do billing no AbacatePay
        amount: amount,
        status: "PENDING",
        method: billingType,
        dueDate: new Date(billing.nextBilling || Date.now()),
        invoiceUrl: billing.url,
      },
    });

    // Retornar URL do checkout do AbacatePay
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      billingId: billing.id,
      checkoutUrl: billing.url,
      status: billing.status,
      subscriptionId: subscription.id,
      // Para PIX, redirecionar para a URL do AbacatePay que tem o QR Code
      redirectUrl: billing.url,
    });
  } catch (error: any) {
    console.error("❌ Erro ao criar pagamento:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar pagamento" },
      { status: 500 },
    );
  }
}
