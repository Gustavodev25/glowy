import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);

    if (!auth.authenticated) {
      return auth.response!;
    }

    const userId = auth.user.id;

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.tipoUsuario !== "dono") {
      return NextResponse.json(
        { error: "Usuário não encontrado ou não é dono" },
        { status: 403 }
      );
    }

    // Pega os dados do formulário
    const body = await req.json();
    console.log('[Onboarding] Dados recebidos:', body);

    const {
      companyName,
      businessType,
      description,
      phone,
      email,
      address,
      logoUrl,
      bannerUrl,
      services,
      businessHours,
      // Campos de documento (não usados no CompanySettings, mas podem ser úteis)
      tipoDocumento,
      documento,
      razaoSocial,
      nomeFantasia
    } = body;

    // Validação dos campos obrigatórios
    if (!companyName || !businessType) {
      return NextResponse.json(
        { error: "Nome da empresa e tipo de negócio são obrigatórios" },
        { status: 400 }
      );
    }

    // Converte o objeto address para string JSON
    const addressString = address ? JSON.stringify(address) : null;
    console.log('[Onboarding] Address string:', addressString);

    // Cria ou atualiza as configurações da empresa
    const companySettings = await prisma.companySettings.upsert({
      where: { userId },
      create: {
        userId,
        companyName,
        businessType,
        description: description || null,
        phone: phone || null,
        address: addressString,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
      },
      update: {
        companyName,
        businessType,
        description: description || null,
        phone: phone || null,
        address: addressString,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
      },
    });

    console.log('[Onboarding] CompanySettings criado/atualizado:', companySettings.id);

    // Remove serviços antigos e cria novos
    await prisma.service.deleteMany({
      where: { companyId: companySettings.id },
    });

    console.log('[Onboarding] Serviços recebidos:', services);

    if (services && services.length > 0) {
      const validServices = services.filter((s: any) => s.name && s.name.trim());
      console.log('[Onboarding] Serviços válidos:', validServices.length);

      if (validServices.length > 0) {
        const servicesToCreate = validServices.map((service: any) => {
          // Melhorar conversão de preço
          let price = null;
          if (service.price) {
            // Remove pontos de milhares e substitui vírgula por ponto
            const cleanPrice = service.price.replace(/\./g, '').replace(',', '.');
            price = parseFloat(cleanPrice);
            if (isNaN(price)) price = null;
          }

          return {
            companyId: companySettings.id,
            name: service.name.trim(),
            description: service.description || null,
            duration: parseInt(service.duration) || 30,
            price: price,
            imageUrl: service.imageUrl || null,
            active: true,
          };
        });

        console.log('[Onboarding] Serviços para criar:', servicesToCreate);

        await prisma.service.createMany({
          data: servicesToCreate,
        });

        console.log('[Onboarding] Serviços criados com sucesso');
      }
    }

    // Remove horários antigos e cria novos
    await prisma.businessHours.deleteMany({
      where: { companyId: companySettings.id },
    });

    console.log('[Onboarding] Horários recebidos:', businessHours);

    if (businessHours && businessHours.length > 0) {
      const validHours = businessHours.filter((h: any) => h.isOpen);
      console.log('[Onboarding] Horários válidos:', validHours.length);

      if (validHours.length > 0) {
        const hoursToCreate = validHours.map((hours: any) => ({
          companyId: companySettings.id,
          dayOfWeek: parseInt(hours.dayOfWeek),
          isOpen: hours.isOpen,
          openTime: hours.openTime,
          closeTime: hours.closeTime,
          breakStart: hours.breakStart || null,
          breakEnd: hours.breakEnd || null,
        }));

        console.log('[Onboarding] Horários para criar:', hoursToCreate);

        await prisma.businessHours.createMany({
          data: hoursToCreate,
        });

        console.log('[Onboarding] Horários criados com sucesso');
      }
    }

    // Marca o onboarding como completado
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });

    console.log('[Onboarding] Onboarding marcado como completado para usuário:', userId);

    return NextResponse.json({
      success: true,
      message: "Empresa configurada com sucesso",
      companyId: companySettings.id
    });
  } catch (error) {
    console.error("Erro ao completar onboarding:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configurações" },
      { status: 500 }
    );
  }
}
