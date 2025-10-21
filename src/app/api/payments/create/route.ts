import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { asaasService } from '@/lib/asaas';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, billingType, creditCardData, pixData, cycle, saveCardAsDefault } = body as any;

    // Buscar plano
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.active) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    // Buscar dados do usuário
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Determinar CPF: do usuário, do cartão ou do formulário PIX
    let cpfCnpj = (userData as any).cpf;

    console.log('🔍 Debug CPF:', {
      userCpf: (userData as any).cpf,
      billingType,
      creditCardCpf: creditCardData?.cpfCnpj,
      pixCpf: pixData?.cpf,
      hasPixData: !!pixData,
      pixDataKeys: pixData ? Object.keys(pixData) : [],
    });

    if (!cpfCnpj && billingType === 'CREDIT_CARD' && creditCardData?.cpfCnpj) {
      cpfCnpj = creditCardData.cpfCnpj.replace(/\D/g, '');
    } else if (!cpfCnpj && billingType === 'PIX' && pixData?.cpf) {
      cpfCnpj = pixData.cpf.replace(/\D/g, '');
    }

    console.log('📋 CPF final:', cpfCnpj);

    // Criar ou buscar cliente no Asaas
    let asaasCustomerId = (userData as any).asaasCustomerId;

    if (!asaasCustomerId) {
      const asaasCustomer = await asaasService.createCustomer({
        name: userData.nome,
        email: userData.email,
        cpfCnpj: cpfCnpj,
        phone: userData.telefone || undefined,
      });
      asaasCustomerId = asaasCustomer.id;

      // Salvar ID do cliente Asaas no banco
      await prisma.user.update({
        where: { id: user.userId },
        data: { asaasCustomerId: asaasCustomerId } as any,
      });
    } else {
      // Verificar se o cliente ainda existe no Asaas
      console.log('🔍 Verificando cliente existente:', asaasCustomerId);
      const existingCustomer = await asaasService.getCustomer(asaasCustomerId);

      if (!existingCustomer || existingCustomer.deleted) {
        // Cliente foi removido, criar um novo
        console.log('⚠️ Cliente removido ou inexistente, criando novo cliente');
        const asaasCustomer = await asaasService.createCustomer({
          name: userData.nome,
          email: userData.email,
          cpfCnpj: cpfCnpj,
          phone: userData.telefone || undefined,
        });
        asaasCustomerId = asaasCustomer.id;

        // Atualizar ID do cliente no banco
        await prisma.user.update({
          where: { id: user.userId },
          data: { asaasCustomerId: asaasCustomerId } as any,
        });
      } else if (cpfCnpj) {
        // Cliente existe, atualizar com CPF se fornecido
        console.log('🔄 Atualizando cliente existente com CPF');
        await asaasService.updateCustomer(asaasCustomerId, {
          cpfCnpj: cpfCnpj,
        });
      }
    }

    // Calcular data de vencimento (hoje + 3 dias)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // Determinar ciclo e valor (mensal ou anual)
    const selectedCycle: 'MONTHLY' | 'YEARLY' = cycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY';
    const monthlyPrice = Number(plan.price);
    const amount = selectedCycle === 'YEARLY' ? Number((monthlyPrice * 12 * 0.8).toFixed(2)) : monthlyPrice;

    // Criar cobrança no Asaas
    const paymentData: any = {
      customer: asaasCustomerId,
      billingType: billingType,
      value: amount,
      dueDate: dueDateStr,
      description: `Plano ${plan.name} - Booky`,
      externalReference: user.userId,
    };

    // Se for cartão de crédito, adicionar dados do cartão
    if (billingType === 'CREDIT_CARD' && creditCardData) {
      paymentData.creditCard = {
        holderName: creditCardData.holderName,
        number: creditCardData.number.replace(/\s/g, ''),
        expiryMonth: creditCardData.expiryMonth,
        expiryYear: creditCardData.expiryYear,
        ccv: creditCardData.ccv,
      };
      paymentData.creditCardHolderInfo = {
        name: creditCardData.holderName,
        email: userData.email,
        cpfCnpj: creditCardData.cpfCnpj.replace(/\D/g, ''),
        postalCode: creditCardData.postalCode.replace(/\D/g, ''),
        addressNumber: creditCardData.addressNumber,
        phone: userData.telefone?.replace(/\D/g, '') || '',
      };
    }

    const asaasPayment = await asaasService.createPayment(paymentData);

    // Criar assinatura no banco
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.userId,
        planId: plan.id,
        status: 'pending',
        paymentType: billingType,
        cycle: selectedCycle,
        amount: amount,
        nextDueDate: null,
        autoRenew: true,
      },
    });

    // Criar pagamento no banco
    const payment = await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        asaasId: asaasPayment.id,
        amount: amount,
        status: asaasPayment.status,
        method: billingType,
        dueDate: new Date(asaasPayment.dueDate),
        invoiceUrl: asaasPayment.invoiceUrl,
      },
    });

    // Se for cartão e usuário optou por salvar como padrão, persistir método
    if (billingType === 'CREDIT_CARD' && creditCardData && saveCardAsDefault) {
      const last4 = creditCardData.number?.replace(/\D/g, '')?.slice(-4) || null;
      const brand = detectCardBrand(creditCardData.number || '');
      const expMonth = Number(creditCardData.expiryMonth || 0) || null;
      const expYear = Number(creditCardData.expiryYear || 0) || null;

      // Desmarcar outros como padrão e salvar este como padrão
      await prisma.$transaction([
        prisma.paymentMethod.updateMany({
          where: { userId: user.userId },
          data: { isDefault: false },
        }),
        prisma.paymentMethod.create({
          data: {
            userId: user.userId,
            type: 'CREDIT_CARD',
            brand: brand,
            last4: last4,
            expMonth: expMonth as any,
            expYear: expYear as any,
            asaasCardToken: null, // opcional: integrar tokenização ASAAS no futuro
            isDefault: true,
          },
        }),
      ]);
    }

    // Se for PIX, buscar QR Code
    let pixQrCodeData = null;
    if (billingType === 'PIX') {
      const pixQrCode = await asaasService.getPixQrCode(asaasPayment.id);
      pixQrCodeData = {
        qrCode: pixQrCode.encodedImage,
        copyPaste: pixQrCode.payload,
      };

      // Atualizar pagamento com dados do PIX
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          pixQrCode: pixQrCode.encodedImage,
          pixCopyPaste: pixQrCode.payload,
        },
      });
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      asaasPaymentId: asaasPayment.id,
      status: asaasPayment.status,
      invoiceUrl: asaasPayment.invoiceUrl,
      pix: pixQrCodeData,
      subscriptionId: subscription.id,
    });

  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}

// Detect brand from card number (simple BIN patterns)
function detectCardBrand(number: string): string | null {
  const n = (number || '').replace(/\s|-/g, '');
  if (/^4\d{12}(\d{3})?(\d{3})?$/.test(n)) return 'Visa';
  if (/^5[1-5]\d{14}$/.test(n)) return 'Mastercard';
  if (/^3[47]\d{13}$/.test(n)) return 'American Express';
  if (/^3(0[0-5]|[68])\d{11}$/.test(n)) return 'Diners Club';
  if (/^6(?:011|5\d{2})\d{12}$/.test(n)) return 'Discover';
  if (/^(?:2131|1800|35\d{3})\d{11}$/.test(n)) return 'JCB';
  return null;
}
