"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/visual/Input";
import Button from "@/components/visual/Button";
import Tabs, { TabItem } from "@/components/visual/Tabs";
import { Select } from "@/components/ui";
import Switch from "@/components/ui/Switch";
import Topbar from "@/app/components/Topbar";
import Modal from "@/components/Modal";
import ImageCropper from "@/app/components/ImageCropper";
import OtpInput from "@/components/OtpInput";
import { useToast } from "@/contexts/ToastContext";
import SecurityTab from "./SecurityTab";
import PagamentosTab from "./PagamentosTab";
import BookLoader from "@/components/BookLoader";

// Componente de Skeleton para a aba Geral
const GeralTabSkeleton = () => (
  <div className="space-y-6">
    {/* Informações Gerais Skeleton */}
    <div className="relative">
      <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
      <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
        </div>

        {/* Avatar Skeleton */}
        <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
          <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-48"></div>
          </div>
        </div>

        {/* Form Fields Skeleton */}
        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
      </div>
    </div>

    {/* Informações de Conta Skeleton */}
    <div className="relative">
      <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
      <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
        </div>

        {/* Grid Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatarUrl?: string;
  tipoUsuario?: "dono" | "usuario";
  createdAt?: string;
  lastLoginAt?: string;
  ativo?: boolean;
}

type TabType = "geral" | "seguranca" | "pagamentos";

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState<TabType>("geral");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { success, error: showError } = useToast();

  // Avatar states
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
  });

  // Preferências e notificações (estado local para UI)
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [notifUpdates, setNotifUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [idioma, setIdioma] = useState("pt-BR");
  const [fuso, setFuso] = useState("America/Sao_Paulo");

  const idiomaOptions = [
    { value: "pt-BR", label: "Português (Brasil)" },
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
  ];

  const fusoOptions = [
    { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
    { value: "America/New_York", label: "Nova York (GMT-5)" },
    { value: "Europe/London", label: "Londres (GMT+0)" },
  ];

  const [senhaData, setSenhaData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  // Função para formatar telefone - precisa estar antes de fetchUser
  const formatPhoneNumber = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Formata com base no tamanho
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

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📞 Dados do usuário carregados:", {
          telefone: data.user.telefone,
          telefoneFormatado: data.user.telefone
            ? formatPhoneNumber(data.user.telefone)
            : "",
        });
        setUser(data.user);
        setFormData({
          nome: data.user.nome || "",
          telefone: data.user.telefone
            ? formatPhoneNumber(data.user.telefone)
            : "",
        });
        if (data.user.avatarUrl) {
          setCroppedImageUrl(data.user.avatarUrl);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "telefone") {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSenhaData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setImageToCrop(imageUrl);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageBlob: Blob) => {
    const croppedUrl = URL.createObjectURL(croppedImageBlob);
    setCroppedImageUrl(croppedUrl);

    const croppedFile = new File([croppedImageBlob], "avatar.png", {
      type: "image/png",
    });
    setAvatarFile(croppedFile);
    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop("");
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSaveGeral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let avatarBase64 = null;
      if (avatarFile) {
        avatarBase64 = await convertFileToBase64(avatarFile);
      }

      // Remover formatação do telefone antes de salvar (manter apenas números)
      const telefoneClean = formData.telefone.replace(/\D/g, "");

      const response = await fetch("/api/perfil/atualizar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nome: formData.nome,
          telefone: telefoneClean,
          avatarBase64,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Atualizar formData com o telefone formatado
        setFormData({
          nome: data.user.nome || "",
          telefone: data.user.telefone
            ? formatPhoneNumber(data.user.telefone)
            : "",
        });
        success("Sucesso!", "Perfil atualizado com sucesso");
        setAvatarFile(null);
      } else {
        const error = await response.json();
        showError("Erro", error.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      showError("Erro", "Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSenha = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      showError("Erro", "As senhas não coincidem");
      return;
    }

    // TODO: Implementar API para atualizar senha
    success("Sucesso!", "Senha atualizada com sucesso");
    setSenhaData({
      senhaAtual: "",
      novaSenha: "",
      confirmarSenha: "",
    });
  };

  // Removido o loader global - cada aba agora gerencia seu próprio skeleton

  // Abas baseadas no tipo de usuário
  const getTabsForUser = (tipoUsuario?: string): TabItem[] => {
    const baseTabs: TabItem[] = [
      {
        id: "geral",
        name: "Geral",
        icon: (
          <svg
            className="w-5 h-5"
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
        ),
      },
      {
        id: "seguranca",
        name: "Segurança",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        ),
      },
      {
        id: "pagamentos",
        name: "Pagamentos",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        ),
      },
    ];

    return baseTabs;
  };

  const tabs = getTabsForUser(user?.tipoUsuario);

  const renderTabContent = () => {
    switch (activeTab) {
      case "geral":
        if (loading) {
          return <GeralTabSkeleton />;
        }
        return (
          <div className="space-y-6">
            {/* Informações Gerais */}
            <div className="relative">
              {/* Borda de trás estática */}
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
              {/* Card principal */}
              <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
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
                  Informações Gerais
                </h3>
                <form onSubmit={handleSaveGeral} className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                    <div className="relative">
                      {croppedImageUrl ? (
                        <img
                          src={croppedImageUrl}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-[#C5837B] flex items-center justify-center text-white text-3xl font-semibold border-2 border-gray-200">
                          {user?.nome?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 w-8 h-8 bg-white text-gray-700 font-semibold border border-gray-300 rounded-full shadow-[3px_3px_0px_#e5e7eb] hover:bg-gray-50 transition-transform transition-shadow duration-100 ease-linear focus:outline-none overflow-hidden active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer flex items-center justify-center"
                      >
                        <svg
                          className="w-4 h-4 text-black"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Foto de Perfil
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Clique no ícone para alterar sua foto de perfil
                      </p>
                      {avatarFile && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Nova foto selecionada
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Nome Completo *"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <Input
                      label="Email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      helpText="O email não pode ser alterado"
                    />
                  </div>

                  <div>
                    <Input
                      label="Telefone"
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={saving}
                      isLoading={saving}
                      variant="primary"
                    >
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Informações de Conta */}
            <div className="relative">
              {/* Borda de trás estática */}
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
              {/* Card principal */}
              <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Informações de Conta
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Data de Criação */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 mt-1">
                      <svg
                        className="w-5 h-5 text-[#C5837B]"
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
                      <h3 className="text-sm font-medium text-gray-900">
                        Data de Criação da Conta
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              },
                            )
                          : "Não disponível"}
                      </p>
                    </div>
                  </div>

                  {/* Último Login */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 mt-1">
                      <svg
                        className="w-5 h-5 text-[#C5837B]"
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
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Último Login
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {user?.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "Não disponível"}
                      </p>
                    </div>
                  </div>

                  {/* Status da Conta */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 mt-1">
                      <svg
                        className="w-5 h-5 text-[#C5837B]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Status da Conta
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            user?.ativo !== false
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <p className="text-sm text-gray-600">
                          {user?.ativo !== false ? "Ativo" : "Inativo"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tipo de Usuário */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 mt-1">
                      <svg
                        className="w-5 h-5 text-[#C5837B]"
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
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Tipo de Usuário
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {user?.tipoUsuario === "dono" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Dono
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Usuário
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "seguranca":
        return <SecurityTab />;

      case "pagamentos":
        return <PagamentosTab />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.tipoUsuario === "dono"
              ? "Perfil do Proprietário"
              : "Meu Perfil"}
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.tipoUsuario === "dono"
              ? "Gerencie suas informações pessoais e configurações da empresa"
              : "Gerencie suas informações pessoais e configurações"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar com Tabs */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as TabType)}
              orientation="vertical"
            />
          </div>

          {/* Conteúdo da Tab Ativa */}
          <div className="flex-1">{renderTabContent()}</div>
        </div>
      </div>

      {/* Modal de Crop de Imagem */}
      <Modal
        isOpen={showCropper}
        onClose={handleCropCancel}
        title="Ajustar Foto de Perfil"
        maxWidth="2xl"
      >
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      </Modal>
    </div>
  );
}
