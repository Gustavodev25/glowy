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
    const { planId, cycle, cpf } = body;

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

    // Validar telefone obrigatório
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

    // Validar CPF obrigatório
    if (!cpf || cpf.trim() === "") {
      return NextResponse.json(
        { error: "CPF obrigatório para pagamento PIX" },
        { status: 400 },
      );
    }

    console.log("📋 Dados do pagamento PIX:", {
      userId: user.userId,
      planId,
      cycle,
      cpf: "***",
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

    // Formatar telefone para E.164 se necessário
    let formattedPhone = userData.telefone.replace(/\D/g, "");
    if (!formattedPhone.startsWith("55")) {
      formattedPhone = "55" + formattedPhone;
    }

    // Criar QR Code PIX no AbacatePay
    console.log("📤 Criando QR Code PIX no AbacatePay...");
    const pixQrCode = await abacatePayService.createPixQrCode({
      amount: amountInCents,
      expiresIn: 3600, // 1 hora
      description: `Plano ${plan.name} - ${selectedCycle === "MONTHLY" ? "Mensal" : "Anual"}`,
      customer: {
        name: userData.nome,
        cellphone: formattedPhone,
        email: userData.email,
        taxId: cpf.replace(/\D/g, ""),
      },
      metadata: {
        userId: user.userId,
        planId: plan.id,
        cycle: selectedCycle,
      },
    });

    console.log("✅ QR Code PIX criado com sucesso!");
    console.log("📊 Detalhes do PIX:", {
      id: pixQrCode.id,
      status: pixQrCode.status,
      expiresAt: pixQrCode.expiresAt,
      amount: amountInCents,
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
        paymentType: "PIX",
        cycle: selectedCycle,
        amount: amount,
        nextDueDate: nextDueDate,
        autoRenew: true,
        startDate: now,
        abacatePayId: pixQrCode.id, // ID do PIX no AbacatePay
      },
    });

    // Criar pagamento no banco
    console.log("💾 Salvando pagamento no banco de dados...");
    const payment = await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        abacatePayId: pixQrCode.id,
        amount: amount,
        status: "PENDING",
        method: "PIX",
        dueDate: new Date(pixQrCode.expiresAt || Date.now() + 3600000),
        pixQrCode: pixQrCode.brCodeBase64,
        pixCopyPaste: pixQrCode.brCode,
      },
    });

    console.log("✅ Pagamento salvo com sucesso!");
    console.log("📋 Informações importantes:");
    console.log("  - Payment ID:", payment.id);
    console.log("  - AbacatePay PIX ID:", pixQrCode.id);
    console.log("  - Subscription ID:", subscription.id);
    console.log("");
    console.log("⏰ Para testar o pagamento:");
    console.log("  1. Vá ao painel do AbacatePay: https://app.abacatepay.com/");
    console.log("  2. Navegue até 'PIX QR Codes' ou 'Pagamentos'");
    console.log("  3. Encontre o PIX com ID:", pixQrCode.id);
    console.log("  4. Clique em 'Simular Pagamento'");
    console.log("  5. O webhook será disparado automaticamente!");
    console.log("");

    // Retornar dados do PIX para exibir na tela
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      pixQrCodeId: pixQrCode.id,
      subscriptionId: subscription.id,
      pix: {
        qrCode: pixQrCode.brCodeBase64, // QR Code em base64
        copyPaste: pixQrCode.brCode, // Código copia e cola
        expiresAt: pixQrCode.expiresAt,
        amount: amount,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro ao criar pagamento PIX:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar pagamento" },
      { status: 500 },
    );
  }
}
