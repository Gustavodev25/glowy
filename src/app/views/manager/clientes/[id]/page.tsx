"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Upload,
  ClipboardList,
  Edit2,
} from "lucide-react";
import Button from "@/components/visual/Button";
import BookLoader from "@/components/BookLoader";
import Drawer from "@/components/visual/Drawer";
import Input from "@/components/visual/Input";
import { useToast } from "@/contexts/ToastContext";
import HistoricoTab from "./components/HistoricoTab";
import DocumentosTab from "./components/DocumentosTab";
import AnamneseTab from "./components/AnamneseTab";
import Avatar from "@/components/Avatar";

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  cpf?: string;
  avatarUrl?: string;
  createdAt: string;
  agendamentos: any[];
  documentos: any[];
  respostasFormulario: any[];
  _count: {
    agendamentos: number;
    documentos: number;
    respostasFormulario: number;
  };
}

type TabType = "historico" | "documentos" | "anamnese";

export default function ClientePerfilPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const clienteId = params?.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("historico");
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
  });

  useEffect(() => {
    if (clienteId) {
      fetchCliente();
    }
  }, [clienteId]);

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome,
        email: cliente.email || "",
        telefone: cliente.telefone,
        cpf: cliente.cpf || "",
      });
    }
  }, [cliente]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/clientes/${clienteId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Sucesso", "Informações atualizadas");
        setShowEditDrawer(false);
        fetchCliente();
      } else {
        toast.error("Erro", "Não foi possível atualizar as informações");
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro", "Não foi possível atualizar as informações");
    } finally {
      setSaving(false);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }
  };

  const fetchCliente = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clientes/${clienteId}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCliente(data.cliente);
      } else {
        toast.error("Erro", "Cliente não encontrado");
        router.push("/views/manager/clientes");
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      toast.error("Erro", "Não foi possível carregar o cliente");
      router.push("/views/manager/clientes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BookLoader size={48} className="text-[#C5837B]" />
      </div>
    );
  }

  if (!cliente) {
    return null;
  }

  const tabs = [
    {
      id: "historico" as TabType,
      label: "Histórico",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 8l0 4l2 2" />
          <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
        </svg>
      ),
      badge: cliente._count.agendamentos,
    },
    {
      id: "documentos" as TabType,
      label: "Documentos",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M15 3v4a1 1 0 0 0 1 1h4" />
          <path d="M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2z" />
          <path d="M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2" />
        </svg>
      ),
      badge: cliente._count.documentos,
    },
    {
      id: "anamnese" as TabType,
      label: "Anamnese",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm3 14h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m0 -4h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2" />
          <path d="M19 7h-4l-.001 -4.001z" />
        </svg>
      ),
      badge: cliente._count.respostasFormulario,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/views/manager/clientes")}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <div className="flex items-start gap-6">
          {/* Avatar */}
          <Avatar
            name={cliente.nome}
            id={cliente.id}
            imageUrl={cliente.avatarUrl}
            size="2xl"
            className="border-4 border-white shadow-lg"
          />

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {cliente.nome}
              </h1>
              <Button
                variant="ghost"
                onClick={() => setShowEditDrawer(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {cliente.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{cliente.telefone}</span>
                </div>
              )}

              {cliente.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{cliente.email}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Cliente desde{" "}
                  {new Date(cliente.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 flex gap-6">
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {cliente._count.agendamentos}
                </p>
                <p className="text-sm text-gray-600">Atendimentos</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {cliente._count.documentos}
                </p>
                <p className="text-sm text-gray-600">Documentos</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {cliente._count.respostasFormulario}
                </p>
                <p className="text-sm text-gray-600">Anamneses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs com botões estilo visual */}
      <div className="mb-6">
        <div className="flex gap-3 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-4 py-2 rounded-2xl font-semibold text-sm
                border border-gray-300 
                shadow-[3px_3px_0px_#e5e7eb]
                transition-all duration-100
                hover:shadow-[5px_5px_0px_#C5837B]
                active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
                flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? "bg-[#C5837B] text-white border-[#B07268]"
                    : "bg-white text-gray-800 hover:border-[#C5837B]"
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`
                  ml-1 px-2 py-0.5 text-xs font-semibold rounded-full
                  ${activeTab === tab.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-100 text-gray-700'
                  }
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content com transição suave */}
      <div className="relative">
        <div 
          className="transition-all duration-300 ease-in-out"
          style={{
            opacity: 1,
            transform: 'translateY(0)',
          }}
        >
            {activeTab === "historico" && (
            <div className="animate-fadeIn">
              <HistoricoTab
                clienteId={cliente.id}
                agendamentos={cliente.agendamentos}
              />
            </div>
          )}
          {activeTab === "documentos" && (
            <div className="animate-fadeIn">
              <DocumentosTab
                clienteId={cliente.id}
                documentos={cliente.documentos}
                onUpdate={fetchCliente}
              />
            </div>
          )}
          {activeTab === "anamnese" && (
            <div className="animate-fadeIn">
              <AnamneseTab
                clienteId={cliente.id}
                respostas={cliente.respostasFormulario}
                onUpdate={fetchCliente}
              />
            </div>
          )}
        </div>
      </div>

      {/* Drawer de Edição */}
      <Drawer
        isOpen={showEditDrawer}
        onClose={() => !saving && setShowEditDrawer(false)}
        title="Editar Informações"
        width="lg"
        position="right"
        dismissible={!saving}
        footer={
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowEditDrawer(false)}
              disabled={saving}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              isLoading={saving}
              fullWidth
              onClick={handleSave}
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nome Completo"
            type="text"
            placeholder="Digite o nome do cliente"
            value={formData.nome}
            onChange={(e) =>
              setFormData({ ...formData, nome: e.target.value })
            }
            required
            autoFocus
          />

          <Input
            label="Telefone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={formData.telefone}
            onChange={(e) =>
              setFormData({
                ...formData,
                telefone: formatPhone(e.target.value),
              })
            }
            maxLength={15}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="cliente@exemplo.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <Input
            label="CPF"
            type="text"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={(e) =>
              setFormData({ ...formData, cpf: formatCPF(e.target.value) })
            }
            maxLength={14}
          />
        </div>
      </Drawer>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
