"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import Modal from "@/components/Modal";
import Input from "@/components/visual/Input";
import Button from "@/components/visual/Button";

interface PaymentMethod {
  id: string;
  type: string; // CREDIT_CARD, PIX
  brand?: string | null;
  last4?: string | null;
  expMonth?: number | null;
  expYear?: number | null;
  isDefault: boolean;
}

interface SubscriptionData {
  id: string;
  status: string;
  cycle: 'MONTHLY' | 'YEARLY';
  amount: number;
  autoRenew: boolean;
  paymentType?: 'PIX' | 'CREDIT_CARD' | null;
  paymentMethod?: PaymentMethod | null;
  nextDueDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isInherited?: boolean;
  ownerName?: string | null;
  ownerPlanName?: string | null;
  plan: {
    id: string;
    name: string;
    description?: string | null;
    iconUrl?: string | null;
  };
}

// Componente de Skeleton para os cards
const PaymentCardSkeleton = () => (
  <div className="relative">
    <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
    <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
        <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
      </div>
    </div>
  </div>
);

export default function PagamentosTab() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [autoRenew, setAutoRenew] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [invoices, setInvoices] = useState<{
    id: string;
    amount: number;
    status: string;
    method?: string | null;
    dueDate: string;
    paymentDate?: string | null;
    invoiceUrl?: string | null;
  }[]>([]);

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(true);

  const resetCardForm = () => {
    setCardHolderName("");
    setCardNumber("");
    setExpiryMonth("");
    setExpiryYear("");
    setCardCvv("");
    setCpfCnpj("");
    setPostalCode("");
    setAddressNumber("");
    setSetAsDefault(true);
  };

  // Utilidades de formatação e validação
  const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');
  const luhnCheck = (num: string) => {
    const s = onlyDigits(num);
    if (!s) return false;
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
  };
  const detectBrand = (number: string): string | null => {
    const n = onlyDigits(number);
    if (/^4\d{12}(\d{3})?(\d{3})?$/.test(n)) return 'Visa';
    if (/^5[1-5]\d{14}$/.test(n)) return 'Mastercard';
    if (/^3[47]\d{13}$/.test(n)) return 'American Express';
    if (/^3(0[0-5]|[68])\d{11}$/.test(n)) return 'Diners Club';
    if (/^6(?:011|5\d{2})\d{12}$/.test(n)) return 'Discover';
    if (/^(?:2131|1800|35\d{3})\d{11}$/.test(n)) return 'JCB';
    return null;
  };
  const formatCardNumber = (v: string) => {
    const d = onlyDigits(v).slice(0, 19);
    return d.replace(/(.{4})/g, '$1 ').trim();
  };
  const formatCep = (v: string) => {
    const d = onlyDigits(v).slice(0, 8);
    if (d.length <= 5) return d;
    return d.slice(0, 5) + '-' + d.slice(5);
  };
  const formatCpfCnpj = (v: string) => {
    const d = onlyDigits(v).slice(0, 14);
    if (d.length <= 11) {
      // CPF: 000.000.000-00
      const p1 = d.slice(0, 3);
      const p2 = d.slice(3, 6);
      const p3 = d.slice(6, 9);
      const p4 = d.slice(9, 11);
      let out = p1;
      if (p2) out += '.' + p2;
      if (p3) out += '.' + p3;
      if (p4) out += '-' + p4;
      return out;
    }
    // CNPJ: 00.000.000/0000-00
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 5);
    const p3 = d.slice(5, 8);
    const p4 = d.slice(8, 12);
    const p5 = d.slice(12, 14);
    let out = p1;
    if (p2) out += '.' + p2;
    if (p3) out += '.' + p3;
    if (p4) out += '/' + p4;
    if (p5) out += '-' + p5;
    return out;
  };
  const validateCpf = (v: string) => {
    const s = onlyDigits(v);
    if (s.length !== 11 || /^(\d)\1+$/.test(s)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(s[i]) * (10 - i);
    let r = (sum * 10) % 11; if (r === 10) r = 0; if (r !== parseInt(s[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(s[i]) * (11 - i);
    r = (sum * 10) % 11; if (r === 10) r = 0; return r === parseInt(s[10]);
  };
  const validateCnpj = (v: string) => {
    const s = onlyDigits(v);
    if (s.length !== 14 || /^(\d)\1+$/.test(s)) return false;
    const calc = (base: number) => {
      let i = 0, j = base - 7, sum = 0;
      for (; i < base; i++) { sum += parseInt(s[i]) * j--; if (j < 2) j = 9; }
      const r = sum % 11; return r < 2 ? 0 : 11 - r;
    };
    const d1 = calc(12); if (d1 !== parseInt(s[12])) return false;
    const d2 = calc(13); return d2 === parseInt(s[13]);
  };
  const isExpired = (m: string, y: string) => {
    const mm = parseInt(onlyDigits(m), 10);
    const yy = parseInt(onlyDigits(y), 10);
    if (!mm || !yy || mm < 1 || mm > 12) return true;
    const now = new Date();
    const year = yy < 100 ? 2000 + yy : yy;
    const exp = new Date(year, mm - 1, 1);
    exp.setMonth(exp.getMonth() + 1); // first day next month
    return exp <= now;
  };

  const brand = detectBrand(cardNumber);
  const cardDigits = onlyDigits(cardNumber);
  const ASAAS_TEST_CARDS = new Set(['4444444444444444', '5184019740373151', '4916561358240741']);
  const isAsaasTestCard = ASAAS_TEST_CARDS.has(cardDigits);
  const validCardLuhn = cardDigits.length >= 13 && cardDigits.length <= 19 && (luhnCheck(cardNumber) || isAsaasTestCard);
  const validMonth = () => {
    const m = onlyDigits(expiryMonth);
    if (m.length === 0) return false;
    const mm = parseInt(m, 10);
    return mm >= 1 && mm <= 12;
  };
  const validYear = () => {
    const y = onlyDigits(expiryYear);
    if (y.length !== 4) return false;
    const yy = parseInt(y, 10);
    const nowY = new Date().getFullYear();
    return yy >= nowY && yy <= nowY + 25;
  };
  const validExpiry = validMonth() && validYear() && !isExpired(expiryMonth, expiryYear);
  const validCvv = (() => {
    const cv = onlyDigits(cardCvv);
    if (brand === 'American Express') return cv.length === 4;
    return cv.length === 3;
  })();
  const validCpfCnpj = (() => {
    const d = onlyDigits(cpfCnpj);
    if (!d) return true; // opcional
    if (d.length === 11) return validateCpf(cpfCnpj);
    if (d.length === 14) return validateCnpj(cpfCnpj);
    return false;
  })();
  const validCep = (() => {
    const d = onlyDigits(postalCode);
    return !d || d.length === 8;
  })();
  const formValid = !!cardHolderName && validCardLuhn && validExpiry && validCvv && validCpfCnpj && validCep;

  const handleSubmitAddCard = async () => {
    try {
      const number = cardNumber.replace(/\D/g, "");
      const expM = expiryMonth.trim();
      const expY = expiryYear.trim();
      if (!formValid) {
        error("Campos inválidos", "Verifique os dados do cartão.");
        return;
      }
      const payload = {
        type: 'CREDIT_CARD',
        holderName: cardHolderName,
        number,
        expiryMonth: expM,
        expiryYear: expY,
        ccv: cardCvv,
        cpfCnpj: cpfCnpj?.replace(/\D/g, "") || null,
        postalCode: postalCode?.replace(/\D/g, "") || null,
        addressNumber: addressNumber || null,
        setDefault: !!setAsDefault,
      };

      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Falha ao salvar cartão');
      }
      // reload methods
      const methodsRes = await fetch('/api/payment-methods', { credentials: 'include' });
      if (methodsRes.ok) {
        const data = await methodsRes.json();
        setPaymentMethods(data.methods || []);
      }
      setShowAddCardModal(false);
      resetCardForm();
      success("Cartão salvo!", setAsDefault ? "Definido como padrão." : "Salvo para uso futuro.");
    } catch (e: any) {
      error('Erro', e.message || 'Não foi possível salvar o cartão');
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [subRes, methodsRes, invoicesRes] = await Promise.all([
          fetch('/api/subscriptions/me', { credentials: 'include' }),
          fetch('/api/payment-methods', { credentials: 'include' }),
          fetch('/api/subscriptions/me/invoices', { credentials: 'include' }),
        ]);
        if (subRes.ok) {
          const data = await subRes.json();
          if (data.subscription) {
            setSubscription(data.subscription);
            setAutoRenew(!!data.subscription.autoRenew);
          }
        }
        if (methodsRes.ok) {
          const data = await methodsRes.json();
          setPaymentMethods(data.methods || []);
        }
        if (invoicesRes.ok) {
          const data = await invoicesRes.json();
          setInvoices(Array.isArray(data?.invoices) ? data.invoices : []);
        }
      } catch (e) {
        console.error('Erro ao carregar pagamentos:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/payment-methods/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Falha ao remover método');
      setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
      success("Removido!", "Método de pagamento removido");
    } catch (e: any) {
      error('Erro', e.message || 'Não foi possível remover o método');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/payment-methods/${id}/default`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Falha ao definir padrão');
      setPaymentMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
      success("Atualizado!", "Método de pagamento padrão alterado");
    } catch (e: any) {
      error('Erro', e.message || 'Não foi possível definir como padrão');
    }
  };

  const handleToggleAutoRenew = async () => {
    try {
      const newValue = !autoRenew;
      const res = await fetch('/api/subscriptions/me/auto-renew', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ autoRenew: newValue }),
      });
      if (!res.ok) throw new Error('Falha ao atualizar');
      setAutoRenew(newValue);
      success(
        newValue ? "Ativado" : "Desativado",
        newValue
          ? "Renovação automática ativada"
          : "Renovação automática desativada",
      );
    } catch (e: any) {
      error('Erro', e.message || 'Não foi possível atualizar');
    }
  };

  const hasActiveCard = paymentMethods?.some((m) => m.type === 'CREDIT_CARD');
  const isPixSubscription = subscription?.paymentType === 'PIX' || subscription?.paymentMethod?.type === 'PIX';
  const needsCardForAutoRenew = !!subscription && !!isPixSubscription && !hasActiveCard;

  if (loading) {
    return (
      <div className="space-y-4">
        <PaymentCardSkeleton />
        <PaymentCardSkeleton />
        <PaymentCardSkeleton />
        <PaymentCardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Assinatura Atual */}
      <div className="relative">
        <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
        <div id="payment-methods-section" className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-6">
            Assinatura Atual
          </h3>

          {subscription ? (
            <>
              {subscription.isInherited ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">
                        Acesso de Conta Convidada
                      </h4>
                      <p className="text-sm text-blue-800">
                        Você tem acesso ao plano <span className="font-semibold">{subscription.ownerPlanName}</span> como convidado da conta de <span className="font-semibold">{subscription.ownerName}</span>.
                      </p>
                      <p className="text-xs text-blue-700 mt-2">
                        O gerenciamento de pagamentos é realizado pelo dono da conta. Você tem acesso a todos os recursos do plano sem custos adicionais.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Plano</p>
                      <p className="text-sm font-medium text-gray-900">
                        {subscription.plan.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Valor</p>
                      <p className="text-sm font-semibold text-gray-900">
                        R$ {Number(subscription.amount).toFixed(2).replace(".", ",")} {subscription.cycle === 'YEARLY' ? '/ano' : '/mês'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Próxima cobrança</p>
                      <p className="text-sm font-medium text-gray-900">
                        {subscription.nextDueDate
                          ? new Date(subscription.nextDueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      {subscription.status === 'active' ? 'Ativa' : subscription.status}
                    </span>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-600">Nenhuma assinatura ativa.</p>
          )}

          {!subscription?.isInherited && (
            <>
              <div className="relative py-4 border-t border-gray-100">
                <div className={`${needsCardForAutoRenew ? 'blur-[2px] pointer-events-none select-none' : ''} flex items-center justify-between`}>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Renovação automática
                    </p>
                    <p className="text-xs text-gray-500">
                      {autoRenew
                        ? "Sua assinatura será renovada automaticamente"
                        : "Você precisará renovar manualmente"}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRenew}
                      onChange={handleToggleAutoRenew}
                      disabled={needsCardForAutoRenew}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C5837B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5837B]"></div>
                  </label>
                </div>
                {needsCardForAutoRenew && (
                  <div className="absolute inset-0 flex items-center justify-between rounded-lg bg-white/70 backdrop-blur-sm p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Renovação automática indisponível</p>
                      <p className="text-xs text-gray-700">Para ativar a cobrança automática, cadastre um cartão de crédito.</p>
                    </div>
                    <a href="#payment-methods-section" className="text-sm text-[#C5837B] hover:text-[#B0736B] font-medium">
                      Cadastrar cartão
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <a href="/views/planos" className="text-sm text-[#C5837B] hover:text-[#B0736B] font-medium transition-colors">
                  Alterar plano →
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Métodos de Pagamento - Apenas para contas não convidadas */}
      {!subscription?.isInherited && (
        <div className="relative">
          <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
          <div id="payment-methods-section" className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Métodos de Pagamento
            </h3>
            <Button
              onClick={() => setShowAddCardModal(true)}
              variant="ghost"
              size="sm"
              className="text-[#C5837B] hover:text-[#B0736B]"
            >
              + Adicionar
            </Button>
          </div>

          <div className="space-y-3">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                Nenhum método de pagamento cadastrado
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-all ${method.isDefault
                    ? "border-[#C5837B] bg-[#C5837B]/5"
                    : "border-gray-200 bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {method.type === 'CREDIT_CARD' ? `Crédito ${method.brand || ''} **** ${method.last4 || ''}` : method.type}
                        </p>
                        {method.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#C5837B] text-white">
                            Padrão
                          </span>
                        )}
                      </div>
                      {method.expMonth && method.expYear && (
                        <p className="text-xs text-gray-500">
                          Expira em {String(method.expMonth).padStart(2, '0')}/{String(method.expYear).slice(-2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        onClick={() => handleSetDefault(method.id)}
                        variant="ghost"
                        size="sm"
                        className="text-[#C5837B] hover:text-[#B0736B]"
                      >
                        Definir padrão
                      </Button>
                    )}
                    <Button
                      onClick={() => handleRemove(method.id)}
                      variant="ghost"
                      size="sm"
                      className="p-1.5 text-gray-400 hover:text-red-600"
                      title="Remover"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}

      {/* Histórico de Faturas - Apenas para contas não convidadas */}
      {!subscription?.isInherited && (
      <div className="relative">
        <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
        <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Histórico de Faturas
          </h3>

          <div className="divide-y divide-gray-100">
            {invoices.length === 0 ? (
              <div className="py-4 text-sm text-gray-500">Nenhuma fatura encontrada.</div>
            ) : (
              invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date((invoice.paymentDate || invoice.dueDate) as string).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">{subscription?.plan?.name || 'Plano'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-gray-900">
                      R$ {Number(invoice.amount).toFixed(2).replace('.', ',')}
                    </p>
                    {invoice.invoiceUrl ? (
                      <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C5837B] hover:text-[#B0736B] font-medium transition-colors">
                        Baixar
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Indisponível</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}

      {/* Cancelar Assinatura - Apenas para contas não convidadas */}
      {!subscription?.isInherited && (
      <div className="relative">
        <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
        <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Cancelar Assinatura
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Ao cancelar, você perderá acesso aos recursos premium no final do
            período de cobrança atual.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            Cancelar minha assinatura
          </Button>
        </div>
      </div>
      )}

      {/* Modal Adicionar Cartão */}
      <Modal isOpen={showAddCardModal} onClose={() => setShowAddCardModal(false)} title="Adicionar Cartão" maxWidth="md">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Nome impresso no cartão"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                placeholder="Ex: JOÃO SILVA"
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Número do cartão"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                maxLength={19}
              />
            </div>
            <div>
              <Input
                label="Mês (MM)"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(onlyDigits(e.target.value).slice(0, 2))}
                placeholder="MM"
                inputMode="numeric"
                maxLength={2}
                error={expiryMonth && !validMonth() ? 'Mês inválido' : undefined}
              />
            </div>
            <div>
              <Input
                label="Ano (AAAA)"
                value={expiryYear}
                onChange={(e) => setExpiryYear(onlyDigits(e.target.value).slice(0, 4))}
                placeholder="AAAA"
                inputMode="numeric"
                maxLength={4}
                error={expiryYear && !validYear() ? 'Ano inválido' : undefined}
              />
            </div>
            <div>
              <Input
                label="CVV"
                value={cardCvv}
                onChange={(e) => setCardCvv(onlyDigits(e.target.value).slice(0, brand === 'American Express' ? 4 : 3))}
                placeholder="CVV"
                inputMode="numeric"
                maxLength={brand === 'American Express' ? 4 : 3}
              />
            </div>
            <div>
              <Input
                label="CPF/CNPJ do titular"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
                placeholder="CPF ou CNPJ"
                maxLength={18}
              />
            </div>
            <div>
              <Input
                label="CEP"
                value={postalCode}
                onChange={(e) => setPostalCode(formatCep(e.target.value))}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>
            <div>
              <Input
                label="Número do endereço"
                value={addressNumber}
                onChange={(e) => setAddressNumber(e.target.value)}
                placeholder="123"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between">
              <label htmlFor="setDefault" className="text-sm text-gray-700">Definir como método padrão</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="setDefault"
                  type="checkbox"
                  checked={setAsDefault}
                  onChange={(e) => setSetAsDefault(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C5837B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5837B]"></div>
              </label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              onClick={handleSubmitAddCard}
              disabled={!formValid}
              variant="primary"
              size="sm"
            >
              Salvar cartão
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
