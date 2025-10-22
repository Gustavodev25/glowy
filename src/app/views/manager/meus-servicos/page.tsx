"use client";

import React, { useState, useEffect } from 'react';
import CardIcon from "@/components/visual/CardIcon";
import Button from "@/components/visual/Button";
import Tooltip from "@/components/visual/Tooltip";
import FooterConfirmation from "@/components/FooterConfirmation";
import ServiceDrawer from "./ServiceDrawer";
import { useToast } from "@/contexts/ToastContext";


// --- Ícones (usando SVGs para não depender de bibliotecas externas) ---
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
    <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
    <path d="M16 5l3 3" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 7h16" />
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
    <path d="M10 12l4 4m0 -4l-4 4" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);



// --- Tipagem para os dados do serviço ---
interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // em minutos
  price?: number;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Função para formatar duração ---
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
};


// --- Componente do Badge de Status ---
const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
  const statusClass = active
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";

  return (
    <span className={`${baseClasses} ${statusClass}`}>
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
};


// --- Componente para o Estado Vazio (Empty State) ---
const EmptyState: React.FC<{ onAddService: () => void }> = ({ onAddService }) => (
  <div className="relative max-w-lg mx-auto">
    {/* Borda de trás estática */}
    <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>

    {/* Card principal */}
    <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
      <div className="flex justify-center items-center mb-6">
        <CardIcon
          size="lg"
          icon="briefcase"
          color="#C5837B"
        />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Nenhum serviço cadastrado</h3>
      <p className="text-gray-500 mb-6 text-sm sm:text-base">
        Comece criando seu primeiro serviço para oferecer aos seus clientes.
      </p>
      <Button
        onClick={onAddService}
        variant="primary"
        size="lg"
        className="mx-auto text-base py-3 px-6"
      >
        <PlusIcon />
        Adicionar Novo Serviço
      </Button>
    </div>
  </div>
);


