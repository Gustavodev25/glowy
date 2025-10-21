import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

const isSandbox = process.env.ASAAS_ENV !== "production";
const ASAAS_TEST_CARDS = new Set([
  "4444444444444444",
  "5184019740373151",
  "4916561358240741",
]);

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const methods = await prisma.paymentMethod.findMany({
      where: { userId: user.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      methods: methods.map((m) => ({
        id: m.id,
        type: m.type,
        brand: m.brand,
        last4: m.last4,
        expMonth: m.expMonth,
        expYear: m.expYear,
        isDefault: m.isDefault,
      })),
    });
  } catch (e) {
    console.error("Erro ao listar métodos de pagamento:", e);
    return NextResponse.json(
      { error: "Erro ao listar métodos" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const {
      type,
      holderName,
      number,
      expiryMonth,
      expiryYear,
      ccv,
      setDefault,
    } = body || {};

    if (type !== "CREDIT_CARD") {
      return NextResponse.json(
        { error: "Tipo de método inválido" },
        { status: 400 },
      );
    }
    if (!holderName || !number || !expiryMonth || !expiryYear || !ccv) {
      return NextResponse.json(
        { error: "Dados do cartão incompletos" },
        { status: 400 },
      );
    }

    const digits = String(number).replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) {
      return NextResponse.json(
        { error: "Número do cartão inválido" },
        { status: 400 },
      );
    }
    if (!luhnCheck(digits)) {
      if (!(isSandbox && ASAAS_TEST_CARDS.has(digits))) {
        return NextResponse.json(
          { error: "Número do cartão inválido" },
          { status: 400 },
        );
      }
    }

    const brand = detectCardBrand(digits) || null;
    const last4 = digits.slice(-4);
    const expMonth = parseInt(String(expiryMonth), 10) || 0;
    const expYearRaw = parseInt(String(expiryYear), 10) || 0;
    if (!(expMonth >= 1 && expMonth <= 12)) {
      return NextResponse.json(
        { error: "Mês de expiração inválido" },
        { status: 400 },
      );
    }
    const now = new Date();
    const expYear = expYearRaw < 100 ? 2000 + expYearRaw : expYearRaw;
    if (expYear < now.getFullYear() || expYear > now.getFullYear() + 25) {
      return NextResponse.json(
        { error: "Ano de expiração inválido" },
        { status: 400 },
      );
    }
    const exp = new Date(expYear, expMonth - 1, 1);
    exp.setMonth(exp.getMonth() + 1);
    if (exp <= now) {
      return NextResponse.json({ error: "Cartão expirado" }, { status: 400 });
    }
    const ccvDigits = String(ccv || "").replace(/\D/g, "");
    if (brand === "American Express") {
      if (ccvDigits.length !== 4)
        return NextResponse.json({ error: "CVV inválido" }, { status: 400 });
    } else {
      if (ccvDigits.length !== 3)
        return NextResponse.json({ error: "CVV inválido" }, { status: 400 });
    }

    await prisma.$transaction([
      ...(setDefault
        ? [
            prisma.paymentMethod.updateMany({
              where: { userId: user.userId },
              data: { isDefault: false },
            }),
          ]
        : []),
      prisma.paymentMethod.create({
        data: {
          userId: user.userId,
          type: "CREDIT_CARD",
          brand,
          last4,
          expMonth: expMonth as any,
          expYear: expYear as any,
          abacatePayCardToken: null,
          isDefault: !!setDefault,
        },
      }),
    ]);

    const methods = await prisma.paymentMethod.findMany({
      where: { userId: user.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({
      success: true,
      methods: methods.map((m) => ({
        id: m.id,
        type: m.type,
        brand: m.brand,
        last4: m.last4,
        expMonth: m.expMonth,
        expYear: m.expYear,
        isDefault: m.isDefault,
      })),
    });
  } catch (e) {
    console.error("Erro ao criar método de pagamento:", e);
    return NextResponse.json(
      { error: "Erro ao criar método de pagamento" },
      { status: 500 },
    );
  }
}

function luhnCheck(num: string) {
  const s = String(num).replace(/\D/g, "");
  let sum = 0;
  let alt = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let n = parseInt(s.charAt(i), 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function detectCardBrand(number: string): string | null {
  const n = (number || "").replace(/\s|-/g, "");
  if (/^4\d{12}(\d{3})?(\d{3})?$/.test(n)) return "Visa";
  if (/^5[1-5]\d{14}$/.test(n)) return "Mastercard";
  if (/^3[47]\d{13}$/.test(n)) return "American Express";
  if (/^3(0[0-5]|[68])\d{11}$/.test(n)) return "Diners Club";
  if (/^6(?:011|5\d{2})\d{12}$/.test(n)) return "Discover";
  if (/^(?:2131|1800|35\d{3})\d{11}$/.test(n)) return "JCB";
  return null;
}
