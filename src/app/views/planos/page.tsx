"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Topbar from "@/app/components/Topbar";
import NumberFlow from "@number-flow/react";
import { gsap } from "gsap";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/visual/Button";

type BillingCycle = "mensal" | "anual";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  maxEmpresas: number;
  maxUsers: number;
  iconUrl?: string;
  iconPublicId?: string;
  recommended?: boolean;
}

export default function PlanosPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("mensal");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Animação de entrada do header com blur
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          {
            opacity: 0,
            y: -30,
            filter: "blur(10px)",
          },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
          },
        );
      }

      // Animação do toggle
      if (toggleRef.current) {
        gsap.fromTo(
          toggleRef.current,
          {
            opacity: 0,
            scale: 0.9,
            filter: "blur(8px)",
          },
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.8,
            delay: 0.3,
            ease: "power3.out",
          },
        );
      }

      // Animação dos cards com blur e stagger
      if (cardsRef.current.length > 0) {
        gsap.fromTo(
          cardsRef.current,
          {
            opacity: 0,
            y: 50,
            filter: "blur(12px)",
          },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            stagger: 0.15,
            delay: 0.5,
            ease: "power3.out",
          },
        );
      }
    }
  }, [loading]);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/plans");
      if (response.ok) {
        const data = await response.json();
        // Usar o campo recommended do banco de dados
        const plansWithRecommended = data.plans.map((plan: Plan) => ({
          ...plan,
          recommended: plan.recommended || false,
        }));
        setPlans(plansWithRecommended);
      }
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBilling = (cycle: BillingCycle) => {
    if (cycle === billingCycle) return;
    setBillingCycle(cycle);
  };

  const getPrice = (plan: Plan) => {
    const basePrice = Number(plan.price);
    return billingCycle === "mensal" ? basePrice : basePrice * 0.8; // 20% desconto anual
  };

  const getButtonClasses = (index: number) => {
    if (index === 0) {
      // Básico (primeiro plano dinâmico)
      return "w-full px-6 py-3 border-2 border-[#C5837B] text-[#C5837B] rounded-lg font-medium hover:bg-[#C5837B] hover:text-white transition-all duration-200";
    } else if (index === 1) {
      // Profissional (Recomendado)
      return "w-full px-6 py-3 bg-[#C5837B] text-white rounded-lg font-medium hover:bg-[#B0736B] transition-all duration-200 shadow-lg";
    } else {
      // Empresarial
      return "w-full px-6 py-3 bg-gradient-to-r from-[#C5837B] to-[#B0736B] text-white rounded-lg font-medium hover:shadow-xl transition-all duration-200";
    }
  };

  const getButtonText = (plan: Plan) => {
    // Se o preço for 0, é plano grátis
    if (Number(plan.price) === 0) return "Começar Grátis";
    // Para todos os outros planos
    return "Assinar Plano";
  };

  const handleSelectPlan = (planId: string) => {
    const cycle = billingCycle === "anual" ? "YEARLY" : "MONTHLY";
    router.push(`/checkout?planId=${planId}&cycle=${cycle}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <svg
              className="animate-spin w-12 h-12 text-[#C5837B]"
              viewBox="3 3 18 18"
            >
              <path
                className="opacity-20"
                fill="currentColor"
                d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5ZM3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
              ></path>
              <path
                fill="currentColor"
                d="M16.9497 7.05015C14.2161 4.31648 9.78392 4.31648 7.05025 7.05015C6.65973 7.44067 6.02656 7.44067 5.63604 7.05015C5.24551 6.65962 5.24551 6.02646 5.63604 5.63593C9.15076 2.12121 14.8492 2.12121 18.364 5.63593C18.7545 6.02646 18.7545 6.65962 18.364 7.05015C17.9734 7.44067 17.3403 7.44067 16.9497 7.05015Z"
              ></path>
            </svg>
          </div>
          <p className="text-gray-600 mt-4">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <Topbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Perfeito
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Selecione o plano que melhor se adequa às necessidades do seu
            negócio
          </p>
        </div>

        {/* Toggle Mensal/Anual */}
        <div ref={toggleRef} className="flex justify-center mb-6">
          <div className="relative bg-white rounded-2xl p-1 shadow-[3px_3px_0px_#e5e7eb] inline-flex border border-gray-300 overflow-hidden">
            {/* Efeito de brilho */}
            <span className="absolute top-0 left-0 w-12 h-12 bg-[#C5837B] rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none" />
            <span className="absolute bottom-0 right-0 w-12 h-12 bg-[#C5837B] rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none" />

            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#F5D2D2] rounded-xl transition-all duration-300 ease-out shadow-sm z-0"
              style={{
                left: billingCycle === "mensal" ? "4px" : "calc(50%)",
              }}
            />
            <button
              onClick={() => handleToggleBilling("mensal")}
              className={`relative z-10 px-8 py-2 rounded-xl font-medium transition-colors duration-300 ${billingCycle === "mensal"
                ? "text-gray-900"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Mensal
            </button>
            <button
              onClick={() => handleToggleBilling("anual")}
              className={`relative z-10 px-8 py-2 rounded-xl font-medium transition-colors duration-300 ${billingCycle === "anual"
                ? "text-gray-900"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Anual
            </button>
          </div>
        </div>

        {/* Cards de Planos */}
        <div className="flex justify-center mx-auto gap-0 pt-4">
          {/* Card de Plano Gratuito Fixo */}
          <div
            ref={(el) => {
              if (el) cardsRef.current[0] = el;
            }}
            className="flex flex-col w-[300px] flex-shrink-0"
          >
            <div className="relative bg-white overflow-hidden flex-1 flex flex-col border border-gray-300 shadow-[3px_3px_0px_#e5e7eb] rounded-l-2xl">

              <div className="p-8 flex-1 flex flex-col">
                {/* Título centralizado */}
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                  Gratuito
                </h3>

                {/* Descrição */}
                <p className="text-gray-600 text-sm text-center mb-6">
                  Perfeito para começar e testar nossa plataforma
                </p>

                {/* Preço */}
                <div className="mb-6 text-center">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-gray-900 font-mono tracking-tight">
                      R$ 0,00
                    </span>
                    <span className="text-gray-500 text-sm font-medium">
                      BRL/Mês
                    </span>
                  </div>
                </div>

                {/* Botão no lugar do badge */}
                <div className="mb-6">
                  <Button variant="primary" size="md" disabled fullWidth>
                    Plano Atual
                  </Button>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm">Até 1 empresa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm">
                      Até 3 usuários
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm">
                      Funcionalidades básicas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm">
                      Suporte por email
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Planos Dinâmicos */}
          {plans.map((plan, index) => {
            return (
              <div
                key={plan.id}
                ref={(el) => {
                  if (el) cardsRef.current[index + 1] = el;
                }}
                className="flex flex-col w-[300px] flex-shrink-0 relative"
              >
                {/* Badge Recomendado - Pill flutuante no topo */}
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-[#F5D2D2] text-[#C5837B] text-xs font-semibold px-4 py-1.5 border border-[#C5837B] rounded-full whitespace-nowrap shadow-sm">
                      Recomendado para você
                    </span>
                  </div>
                )}

                <div
                  className={`relative bg-white overflow-hidden flex-1 flex flex-col shadow-[3px_3px_0px_#e5e7eb] ${
                    plan.recommended 
                      ? `border-2 border-[#C5837B]`
                      : `border border-gray-300`
                  }`}
                >
                  <div className="p-8 flex-1 flex flex-col">
                    {/* Título centralizado */}
                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                      {plan.name}
                    </h3>

                    {/* Descrição */}
                    <p className="text-gray-600 text-sm text-center mb-6">
                      {plan.description}
                    </p>

                    {/* Preço */}
                    <div className="mb-6 text-center">
                      {Number(plan.price) === 0 ? (
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-4xl font-bold text-gray-900 font-mono tracking-tight">
                            R$ 0,00
                          </span>
                          <span className="text-gray-500 text-sm font-medium">
                            BRL/Mês
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-4xl font-bold text-gray-900 font-mono tracking-tight">
                            R$
                          </span>
                          <NumberFlow
                            value={getPrice(plan)}
                            format={{
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }}
                            locales="pt-BR"
                            className="text-4xl font-bold text-gray-900 font-mono tracking-tight"
                          />
                          <span className="text-gray-500 text-sm font-medium">
                            {billingCycle === "mensal" ? "BRL/Mês" : "BRL/Ano"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botão no lugar do badge */}
                    <div className="mb-6">
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        {getButtonText(plan)}
                      </Button>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <svg
                            className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Card de Plano Enterprise Fixo */}
          <div
            ref={(el) => {
              if (el) cardsRef.current[plans.length + 1] = el;
            }}
            className="flex flex-col w-[300px] flex-shrink-0"
          >
            <div className="relative bg-white overflow-hidden flex-1 flex flex-col border border-gray-300 shadow-[3px_3px_0px_#e5e7eb] rounded-r-2xl">
              <div className="p-8 flex-1 flex flex-col">
                {/* Título centralizado */}
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                  Enterprise
                </h3>

                {/* Descrição */}
                <p className="text-gray-600 text-sm text-center mb-6">
                  Plano personalizado para grandes empresas
                </p>

                {/* Preço */}
                <div className="mb-6 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-gray-900 font-mono tracking-tight">
                      Personalizado
                    </span>
                    <span className="text-gray-500 text-sm font-medium">
                      Sob consulta
                    </span>
                  </div>
                </div>

                {/* Botão */}
                <div className="mb-6">
                  <Button 
                    variant="primary" 
                    size="md" 
                    fullWidth
                    onClick={() => window.location.href = 'mailto:contato@glowy.com?subject=Interesse em Plano Enterprise'}
                  >
                    Falar com especialista
                  </Button>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm">Empresas ilimitadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm">
                      Usuários ilimitados
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm">
                      Suporte prioritário 24/7
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm">
                      Gerente de conta dedicado
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm">
                      Customizações sob demanda
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ ou Info Adicional */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Precisa de mais informações?{" "}
            <a href="#" className="text-[#C5837B] font-medium hover:underline">
              Entre em contato com nossa equipe
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