// --- Componente Principal da Página ---
export default function MeusServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  // Função para buscar serviços da API
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error('Erro ao buscar serviços');
      }

      const data = await response.json();
      setServices(data.services || []);
    } catch (err) {
      console.error('Erro ao buscar serviços:', err);
      setError('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir modal de confirmação de exclusão
  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
  };

  // Função para confirmar exclusão
  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/services/${serviceToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir serviço');
      }

      // Recarregar lista de serviços
      await fetchServices();

      // Fechar modal
      setDeleteModalOpen(false);
      setServiceToDelete(null);

      // Mostrar toast de sucesso
      toast.success("Serviço excluído!", "O serviço foi excluído com sucesso.");
    } catch (err) {
      console.error('Erro ao excluir serviço:', err);
      toast.error("Erro ao excluir serviço", "Tente novamente ou entre em contato com o suporte.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para cancelar exclusão
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setServiceToDelete(null);
  };

  // Carregar serviços ao montar o componente
  useEffect(() => {
    fetchServices();
  }, []);

  // Função para criar novo serviço
  const handleCreateService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar serviço');
      }

      // Recarregar lista de serviços
      await fetchServices();
    } catch (err) {
      console.error('Erro ao criar serviço:', err);
      throw err;
    }
  };

  // Função para atualizar serviço
  const handleUpdateService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingService) return;

    try {
      const response = await fetch(`/api/services/${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar serviço');
      }

      // Recarregar lista de serviços
      await fetchServices();
    } catch (err) {
      console.error('Erro ao atualizar serviço:', err);
      throw err;
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setIsDrawerOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingService(null);
  };

  const handleSaveService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingService) {
      await handleUpdateService(serviceData);
    } else {
      await handleCreateService(serviceData);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const hasServices = services.length > 0;

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
                  <table className="w-full text-sm text-left text-gray-600 min-w-[640px]">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 sm:px-6 py-3">Imagem</th>
                        <th scope="col" className="px-3 sm:px-6 py-3">Serviço</th>
                        <th scope="col" className="px-3 sm:px-6 py-3 hidden md:table-cell">Descrição</th>
                        <th scope="col" className="px-3 sm:px-6 py-3">Duração</th>
                        <th scope="col" className="px-3 sm:px-6 py-3">Preço</th>
                        <th scope="col" className="px-3 sm:px-6 py-3 hidden sm:table-cell">Status</th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, index) => (
                        <tr key={index} className="bg-white border-b">
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="relative">
                              <div className="relative inline-flex items-center justify-center bg-white text-gray-700 border border-gray-300 rounded-2xl shadow-[3px_3px_0px_#e5e7eb] transition-transform transition-shadow duration-100 ease-linear hover:bg-gray-50 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none w-12 h-12 sm:w-16 sm:h-16 overflow-hidden animate-pulse">
                                <div className="w-full h-full bg-gray-200 rounded-lg"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="h-4 bg-gray-200 rounded w-24 sm:w-32 animate-pulse"></div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                            <div className="h-4 bg-gray-200 rounded w-20 sm:w-24 animate-pulse"></div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="h-4 bg-gray-200 rounded w-12 sm:w-16 animate-pulse"></div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="h-4 bg-gray-200 rounded w-16 sm:w-20 animate-pulse"></div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                            <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Header */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meus Serviços</h1>
              <p className="text-sm text-gray-500 mt-1">Gerencie os serviços oferecidos pela sua empresa</p>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="px-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchServices} variant="primary" size="md">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Serviços</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie os serviços oferecidos pela sua empresa</p>
          </div>
          <Button
            onClick={handleAddService}
            variant="primary"
            size="md"
            className="whitespace-nowrap"
          >
            <PlusIcon />
            Adicionar Serviço
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        <div className="w-full">
          <div className="relative min-h-[calc(100vh-200px)]">
            {/* Overlay do estado vazio */}
            {!hasServices && (
              <div className="absolute inset-0 flex items-center justify-center z-20 p-4">
                <EmptyState onAddService={handleAddService} />
              </div>
            )}

            {/* Conteúdo da Tabela (com efeito de blur e máscara) */}
            <div
              className={`transition-all duration-300 ${!hasServices ? 'blur-sm grayscale opacity-60 pointer-events-none' : ''}`}
              style={{
                maskImage: !hasServices ? 'linear-gradient(to bottom, black 60%, transparent 100%)' : 'none',
                WebkitMaskImage: !hasServices ? 'linear-gradient(to bottom, black 60%, transparent 100%)' : 'none',
              }}
            >
              <div className="relative">
                {/* Borda de trás estática */}
                <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>

                {/* Card principal */}
                <div className="relative z-10 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Mobile: Cards em grid */}
                  <div className="block sm:hidden">
                    <div className="p-4 space-y-4">
                      {services.map((service) => (
                        <div key={service.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start gap-4">
                            {/* Imagem */}
                            <div className="relative flex-shrink-0">
                              <div className="relative inline-flex items-center justify-center bg-white text-gray-700 border border-gray-300 rounded-xl shadow-sm w-16 h-16 overflow-hidden">
                                {service.imageUrl ? (
                                  <img
                                    src={service.imageUrl}
                                    alt={service.name}
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (nextElement) {
                                        nextElement.style.display = 'flex';
                                      }
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-full h-full flex items-center justify-center text-gray-400 ${service.imageUrl ? 'hidden' : 'flex'}`}
                                >
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* Conteúdo */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base font-semibold text-gray-900 truncate">{service.name}</h3>
                                  {service.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                                  )}
                                </div>
                                <StatusBadge active={service.active} />
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>{formatDuration(service.duration)}</span>
                                  {service.price && (
                                    <span className="font-medium text-gray-900">{formatCurrency(service.price)}</span>
                                  )}
                                </div>

                                {/* Ações */}
                                <div className="flex items-center gap-2">
                                  <Tooltip content="Editar serviço" position="top" delay={100}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-800 p-2"
                                      aria-label="Editar"
                                      onClick={() => handleEditService(service)}
                                    >
                                      <EditIcon />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip content="Excluir serviço" position="top" delay={100}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-800 p-2"
                                      aria-label="Excluir"
                                      onClick={() => handleDeleteClick(service)}
                                    >
                                      <TrashIcon />
                                    </Button>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop: Tabela */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-4">Imagem</th>
                          <th scope="col" className="px-6 py-4">Serviço</th>
                          <th scope="col" className="px-6 py-4 hidden md:table-cell">Descrição</th>
                          <th scope="col" className="px-6 py-4">Duração</th>
                          <th scope="col" className="px-6 py-4">Preço</th>
                          <th scope="col" className="px-6 py-4 hidden lg:table-cell">Status</th>
                          <th scope="col" className="px-6 py-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((service) => (
                          <tr key={service.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="relative">
                                {/* Card principal */}
                                <div className="relative inline-flex items-center justify-center bg-white text-gray-700 border border-gray-300 rounded-xl shadow-sm w-16 h-16 overflow-hidden">
                                  {service.imageUrl ? (
                                    <img
                                      src={service.imageUrl}
                                      alt={service.name}
                                      className="w-full h-full object-cover rounded-lg"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (nextElement) {
                                          nextElement.style.display = 'flex';
                                        }
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className={`w-full h-full flex items-center justify-center text-gray-400 ${service.imageUrl ? 'hidden' : 'flex'}`}
                                  >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="max-w-[200px] truncate">{service.name}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 hidden md:table-cell">
                              <div className="max-w-[250px] truncate">{service.description || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDuration(service.duration)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {service.price ? formatCurrency(service.price) : '-'}
                            </td>
                            <td className="px-6 py-4 hidden lg:table-cell">
                              <StatusBadge active={service.active} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center space-x-2">
                                <Tooltip content="Editar serviço" position="top" delay={100}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-800"
                                    aria-label="Editar"
                                    onClick={() => handleEditService(service)}
                                  >
                                    <EditIcon />
                                  </Button>
                                </Tooltip>
                                <Tooltip content="Excluir serviço" position="top" delay={100}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-800"
                                    aria-label="Excluir"
                                    onClick={() => handleDeleteClick(service)}
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

      {/* Drawer de criação/edição de serviço */}
      <ServiceDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveService}
        service={editingService}
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
      />

      {/* Confirmação de exclusão no footer */}
      <FooterConfirmation
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Permite esta ação?"
        subtitle="Após aceitar a ação será executada."
        message={`Você quer mesmo excluir o serviço "${serviceToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Aceitar"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}
