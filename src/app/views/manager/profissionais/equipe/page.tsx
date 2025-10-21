"use client";

import { useEffect, useState } from "react";
import { MovingBorder } from "@/components/MovingBorder";
import BookLoader from "@/components/BookLoader";

interface Professional {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  salario?: number;
  ativo: boolean;
  especialidades?: string[];
  dataAdmissao: string;
}

export default function GerenciarEquipe() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setProfessionals([
        {
          id: "1",
          nome: "João Silva",
          email: "joao@empresa.com",
          cargo: "Barbeiro",
          salario: 5231.22,
          ativo: true,
          especialidades: ["Corte", "Barba", "Bigode"],
          dataAdmissao: "2023-01-14",
        },
        {
          id: "2",
          nome: "Maria Santos",
          email: "maria@empresa.com",
          cargo: "Manicure",
          salario: 4220.5,
          ativo: true,
          especialidades: ["Manicure", "Pedicure", "Esmaltação"],
          dataAdmissao: "2023-03-10",
        },
        {
          id: "3",
          nome: "Pedro Costa",
          email: "pedro@empresa.com",
          cargo: "Barbeiro",
          salario: 3230.0,
          ativo: false,
          especialidades: ["Corte", "Barba"],
          dataAdmissao: "2023-06-20",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const toggleProfessionalStatus = (id: string) => {
    setProfessionals((prev) =>
      prev.map((prof) => (prof.id === id ? { ...prof, ativo: !prof.ativo } : prof))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BookLoader size={48} className="text-[#C5837B]" />
      </div>
    );
  }

  const ativos = professionals.filter((p) => p.ativo).length;
  const inativos = professionals.filter((p) => !p.ativo).length;
  const cargosUnicos = Array.from(new Set(professionals.map((p) => p.cargo).filter(Boolean))).length;
  const mediaSalarial =
    professionals.length > 0
      ? professionals.reduce((sum, p) => sum + (p.salario || 0), 0) / professionals.length
      : 0;

  const cards = [
    {
      key: 'ativos',
      titulo: 'Profissionais',
      valor: ativos,
      sufixo: 'Ativos',
      sufixoClass: 'text-green-600',
      icon: (
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 6a2 2 0 110 4 2 2 0 010-4" />
        </svg>
      ),
    },
    {
      key: 'inativos',
      titulo: 'Profissionais',
      valor: inativos,
      sufixo: 'Inativos',
      sufixoClass: 'text-red-600',
      icon: (
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l6 6M21 9l-6 6" />
        </svg>
      ),
    },
    {
      key: 'cargos',
      titulo: 'Cargos',
      valor: cargosUnicos,
      sufixo: 'Únicos',
      sufixoClass: 'text-gray-600',
      icon: (
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 10h12M9 13h6M10 17h4" />
        </svg>
      ),
    },
    {
      key: 'media',
      titulo: 'Salário',
      valor: mediaSalarial,
      sufixo: 'Média',
      sufixoClass: 'text-gray-600',
      moeda: true as const,
      icon: (
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v-1" />
        </svg>
      ),
    },
  ];

  const renderIcon = (key: string) => {
    switch (key) {
      case 'ativos':
        return (
          <svg className="w-5 h-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
            <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
            <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
            <path d="M17 10h2a2 2 0 0 1 2 2v1" />
            <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
            <path d="M3 13v-1a2 2 0 0 1 2 -2h2" />
          </svg>
        );
      case 'inativos':
        return (
          <svg className="w-5 h-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
            <path d="M3 21v-2a4 4 0 0 1 4 -4h4c.948 0 1.818 .33 2.504 .88" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            <path d="M16 19h6" />
          </svg>
        );
      case 'cargos':
        return (
          <svg className="w-5 h-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9z" />
            <path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
          </svg>
        );
      case 'media':
        return (
          <svg className="w-5 h-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" />
            <path d="M12 3v3m0 12v3" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" />
        );
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Equipe</h1>
            <p className="text-gray-600 mt-2">Gerencie os profissionais da sua equipe</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#C5837B] text-white rounded-lg hover:bg-[#B0736B] transition-colors font-medium text-sm"
          >
            Convidar Profissional
          </button>
        </div>
      </div>

      {/* Cards de métricas (conforme layout: 4 iguais) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.key} className="relative">
            {/* Borda de trás com efeito animado */}
            <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none overflow-hidden">
              <MovingBorder duration={6000} rx={16} ry={16}>
                <div
                  className="h-12 w-12 opacity-70 blur-md"
                  style={{ background: "radial-gradient(#C5837B 45%, transparent 60%)" }}
                />
              </MovingBorder>
            </div>
            {/* Card principal */}
            <div className="relative z-10 bg-white p-5 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3">
                {renderIcon(card.key)}
                <span className="text-sm font-medium text-gray-900">{card.titulo}</span>
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-gray-900">
                  {card.moeda
                    ? (card.valor as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : (card.valor as number)}
                </span>
                <span className={`text-sm font-medium ${card.sufixoClass}`}>{card.sufixo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-sm font-medium text-[#BCBCBC]">Profissionais</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Profissionais</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renda do Profissional</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Começo em</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {professionals.map((professional) => (
                <tr key={professional.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold mr-4">
                        {professional.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{professional.nome}</div>
                        <div className="text-xs text-gray-500">{professional.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{professional.cargo}</div>
                    {professional.especialidades && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {professional.especialidades.slice(0, 2).map((esp, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                            {esp}
                          </span>
                        ))}
                        {professional.especialidades.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                            +{professional.especialidades.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {professional.salario?.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleProfessionalStatus(professional.id)}
                      className={`text-sm font-medium ${professional.ativo ? "text-green-600" : "text-red-600"
                        } hover:underline`}
                    >
                      {professional.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(professional.dataAdmissao).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button className="text-gray-600 hover:text-gray-900" title="Editar">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M16.5 3.964a2.25 2.25 0 113.182 3.182L7.5 19.5 3 21l1.5-4.5L16.5 3.964z" />
                        </svg>
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Excluir">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2" />
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

      {/* Modal de convidar profissional */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Convidar Profissional</h3>
            <p className="text-gray-600 mb-4">Funcionalidade em desenvolvimento...</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-[#C5837B] text-white rounded-lg hover:bg-[#B0736B] transition-colors"
              >
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
