"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BookLoader from "@/components/BookLoader";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("paymentId");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar status do pagamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <BookLoader size={48} className="text-[#C5837B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Ícone de Sucesso */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Pagamento Processado!
        </h1>

        <p className="text-gray-600 mb-8">
          Seu pagamento foi processado com sucesso. Sua assinatura será ativada assim que o pagamento for confirmado.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-[#C5837B] text-white py-3 rounded-lg hover:bg-[#B07268] transition-colors font-medium"
          >
            Ir para o Dashboard
          </button>

          <button
            onClick={() => router.push("/plans")}
            className="w-full text-gray-600 hover:text-gray-900 font-medium py-3"
          >
            Ver Planos
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            ID do Pagamento: <span className="font-mono">{paymentId}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
