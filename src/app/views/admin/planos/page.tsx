"use client";

import { useState, useEffect } from "react";
import PlanDrawer from "./components/PlanDrawer";
import FooterConfirmation from "@/components/FooterConfirmation";
import { useToast } from "@/contexts/ToastContext";
import CardIcon from "@/components/visual/CardIcon";
import Button from "@/components/visual/Button";
import Tooltip from "@/components/visual/Tooltip";

// --- Ícones ---
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
    <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
    <path d="M16 5l3 3" />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 7h16" />
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
    <path d="M10 12l4 4m0 -4l-4 4" />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 mr-2"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

// --- Componente Empty State ---
const EmptyState: React.FC<{ onAddPlan: () => void }> = ({ onAddPlan }) => (
  <div className="relative max-w-lg mx-auto">
    {/* Borda de trás estática */}
    <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>

    {/* Card principal */}
    <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
      <div className="flex justify-center items-center mb-6">
        <CardIcon size="lg" icon="briefcase" color="#C5837B" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
        Nenhum plano cadastrado
      </h3>
      <p className="text-gray-500 mb-6 text-sm sm:text-base">
        Comece criando seu primeiro plano para oferecer aos seus clientes.
      </p>
      <Button
        onClick={onAddPlan}
        variant="primary"
        size="lg"
        className="mx-auto text-base py-3 px-6"
      >
        <PlusIcon />
        Criar Plano
      </Button>
    </div>
  </div>
);

// --- Badge de Status ---
const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
  const statusClass = active
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";

  return (
    <span className={`${baseClasses} ${statusClass}`}>
      {active ? "Ativo" : "Inativo"}
    </span>
  );
};

interface Plano {
  id: string;
  name: string;
  price: number;
  description: string;
  active: boolean;
  createdAt: string;
  interval: string;
  features: string[];
  maxProfissionais: number;
  maxClientes: number;
  maxAgendamentosMes: number;
  permiteMultiEmpresa: boolean;
  permiteRelatorios: boolean;
  permiteIntegracoes: boolean;
  permiteWhatsapp: boolean;
  permiteSms: boolean;
  permiteAgendaOnline: boolean;
  permitePersonalizacao: boolean;
  recommended: boolean;
}

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState<Plano | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planoParaDeletar, setPlanoParaDeletar] = useState<Plano | null>(null);
  const [deletando, setDeletando] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/planos", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setPlanos(data);
      }
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarPlano = () => {
    setPlanoSelecionado(null);
    setDrawerAberto(true);
  };

  const handlePlanoSaved = (message?: string) => {
    if (message) {
      toast.success(message);
    }
    fetchPlanos();
  };

  const handleEditarPlano = (plano: Plano) => {
    setPlanoSelecionado(plano);
    setDrawerAberto(true);
  };

  const handleDeleteClick = (plano: Plano) => {
    setPlanoParaDeletar(plano);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!planoParaDeletar) return;

    setDeletando(true);

    try {
      const response = await fetch(
        `/api/admin/planos?id=${planoParaDeletar.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        toast.success("Plano excluído!", "O plano foi excluído com sucesso.");
        setDeleteModalOpen(false);
        setPlanoSelecionado(null);
        fetchPlanos();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao deletar plano");
      }
    } catch (err) {
      console.error("Erro ao deletar plano:", err);
      toast.error("Erro ao deletar plano. Tente novamente.");
    } finally {
      setDeletando(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setPlanoParaDeletar(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const hasPlanos = planos.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Header */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6">
          <div className="w-full">
            <div className="relative">
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
              <div className="relative z-10 bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-4">
                          Ícone
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Nome
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Descrição
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Preço
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-4 text-center">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, index) => (
                        <tr key={index} className="bg-white border-b">
                          <td className="px-6 py-4">
                            <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
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
      </div>
    );
  }

  return (
    <>
      <PlanDrawer
        isOpen={drawerAberto}
        onClose={() => setDrawerAberto(false)}
        onSuccess={handlePlanoSaved}
        plan={planoSelecionado}
      />

      <FooterConfirmation
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Permitir esta ação?"
        subtitle="Após aceitar a ação será executada."
        message={`Você quer mesmo excluir o plano "${planoParaDeletar?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Aceitar"
        cancelText="Cancelar"
        isLoading={deletando}
      />

      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Header */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Planos</h1>
              <p className="text-sm text-gray-500 mt-1">
                Gerencie os planos de assinatura disponíveis para seus clientes
              </p>
            </div>
            {hasPlanos && (
              <Button
                onClick={handleCriarPlano}
                variant="primary"
                size="md"
                className="whitespace-nowrap"
              >
                <PlusIcon />
                Criar Plano
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6">
          <div className="w-full">
            <div className="relative min-h-[600px]">
              {/* Overlay do estado vazio */}
              {!hasPlanos && (
                <div className="absolute inset-0 flex items-center justify-center z-20 p-4">
                  <EmptyState onAddPlan={handleCriarPlano} />
                </div>
              )}

              {/* Conteúdo da Tabela (com efeito de blur e máscara) */}
              <div
                className={`transition-all duration-300 ${!hasPlanos ? "blur-sm grayscale opacity-60 pointer-events-none" : ""}`}
                style={{
                  maskImage: !hasPlanos
                    ? "linear-gradient(to bottom, black 60%, transparent 100%)"
                    : "none",
                  WebkitMaskImage: !hasPlanos
                    ? "linear-gradient(to bottom, black 60%, transparent 100%)"
                    : "none",
                }}
              >
                <div className="relative">
                  {/* Borda de trás estática */}
                  <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>

                  {/* Card principal */}
                  <div className="relative z-10 bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-4">
                              Nome
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 hidden md:table-cell"
                            >
                              Descrição
                            </th>
                            <th scope="col" className="px-6 py-4">
                              Preço
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 hidden lg:table-cell"
                            >
                              Status
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {planos.map((plano) => (
                            <tr
                              key={plano.id}
                              className="bg-white border-b hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 font-medium text-gray-900">
                                <div className="max-w-[200px] truncate">
                                  {plano.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600 hidden md:table-cell">
                                <div className="max-w-[250px] truncate">
                                  {plano.description || "-"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {formatCurrency(plano.price)}
                              </td>
                              <td className="px-6 py-4 hidden lg:table-cell">
                                <StatusBadge active={plano.active} />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center space-x-2">
                                  <Tooltip
                                    content="Editar plano"
                                    position="top"
                                    delay={100}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-800"
                                      aria-label="Editar"
                                      onClick={() => handleEditarPlano(plano)}
                                    >
                                      <EditIcon />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip
                                    content="Excluir plano"
                                    position="top"
                                    delay={100}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-800"
                                      aria-label="Excluir"
                                      onClick={() => handleDeleteClick(plano)}
                                    >
                                      <TrashIcon />
                                    </Button>
                                  </Tooltip>
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
          </div>
        </div>
      </div>
    </>
  );
}
