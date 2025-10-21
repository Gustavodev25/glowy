"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UniversalLoader from "@/components/UniversalLoader";
import CardIcon from "@/components/visual/CardIcon";
import { Button } from "@/components/visual/Button";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  iconUrl?: string | null;
  features: string[];
  active: boolean;
}

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch("/api/subscriptions/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Erro ao buscar subscription:", error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/admin/planos");
      if (response.ok) {
        const data = await response.json();
        // Filtrar apenas planos ativos
        setPlans(data.filter((plan: Plan) => plan.active));
      }
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    router.push(`/checkout?planId=${planId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <UniversalLoader size="xl" text="Carregando planos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal
          </h1>
          <p className="text-xl text-gray-600">
            Selecione o plano que melhor atende às necessidades do seu negócio
          </p>
        </div>

        {/* Plans Grid */}
        <div className="flex justify-center mx-auto gap-0">
          {/* Card Plano Grátis - mostrado apenas quando não há subscription */}
          {!currentSubscription && (
            <div className="relative bg-white overflow-hidden w-[300px] flex-shrink-0 transition-all border border-gray-300 shadow-[3px_3px_0px_#e5e7eb] rounded-l-2xl">

              {/* Badge Plano Atual */}
              <div className="relative z-10 bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2.5 font-semibold text-sm shadow-sm">
                ✓ PLANO ATUAL
              </div>

              <div className="relative z-10 p-8">
                {/* Header com ícone e nome */}
                <div className="flex items-center gap-3 mb-4">
                  <CardIcon icon="check" color="#10B981" size="lg" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Grátis</h2>
                    <p className="text-sm text-gray-500">
                      Perfeito para começar
                    </p>
                  </div>
                </div>

                {/* Preço */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900 font-mono tracking-tight">
                      R$ 0,00
                    </span>
                    <span className="text-gray-500 text-sm font-medium">BRL/Mês</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    100% gratuito, sem cartão de crédito
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                    O que está incluído
                  </p>
                  {[
                    { icon: "calendar", text: "Até 50 agendamentos/mês" },
                    { icon: "user", text: "1 profissional" },
                    { icon: "users", text: "Até 100 clientes" },
                    { icon: "globe", text: "Agenda online básica" },
                    { icon: "mail", text: "Suporte por email" },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <CardIcon
                          icon={feature.icon as any}
                          color="#10B981"
                          size="sm"
                        />
                      </div>
                      <span className="text-gray-700 text-sm">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Botão */}
                <Button
                  variant="secondary"
                  disabled
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  Seu Plano Atual
                </Button>
              </div>
            </div>
          )}

          {plans.map((plan, index) => {
            // Definir ícone e cor baseado no índice/nome do plano
            const planIcon =
              index === 0 ? "briefcase" : index === 1 ? "star" : "rocket";
            const planColor =
              index === 0 ? "#6366F1" : index === 1 ? "#C5837B" : "#8B5CF6";
            const isLast = index === plans.length - 1;
            const isFirst = index === 0;
            const isPopular = index === 1;
            const showLeftBorder = isFirst && (currentSubscription || isPopular);

            return (
              <div
                key={plan.id}
                className="relative bg-white overflow-hidden w-[300px] flex-shrink-0 transition-all"
              >

                {/* Badge Mais Popular */}
                {isPopular && (
                  <div
                    className="text-white text-center py-2.5 font-semibold text-sm rounded-t-2xl"
                    style={{
                      background: `linear-gradient(to right, ${planColor}, ${planColor}dd)`,
                    }}
                  >
                    ⭐ MAIS POPULAR
                  </div>
                )}

                {/* Aplicar bordas conforme posição */}
                <div className={`h-full shadow-[3px_3px_0px_#e5e7eb] ${
                  isPopular 
                    ? `border-y-2 border-[#C5837B] rounded-t-none ${isLast ? 'border-r-2 rounded-r-2xl' : 'border-r'} ${showLeftBorder ? 'border-l-2' + (currentSubscription ? ' rounded-l-2xl' : '') : 'border-l-0'}`
                    : `border-y border-gray-300 ${isLast ? 'border-r rounded-r-2xl' : 'border-r'} ${showLeftBorder ? 'border-l' + (currentSubscription ? ' rounded-l-2xl' : '') : 'border-l-0'}`
                }`}>

                <div className="relative z-10 p-8 h-full flex flex-col">
                  {/* Header com ícone e nome */}
                  <div className="flex items-center gap-3 mb-4">
                    <CardIcon
                      icon={planIcon as any}
                      color={planColor}
                      size="lg"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {plan.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {/* Preço */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900 font-mono tracking-tight">
                        R$ {plan.price.toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-sm font-medium">BRL/Mês</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Cobrança mensal recorrente
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                      O que está incluído
                    </p>
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-3"
                      >
                        <div className="flex-shrink-0">
                          <CardIcon icon="check" color={planColor} size="sm" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Botão */}
                  <Button
                    variant={index === 1 ? "primary" : "secondary"}
                    onClick={() => handleSelectPlan(plan.id)}
                    className="w-full mt-auto"
                  >
                    Assinar Agora
                  </Button>
                </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Perguntas Frequentes
          </h2>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem
                taxas adicionais.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">
                Quais métodos de pagamento são aceitos?
              </h3>
              <p className="text-gray-600">
                Aceitamos pagamentos via PIX e Cartão de Crédito.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">
                Posso mudar de plano depois?
              </h3>
              <p className="text-gray-600">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a
                qualquer momento.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Tem dúvidas?{" "}
            <a href="#" className="text-[#C5837B] hover:underline">
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
