"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Phone, Calendar } from "lucide-react";
import Button from "@/components/visual/Button";
import Input from "@/components/visual/Input";
import { useToast } from "@/contexts/ToastContext";
import NovoClienteDrawer from "./components/NovoClienteDrawer";
import Avatar from "@/components/Avatar";
import ClienteCardSkeleton from "./components/ClienteCardSkeleton";
import CardIcon from "@/components/visual/CardIcon";

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  cpf?: string;
  avatarUrl?: string;
  createdAt: string;
  _count?: {
    agendamentos: number;
  };
}

// Componente para o Estado Vazio (Empty State)
const EmptyState: React.FC<{ onAddCliente: () => void; searchTerm: string }> = ({ onAddCliente, searchTerm }) => (
  <div className="relative max-w-lg mx-auto">
    {/* Borda de trás estática */}
    <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>

    {/* Card principal */}
    <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
      <div className="flex justify-center items-center mb-6">
        <CardIcon
          size="lg"
          icon="heart"
          color="#C5837B"
        />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
        {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
      </h3>
      <p className="text-gray-500 mb-6 text-sm sm:text-base">
        {searchTerm
          ? "Tente buscar por outro termo ou ajuste os filtros"
          : "Comece adicionando seu primeiro cliente para gerenciar atendimentos e histórico"}
      </p>
      {!searchTerm && (
        <Button
          onClick={onAddCliente}
          variant="primary"
          size="lg"
          className="mx-auto text-base py-3 px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Primeiro Cliente
        </Button>
      )}
    </div>
  </div>
);

export default function ClientesPage() {
  const router = useRouter();
  const toast = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNovoDrawer, setShowNovoDrawer] = useState(false);
  const [loadingNewCliente, setLoadingNewCliente] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await fetch("/api/clientes", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setClientes(data.clientes || []);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Erro", "Não foi possível carregar os clientes");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const filteredClientes = clientes.filter((cliente) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(searchLower) ||
      cliente.telefone.includes(searchTerm) ||
      cliente.email?.toLowerCase().includes(searchLower) ||
      cliente.cpf?.includes(searchTerm)
    );
  });

  const handleClienteCreated = async () => {
    setLoadingNewCliente(true);
    // Aguarda um pouco para mostrar o skeleton antes de buscar
    await new Promise(resolve => setTimeout(resolve, 300));
    await fetchClientes(false); // Não mostrar loading geral
    setLoadingNewCliente(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
        </div>
        <div className="mb-6">
          <div className="h-12 bg-gray-200 rounded max-w-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ClienteCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes</h1>
            <p className="text-gray-600">
              Gerencie seus clientes e visualize o histórico completo de atendimentos
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowNovoDrawer(true)}
            className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
          <Input
            type="text"
            placeholder="Buscar por nome, telefone, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12"
          />
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="relative min-h-[calc(100vh-280px)]">
        {/* Overlay do estado vazio */}
        {filteredClientes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-20 p-4">
            <EmptyState onAddCliente={() => setShowNovoDrawer(true)} searchTerm={searchTerm} />
          </div>
        )}

        {/* Grid de clientes com efeito de blur quando vazio */}
        <div
          className={`transition-all duration-300 ${
            filteredClientes.length === 0 ? 'blur-sm grayscale opacity-60 pointer-events-none' : ''
          }`}
          style={{
            maskImage: filteredClientes.length === 0 ? 'linear-gradient(to bottom, black 60%, transparent 100%)' : 'none',
            WebkitMaskImage: filteredClientes.length === 0 ? 'linear-gradient(to bottom, black 60%, transparent 100%)' : 'none',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingNewCliente && <ClienteCardSkeleton />}
          {filteredClientes.map((cliente) => (
            <div
              key={cliente.id}
              onClick={() =>
                router.push(`/views/manager/clientes/${cliente.id}`)
              }
              className="relative group cursor-pointer"
            >
              {/* Card com efeitos do Modal */}
              <div className="relative bg-white border border-gray-300 rounded-lg shadow-[3px_3px_0px_#e5e7eb] overflow-hidden transition-all duration-200 hover:shadow-[5px_5px_0px_#C5837B] hover:border-[#C5837B]">
                {/* Efeito de brilho igual ao Modal */}
                <span className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-20 animate-pulse" />
                <span className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-20 animate-pulse" />
                
                {/* Conteúdo do card */}
                <div className="relative z-10 p-4">
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar */}
                  <Avatar
                    name={cliente.nome}
                    id={cliente.id}
                    imageUrl={cliente.avatarUrl}
                    size="md"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 truncate mb-0.5">
                      {cliente.nome}
                    </h3>
                    
                    {cliente.email && (
                      <p className="text-xs text-gray-500 truncate">
                        {cliente.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Detalhes */}
                <div className="space-y-1.5 pt-3 border-t border-gray-100">
                  {cliente.telefone && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-6 h-6 rounded-lg bg-[#C5837B]/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-3.5 h-3.5 text-[#C5837B]" />
                      </div>
                      <span className="truncate font-medium">{cliente.telefone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      cliente._count && cliente._count.agendamentos > 0
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}>
                      <Calendar className={`w-3.5 h-3.5 ${
                        cliente._count && cliente._count.agendamentos > 0
                          ? "text-green-600"
                          : "text-gray-400"
                      }`} />
                    </div>
                    <span className="font-medium">
                      {cliente._count && cliente._count.agendamentos > 0 ? (
                        <>
                          {cliente._count.agendamentos} atendimento
                          {cliente._count.agendamentos !== 1 ? "s" : ""}
                        </>
                      ) : (
                        <span className="text-gray-400">Nenhum atendimento</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Footer com data de cadastro */}
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400">
                    Cliente desde {new Date(cliente.createdAt).toLocaleDateString("pt-BR", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
      {/* Drawer de Novo Cliente */}
      <NovoClienteDrawer
        isOpen={showNovoDrawer}
        onClose={() => setShowNovoDrawer(false)}
        onSuccess={handleClienteCreated}
      />
    </div>
  );
}
