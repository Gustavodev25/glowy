"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BookLoader from "@/components/BookLoader";

interface Empresa {
  id: string;
  nomeEmpresa: string;
  logoUrl?: string;
  ativo: boolean;
}

export default function DashboardDono() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEmpresa();
  }, []);

  const fetchEmpresa = async () => {
    try {
      const response = await fetch("/api/empresa/minha", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setEmpresa(data.empresa);
      } else {
        // Redirecionar para configuração se não tiver empresa
        router.push("/empresa/configurar");
      }
    } catch (error) {
      console.error("Erro ao buscar empresa:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BookLoader size={48} className="text-[#C5837B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {empresa?.logoUrl && (
              <img
                src={empresa.logoUrl}
                alt="Logo"
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {empresa?.nomeEmpresa}
              </h1>
              <p className="text-sm text-gray-500">Dashboard do Proprietário</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Agendamentos */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#C5837B] bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#C5837B]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Agendamentos Hoje</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          {/* Card: Clientes */}
          <div className="card-layered p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#C5837B] bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#C5837B]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Clientes</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          {/* Card: Receita */}
          <div className="card-layered-shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#C5837B] bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#C5837B]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Receita do Mês</p>
                <p className="text-2xl font-bold text-gray-900">R$ 0,00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
              <h3 className="font-medium text-gray-900">Novo Agendamento</h3>
              <p className="text-sm text-gray-500 mt-1">
                Criar um novo agendamento
              </p>
            </button>
            <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
              <h3 className="font-medium text-gray-900">Gerenciar Serviços</h3>
              <p className="text-sm text-gray-500 mt-1">
                Adicionar ou editar serviços
              </p>
            </button>
            <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
              <h3 className="font-medium text-gray-900">Ver Agenda</h3>
              <p className="text-sm text-gray-500 mt-1">
                Visualizar agenda completa
              </p>
            </button>
            <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
              <h3 className="font-medium text-gray-900">Relatórios</h3>
              <p className="text-sm text-gray-500 mt-1">
                Acessar relatórios financeiros
              </p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
