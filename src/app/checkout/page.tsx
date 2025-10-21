"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import BookLoader from "@/components/BookLoader";
import { useToast } from "@/contexts/ToastContext";
import Input from "@/components/visual/Input";
import Button from "@/components/visual/Button";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  iconUrl?: string;
}

interface UserData {
  nome: string;
  email: string;
  telefone?: string;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("planId");
  const cycleParam = searchParams.get("cycle"); // 'MONTHLY' | 'YEARLY'
  const toast = useToast();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">(
    "CREDIT_CARD",
  );
  const [cycle, setCycle] = useState<"MONTHLY" | "YEARLY">(
    cycleParam === "YEARLY" ? "YEARLY" : "MONTHLY",
  );
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    copyPaste: string;
  } | null>(null);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dados do usuário
  const [userData, setUserData] = useState({
    email: "",
    phone: "",
  });
  const [phoneError, setPhoneError] = useState<string>("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  // Dados para PIX
  const [pixFormData, setPixFormData] = useState({
    cpf: "",
  });

  // Dados do cartão
  const [cardData, setCardData] = useState({
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: "",
    cpfCnpj: "",
    postalCode: "",
    addressNumber: "",
  });
  const [saveCardAsDefault, setSaveCardAsDefault] = useState<boolean>(true);

  useEffect(() => {
    fetchUserAndPlan();
  }, [planId]);

  // Polling para verificar status do pagamento PIX
  useEffect(() => {
    if (currentPaymentId && showPixPayment) {
      const checkPaymentStatus = async () => {
        try {
          const response = await fetch(
            `/api/payments/${currentPaymentId}/status`,
            {
              credentials: "include",
            },
          );

          if (response.ok) {
            const data = await response.json();

            // Se o pagamento foi confirmado ou recebido
            if (data.status === "RECEIVED" || data.status === "CONFIRMED") {
              // Parar o polling
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }

              // Mostrar toast de sucesso
              toast.success(
                "Pagamento Confirmado!",
                "Seu pagamento foi recebido com sucesso. Redirecionando...",
              );

              // Redirecionar após 2 segundos
              setTimeout(() => {
                router.push("/views/manager?planActivated=true");
              }, 2000);
            }
          }
        } catch (error) {
          console.error("Erro ao verificar status:", error);
        }
      };

      // Verificar imediatamente
      checkPaymentStatus();

      // Configurar polling a cada 5 segundos
      pollingIntervalRef.current = setInterval(checkPaymentStatus, 5000);

      // Limpar interval quando componente desmontar
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [currentPaymentId, showPixPayment, router, toast]);

  const fetchUserAndPlan = async () => {
    try {
      // Buscar usuário logado
      const userResponse = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("📞 Dados do usuário no checkout:", {
          telefone: userData.user.telefone,
          telefoneFormatado: userData.user.telefone
            ? formatPhoneNumber(userData.user.telefone)
            : "",
        });
        setUser(userData.user);
        setUserData({
          email: userData.user.email,
          phone: userData.user.telefone
            ? formatPhoneNumber(userData.user.telefone)
            : "",
        });
      }

      // Buscar plano
      if (planId) {
        // Tentativa principal: buscar diretamente pelo endpoint de detalhes
        const planResponse = await fetch(
          `/api/plans/${encodeURIComponent(planId)}`,
        );
        if (planResponse.ok) {
          const data = await planResponse.json();
          setPlan({
            id: data.plan.id,
            name: data.plan.name,
            description: data.plan.description || "",
            price: Number(data.plan.price),
            features: data.plan.features || [],
            iconUrl: data.plan.iconUrl,
          });
        } else {
          // Fallback: buscar todos os planos e localizar pelo id
          const listResponse = await fetch(`/api/plans`);
          if (listResponse.ok) {
            const listData = await listResponse.json();
            const found = (listData.plans || []).find(
              (p: any) => p.id === planId,
            );
            if (found) {
              setPlan({
                id: found.id,
                name: found.name,
                description: found.description || "",
                price: Number(found.price),
                features: found.features || [],
                iconUrl: found.iconUrl,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!plan) return;

    // Validar telefone antes de prosseguir
    if (!userData.phone || userData.phone.trim() === "") {
      toast.error(
        "Telefone Obrigatório",
        "Por favor, adicione seu telefone nos detalhes da conta antes de continuar.",
      );
      return;
    }

    // Validar formato do telefone
    if (!validatePhone(userData.phone)) {
      toast.error(
        "Telefone Inválido",
        phoneError || "Por favor, insira um telefone válido.",
      );
      return;
    }

    setProcessing(true);

    try {
      // Se for PIX, usar o endpoint customizado (checkout na própria página)
      if (paymentMethod === "PIX") {
        // Validar CPF
        if (
          !pixFormData.cpf ||
          pixFormData.cpf.replace(/\D/g, "").length !== 11
        ) {
          toast.error(
            "CPF Obrigatório",
            "Por favor, insira um CPF válido para pagamento PIX.",
          );
          setProcessing(false);
          return;
        }

        const response = await fetch("/api/payments/create-pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            planId: plan.id,
            cycle,
            cpf: pixFormData.cpf,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.requiresPhone) {
            toast.error(
              "Telefone Obrigatório",
              data.message ||
                "Por favor, adicione seu telefone antes de continuar.",
            );
            return;
          }
          throw new Error(data.error || "Erro ao processar pagamento");
        }

        // Exibir QR Code PIX na própria página
        if (data.pix) {
          setPixData({
            qrCode: data.pix.qrCode,
            copyPaste: data.pix.copyPaste,
          });
          setCurrentPaymentId(data.paymentId);
          setShowPixPayment(true);
          toast.success(
            "PIX Gerado!",
            "Escaneie o QR Code ou copie o código para pagar.",
          );
        }
      } else if (paymentMethod === "CREDIT_CARD") {
        // Para cartão, usar o billing do AbacatePay (redirect)
        const payload: any = {
          planId: plan.id,
          billingType: paymentMethod,
          cycle,
          creditCardData: cardData,
          saveCardAsDefault: !!saveCardAsDefault,
        };

        const response = await fetch("/api/payments/create-abacate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.requiresPhone) {
            toast.error(
              "Telefone Obrigatório",
              data.message ||
                "Por favor, adicione seu telefone antes de continuar.",
            );
            return;
          }
          throw new Error(data.error || "Erro ao processar pagamento");
        }

        // Redirecionar para o checkout do AbacatePay
        if (data.checkoutUrl) {
          toast.success(
            "Redirecionando...",
            "Você será redirecionado para finalizar o pagamento.",
          );

          setTimeout(() => {
            window.location.href = data.checkoutUrl;
          }, 1500);
        }
      }
    } catch (error: any) {
      toast.error(
        "Erro ao Processar Pagamento",
        error.message || "Erro ao processar pagamento",
      );
    } finally {
      setProcessing(false);
    }
  };

  const validatePhone = (phone: string): boolean => {
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, "");

    // Verifica se tem 10 ou 11 dígitos (com DDD)
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      setPhoneError("Telefone deve ter 10 ou 11 dígitos");
      return false;
    }

    // Verifica se o DDD é válido (11-99)
    const ddd = parseInt(cleanPhone.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
      setPhoneError("DDD inválido");
      return false;
    }

    // Verifica se não é sequência de números iguais
    if (/^(\d)\1+$/.test(cleanPhone)) {
      setPhoneError("Telefone inválido");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Formata com base no tamanho
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setUserData({ ...userData, phone: formatted });
    if (formatted.replace(/\D/g, "").length >= 10) {
      validatePhone(formatted);
    } else {
      setPhoneError("");
    }
  };

  const handleSavePhone = async () => {
    if (!userData.phone || userData.phone.trim() === "") {
      toast.error("Telefone Obrigatório", "Por favor, insira um telefone.");
      return;
    }

    if (!validatePhone(userData.phone)) {
      toast.error(
        "Telefone Inválido",
        phoneError || "Por favor, insira um telefone válido.",
      );
      return;
    }

    setSavingPhone(true);

    try {
      // Remover formatação do telefone antes de salvar (manter apenas números)
      const telefoneClean = userData.phone.replace(/\D/g, "");

      const response = await fetch("/api/perfil/atualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nome: user?.nome || "",
          telefone: telefoneClean,
        }),
      });

      if (response.ok) {
        toast.success("Sucesso!", "Telefone atualizado com sucesso.");
        setIsEditingPhone(false);
        // Atualizar os dados do usuário
        await fetchUserAndPlan();
      } else {
        const error = await response.json();
        toast.error("Erro", error.error || "Erro ao atualizar telefone.");
      }
    } catch (error) {
      toast.error("Erro", "Erro ao atualizar telefone.");
    } finally {
      setSavingPhone(false);
    }
  };

  const copyPixCode = () => {
    if (pixData?.copyPaste) {
      navigator.clipboard.writeText(pixData.copyPaste);
      toast.success(
        "Código Copiado!",
        "O código PIX foi copiado para a área de transferência.",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <BookLoader size={48} className="text-[#C5837B]" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Plano não encontrado
          </h1>
          <button
            onClick={() => router.push("/views/planos")}
            className="text-[#C5837B] hover:underline"
          >
            Voltar para planos
          </button>
        </div>
      </div>
    );
  }

  if (showPixPayment && pixData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative">
            <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
            <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Pagamento via PIX
              </h1>

              {/* Informações do Plano */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {plan.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-600">
                    Plano {cycle === "YEARLY" ? "Anual" : "Mensal"}
                  </span>
                  <span className="font-semibold text-gray-900 text-lg">
                    R${" "}
                    {(cycle === "YEARLY"
                      ? plan.price * 12 * 0.8
                      : plan.price
                    ).toFixed(2)}
                    {cycle === "YEARLY" ? "/ano" : "/mês"}
                  </span>
                </div>
              </div>

              {/* Indicador de aguardando pagamento */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                <div className="animate-pulse">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
                <p className="text-sm text-yellow-800 font-medium">
                  Aguardando confirmação do pagamento...
                </p>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 font-medium mb-6 text-center">
                  Escaneie o QR Code ou copie o código PIX:
                </p>

                <div className="flex justify-center mb-6">
                  <img
                    src={pixData.qrCode}
                    alt="QR Code PIX"
                    className="w-64 h-64 border-2 border-gray-200 rounded-lg shadow-sm"
                    onError={(e) => {
                      console.error(
                        "Erro ao carregar QR Code:",
                        pixData.qrCode?.substring(0, 100),
                      );
                    }}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                  <p className="text-xs text-gray-600 break-all font-mono text-center">
                    {pixData.copyPaste}
                  </p>
                </div>

                <Button
                  onClick={copyPixCode}
                  variant="primary"
                  size="lg"
                  fullWidth
                >
                  Copiar Código PIX
                </Button>
              </div>

              <div className="border-t pt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Verificando pagamento automaticamente a cada 5 segundos. Você
                  será redirecionado assim que o pagamento for confirmado.
                </p>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="ghost"
                  fullWidth
                >
                  Voltar para o Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Formulário */}
          <div className="space-y-6">
            {/* 1. Account Details */}
            <div className="relative">
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
              <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  1. Detalhes da Conta
                </h2>

                {/* Resumo da Conta */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.nome}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C5837B] to-[#B07268] flex items-center justify-center border-2 border-gray-200">
                        <span className="text-white text-xl font-semibold">
                          {user?.nome?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {user?.nome || "Usuário"}
                    </h3>
                    <p className="text-sm text-gray-600 truncate mt-0.5">
                      {userData.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Details */}
            <div className="relative">
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
              <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  2. Detalhes do Pagamento
                </h2>

                {/* Seletor de Método - Toggle Conectado */}
                <div className="flex rounded-lg bg-gray-100 p-1 mb-6 w-full">
                  <button
                    onClick={() => setPaymentMethod("CREDIT_CARD")}
                    className={`
                      flex-1 relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all duration-300 ease-in-out
                      ${
                        paymentMethod === "CREDIT_CARD"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }
                    `}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 19h-6a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v4.5" />
                      <path d="M3 10h18" />
                      <path d="M16 19h6" />
                      <path d="M19 16l3 3l-3 3" />
                      <path d="M7.005 15h.005" />
                      <path d="M11 15h2" />
                    </svg>
                    Cartão de Crédito
                  </button>
                  <button
                    onClick={() => setPaymentMethod("PIX")}
                    className={`
                      flex-1 relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all duration-300 ease-in-out
                      ${
                        paymentMethod === "PIX"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }
                    `}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M7 15h-3a1 1 0 0 1 -1 -1v-8a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v3" />
                      <path d="M7 9m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z" />
                      <path d="M12 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                    </svg>
                    PIX
                  </button>
                </div>

                {/* Formulário de Cartão */}
                {paymentMethod === "CREDIT_CARD" && (
                  <div className="space-y-4">
                    <Input
                      label="Nome no Cartão"
                      type="text"
                      value={cardData.holderName}
                      onChange={(e) =>
                        setCardData({
                          ...cardData,
                          holderName: e.target.value,
                        })
                      }
                      placeholder="Digite o nome como está no cartão"
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-3">
                        <Input
                          label="Número do Cartão"
                          type="text"
                          value={cardData.number}
                          onChange={(e) =>
                            setCardData({ ...cardData, number: e.target.value })
                          }
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                        />
                      </div>

                      <Input
                        label="Mês"
                        type="text"
                        value={cardData.expiryMonth}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            expiryMonth: e.target.value,
                          })
                        }
                        placeholder="MM"
                        maxLength={2}
                      />

                      <Input
                        label="Ano"
                        type="text"
                        value={cardData.expiryYear}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            expiryYear: e.target.value,
                          })
                        }
                        placeholder="AAAA"
                        maxLength={4}
                      />

                      <Input
                        label="CVV"
                        type="text"
                        value={cardData.ccv}
                        onChange={(e) =>
                          setCardData({ ...cardData, ccv: e.target.value })
                        }
                        placeholder="000"
                        maxLength={4}
                      />
                    </div>

                    <Input
                      label="CPF/CNPJ"
                      type="text"
                      value={cardData.cpfCnpj}
                      onChange={(e) =>
                        setCardData({ ...cardData, cpfCnpj: e.target.value })
                      }
                      placeholder="000.000.000-00"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="CEP"
                        type="text"
                        value={cardData.postalCode}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            postalCode: e.target.value,
                          })
                        }
                        placeholder="00000-000"
                      />
                      <Input
                        label="Número"
                        type="text"
                        value={cardData.addressNumber}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            addressNumber: e.target.value,
                          })
                        }
                        placeholder="123"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <label className="text-sm text-gray-700">
                        Salvar cartão como padrão para próximas cobranças
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveCardAsDefault}
                          onChange={(e) =>
                            setSaveCardAsDefault(e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C5837B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5837B]"></div>
                      </label>
                    </div>
                  </div>
                )}

                {paymentMethod === "PIX" && (
                  <div className="space-y-4">
                    <Input
                      label="CPF"
                      type="text"
                      placeholder="000.000.000-00"
                      value={pixFormData.cpf}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .replace(/(\d{3})(\d)/, "$1.$2")
                          .replace(/(\d{3})(\d)/, "$1.$2")
                          .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                        setPixFormData({ ...pixFormData, cpf: value });
                      }}
                      maxLength={14}
                      required
                    />
                    <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-600 flex-shrink-0 mt-0.5"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                        <path d="M7 17l0 .01" />
                        <path d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                        <path d="M7 7l0 .01" />
                        <path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                        <path d="M17 7l0 .01" />
                        <path d="M14 14l3 0" />
                        <path d="M20 14l0 .01" />
                        <path d="M14 14l0 3" />
                        <path d="M14 20l3 0" />
                        <path d="M17 17l3 0" />
                        <path d="M20 17l0 3" />
                      </svg>
                      <p className="text-xs text-blue-800">
                        Clique em &quot;Finalizar Compra&quot; para gerar o QR
                        Code PIX. O pagamento é instantâneo e seguro.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Direita - Resumo do Pedido */}
          <div>
            <div className="relative">
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
              <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Resumo do Pedido
                </h2>

                {/* Produto */}
                <div className="mb-6 pb-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {plan.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Plano {cycle === "YEARLY" ? "Anual" : "Mensal"}
                    </span>
                    <span className="font-medium text-gray-900">
                      R$ {plan.price.toFixed(2)}
                      {cycle === "YEARLY" ? "/ano" : "/mês"}
                    </span>
                  </div>
                </div>

                {/* Resumo de Valores */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      R${" "}
                      {(cycle === "YEARLY"
                        ? plan.price * 12 * 0.8
                        : plan.price
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Desconto</span>
                    <span className="text-gray-900">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxa</span>
                    <span className="text-gray-900">R$ 0,00</span>
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        R${" "}
                        {(cycle === "YEARLY"
                          ? plan.price * 12 * 0.8
                          : plan.price
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botão de Finalizar */}
                <Button
                  onClick={handleProcessPayment}
                  disabled={processing}
                  isLoading={processing}
                  variant="primary"
                  size="lg"
                  fullWidth
                >
                  Finalizar Compra
                </Button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  Ao continuar, você concorda com nossos{" "}
                  <a href="#" className="text-[#C5837B] hover:underline">
                    Termos de Serviço
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
