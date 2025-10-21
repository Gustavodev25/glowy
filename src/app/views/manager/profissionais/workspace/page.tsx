"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import UniversalLoader from "@/components/UniversalLoader";

// Supondo que BookLoader seja um componente que você já tenha.
// Para este exemplo, vamos criar um loader simples.
const BookLoader = ({ size = 48, className = "" }) => (
  <div style={{ width: size, height: size }} className={`animate-spin rounded-full border-4 border-solid border-current border-r-transparent ${className}`} role="status">
    <span className="sr-only">Loading...</span>
  </div>
);


interface Professional {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  ativo: boolean;
  especialidades?: string[];
  renda: number;
  dataInicio: string;
}

export default function WorkspaceGeral() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setProfessionals([
        {
          id: "1",
          nome: "João Silva",
          email: "joao@empresa.com",
          cargo: "Barbeiro",
          ativo: true,
          especialidades: ["Corte", "Barba"],
          renda: 5231.22,
          dataInicio: "14/01/2023"
        },
        {
          id: "2",
          nome: "Maria Santos",
          email: "maria@empresa.com",
          cargo: "Manicure",
          ativo: true,
          especialidades: ["Manicure", "Pedicure"],
          renda: 4180.50,
          dataInicio: "20/03/2023"
        },
        {
          id: "3",
          nome: "Pedro Costa",
          email: "pedro@empresa.com",
          cargo: "Barbeiro",
          ativo: false,
          especialidades: ["Corte", "Barba"],
          renda: 3230.00,
          dataInicio: "19/06/2023"
        },
        {
          id: "4",
          nome: "Ana Oliveira",
          email: "ana@empresa.com",
          cargo: "Esteticista",
          ativo: true,
          especialidades: ["Limpeza", "Tratamento"],
          renda: 2850.75,
          dataInicio: "05/08/2023"
        },
        {
          id: "5",
          nome: "Carlos Mendes",
          email: "carlos@empresa.com",
          cargo: "Massagista",
          ativo: false,
          especialidades: ["Massagem", "Relaxamento"],
          renda: 1950.00,
          dataInicio: "12/11/2023"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <UniversalLoader size="xl" text="Carregando workspace..." />
      </div>
    );
  }

  const totalAtivos = professionals.filter(p => p.ativo).length;
  const totalInativos = professionals.filter(p => !p.ativo).length;
  const rendaTotal = professionals.reduce((acc, p) => acc + p.renda, 0);
  const rendaMedia = professionals.length > 0 ? rendaTotal / professionals.length : 0;

  const metrics = [
    {
      title: "Profissionais Ativos",
      value: totalAtivos,
      icon: (
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      subtitle: "Em atividade",
      color: "text-green-600"
    },
    {
      title: "Renda Total",
      value: `R$ ${rendaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: (
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      subtitle: "Este mês",
      color: "text-blue-600"
    },
    {
      title: "Renda Média",
      value: `R$ ${rendaMedia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: (
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      subtitle: "Por profissional",
      color: "text-purple-600"
    },
    {
      title: "Profissionais Inativos",
      value: totalInativos,
      icon: (
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
        </svg>
      ),
      subtitle: "Fora de atividade",
      color: "text-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Gerenciar Equipe"
        description="Gerencie os profissionais da sua equipe"
        action={
          <button className="px-6 py-2.5 bg-[#C5837B] text-white rounded-lg hover:bg-[#B0736B] transition-colors font-medium">
            Convidar Profissional
          </button>
        }
      />

      <div className="p-6">

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gray-200/70 rounded-2xl p-1 shadow-sm">
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                {metric.icon}
                <span className="text-sm text-gray-600 font-normal">{metric.title}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                <span className={`font-normal text-sm ${metric.color}`}>{metric.subtitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de profissionais */}
      <div className="bg-gray-200/70 rounded-2xl p-1 shadow-sm">
        <div className="relative bg-white rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-500">Profissionais</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Nome do Profissionais
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Renda do Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Começou em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {professionals.map((professional) => (
                  <tr key={professional.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {professional.nome.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {professional.nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {professional.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{professional.cargo}</span>
                        {professional.especialidades && (
                          <div className="flex gap-1">
                            {professional.especialidades.map((esp, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded"
                              >
                                {esp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        R$ {professional.renda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${professional.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {professional.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {professional.dataInicio}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="text-gray-600 hover:text-red-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

