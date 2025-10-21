"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Eye, X } from "lucide-react";
import BookLoader from "@/components/BookLoader";
import MySchedule from "@/app/components/MySchedule";
import { Button } from "@/components/visual/Button";

interface User {
  id: string;
  nome: string;
  email: string;
}

interface Agendamento {
  id: string;
  empresaId: string;
  servicoId: string;
  dataHora: string;
  duracao: number;
  valor: string;
  status: string;
  observacoes?: string;
  empresa: {
    id: string;
    nomeEmpresa: string;
    nomeFantasia?: string;
    logoUrl?: string;
    telefone: string;
    email: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  servico: {
    id: string;
    nome: string;
    descricao: string;
    duracao: number;
    preco: string;
    imageUrl?: string;
  };
}

export default function DashboardUsuario() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [agendamentosProximos, setAgendamentosProximos] = useState<Agendamento[]>([]);
  const [agendamentosPassados, setAgendamentosPassados] = useState<Agendamento[]>([]);
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchAgendamentos();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgendamentos = async () => {
    try {
      setLoadingAgendamentos(true);
      
      // Buscar próximos agendamentos
      const responseProximos = await fetch("/api/agendamentos/meus?tipo=proximos", {
        credentials: "include",
      });
      
      if (responseProximos.ok) {
        const data = await responseProximos.json();
        setAgendamentosProximos(data.agendamentos || []);
      }

      // Buscar agendamentos passados
      const responsePassados = await fetch("/api/agendamentos/meus?tipo=passados", {
        credentials: "include",
      });
      
      if (responsePassados.ok) {
        const data = await responsePassados.json();
        setAgendamentosPassados(data.agendamentos.slice(0, 3) || []);
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    } finally {
      setLoadingAgendamentos(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      dayOfWeek: date.toLocaleDateString('pt-BR', { weekday: 'short' })
    };
  };

  const formatCurrency = (value: string): string => {
    const numValue = parseFloat(value);
    return numValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: string }> = {
      agendado: { label: "Aguardando", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: "⏳" },
      confirmado: { label: "Confirmado", color: "text-green-600 bg-green-50 border-green-200", icon: "✅" },
      em_atendimento: { label: "Em Atendimento", color: "text-blue-600 bg-blue-50 border-blue-200", icon: "🔵" },
      concluido: { label: "Concluído", color: "text-gray-600 bg-gray-50 border-gray-200", icon: "✔️" },
      cancelado: { label: "Cancelado", color: "text-red-600 bg-red-50 border-red-200", icon: "❌" }
    };
    return statusMap[status] || statusMap.agendado;
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Olá, {user?.nome}!
            </h1>
            <p className="text-sm text-gray-500">Dashboard do Cliente</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Layout com MySchedule sidebar */}
      <div className="flex">
        {/* My Schedule Sidebar */}
        <MySchedule />

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Próximos Agendamentos */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#C5837B]" />
              Próximos Agendamentos
            </h2>
            
            {loadingAgendamentos ? (
              <div className="flex justify-center py-8">
                <BookLoader size={32} className="text-[#C5837B]" />
              </div>
            ) : agendamentosProximos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Você não tem agendamentos futuros
              </p>
            ) : (
              <div className="space-y-4">
                {agendamentosProximos.map((agendamento) => {
                  const dateTime = formatDateTime(agendamento.dataHora);
                  const statusInfo = getStatusInfo(agendamento.status);
                  const nomeEmpresa = agendamento.empresa.nomeFantasia || agendamento.empresa.nomeEmpresa;
                  
                  return (
                    <div key={agendamento.id} className="relative group">
                      {/* Borda de trás */}
                      <div className="absolute inset-0.5 translate-x-1 translate-y-1 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
                      
                      {/* Card principal */}
                      <div className="relative z-10 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start gap-3">
                          {agendamento.empresa.logoUrl && (
                            <img 
                              src={agendamento.empresa.logoUrl} 
                              alt={nomeEmpresa}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {nomeEmpresa}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {agendamento.servico.nome}
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 flex-shrink-0 ${statusInfo.color}`}>
                                {statusInfo.icon} {statusInfo.label}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {dateTime.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {dateTime.time}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => router.push(`/agendamento/confirmacao/${agendamento.id}`)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Ver Detalhes
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card: Histórico */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#C5837B]" />
              Histórico de Atendimentos
            </h2>
            
            {loadingAgendamentos ? (
              <div className="flex justify-center py-8">
                <BookLoader size={32} className="text-[#C5837B]" />
              </div>
            ) : agendamentosPassados.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum atendimento registrado
              </p>
            ) : (
              <div className="space-y-3">
                {agendamentosPassados.map((agendamento) => {
                  const dateTime = formatDateTime(agendamento.dataHora);
                  const statusInfo = getStatusInfo(agendamento.status);
                  const nomeEmpresa = agendamento.empresa.nomeFantasia || agendamento.empresa.nomeEmpresa;
                  
                  return (
                    <div key={agendamento.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm truncate">
                            {nomeEmpresa}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {agendamento.servico.nome}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {dateTime.date}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                        <span className="text-xs font-semibold text-gray-700">
                          {formatCurrency(agendamento.valor)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            O que você gostaria de fazer?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 bg-[#C5837B] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
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
              <h3 className="font-medium text-gray-900 mb-1">
                Agendar Serviço
              </h3>
              <p className="text-sm text-gray-500">
                Buscar e agendar serviços disponíveis
              </p>
            </button>

            <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 bg-[#C5837B] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">
                Meus Agendamentos
              </h3>
              <p className="text-sm text-gray-500">
                Ver e gerenciar seus agendamentos
              </p>
            </button>

            <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 bg-[#C5837B] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Meu Perfil</h3>
              <p className="text-sm text-gray-500">
                Editar informações do perfil
              </p>
            </button>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
