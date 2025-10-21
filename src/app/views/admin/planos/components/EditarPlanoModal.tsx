"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Stepper from "@/app/components/Stepper";
import { Spinner } from "@/components/Spinner";

interface Plano {
  id: string;
  name: string;
  description: string;
  price: number;
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

interface EditarPlanoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  plano: Plano | null;
}

interface PlanoFormData {
  nome: string;
  descricao: string;
  preco: string;
  intervalo: "MONTHLY" | "YEARLY";
  funcionalidades: string[];
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

export default function EditarPlanoModal({
  isOpen,
  onClose,
  onSuccess,
  plano,
}: EditarPlanoModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [novaFuncionalidade, setNovaFuncionalidade] = useState("");

  const [formData, setFormData] = useState<PlanoFormData>({
    nome: "",
    descricao: "",
    preco: "",
    intervalo: "MONTHLY",
    funcionalidades: [],
    maxProfissionais: 1,
    maxClientes: 100,
    maxAgendamentosMes: 50,
    permiteMultiEmpresa: false,
    permiteRelatorios: false,
    permiteIntegracoes: false,
    permiteWhatsapp: false,
    permiteSms: false,
    permiteAgendaOnline: true,
    permitePersonalizacao: false,
    recommended: false,
  });

  // Carregar dados do plano quando modal abrir
  useEffect(() => {
    if (isOpen && plano) {
      setFormData({
        nome: plano.name,
        descricao: plano.description,
        preco: plano.price.toString(),
        intervalo: plano.interval as "MONTHLY" | "YEARLY",
        funcionalidades: plano.features || [],
        maxProfissionais: plano.maxProfissionais,
        maxClientes: plano.maxClientes,
        maxAgendamentosMes: plano.maxAgendamentosMes,
        permiteMultiEmpresa: plano.permiteMultiEmpresa,
        permiteRelatorios: plano.permiteRelatorios,
        permiteIntegracoes: plano.permiteIntegracoes,
        permiteWhatsapp: plano.permiteWhatsapp,
        permiteSms: plano.permiteSms,
        permiteAgendaOnline: plano.permiteAgendaOnline,
        permitePersonalizacao: plano.permitePersonalizacao,
        recommended: plano.recommended,
      });
    }
  }, [isOpen, plano]);

  const adicionarFuncionalidade = () => {
    if (novaFuncionalidade.trim()) {
      setFormData((prev) => ({
        ...prev,
        funcionalidades: [...prev.funcionalidades, novaFuncionalidade.trim()],
      }));
      setNovaFuncionalidade("");
    }
  };

  const removerFuncionalidade = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      funcionalidades: prev.funcionalidades.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!plano) return;

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("id", plano.id);
      formDataToSend.append("nome", formData.nome);
      formDataToSend.append("descricao", formData.descricao);
      formDataToSend.append("preco", formData.preco);
      formDataToSend.append("intervalo", formData.intervalo);
      formDataToSend.append(
        "funcionalidades",
        JSON.stringify(formData.funcionalidades),
      );
      formDataToSend.append(
        "maxProfissionais",
        formData.maxProfissionais.toString(),
      );
      formDataToSend.append("maxClientes", formData.maxClientes.toString());
      formDataToSend.append(
        "maxAgendamentosMes",
        formData.maxAgendamentosMes.toString(),
      );
      formDataToSend.append(
        "permiteMultiEmpresa",
        formData.permiteMultiEmpresa.toString(),
      );
      formDataToSend.append(
        "permiteRelatorios",
        formData.permiteRelatorios.toString(),
      );
      formDataToSend.append(
        "permiteIntegracoes",
        formData.permiteIntegracoes.toString(),
      );
      formDataToSend.append(
        "permiteWhatsapp",
        formData.permiteWhatsapp.toString(),
      );
      formDataToSend.append("permiteSms", formData.permiteSms.toString());
      formDataToSend.append(
        "permiteAgendaOnline",
        formData.permiteAgendaOnline.toString(),
      );
      formDataToSend.append(
        "permitePersonalizacao",
        formData.permitePersonalizacao.toString(),
      );
      formDataToSend.append(
        "recommended",
        formData.recommended.toString(),
      );

      const response = await fetch("/api/admin/planos", {
        method: "PUT",
        body: formDataToSend,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar plano");
      }

      const data = await response.json();
      console.log("Plano atualizado:", data);

      onSuccess("Plano atualizado com sucesso!");
      handleClose();
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      nome: "",
      descricao: "",
      preco: "",
      intervalo: "MONTHLY",
      funcionalidades: [],
      maxProfissionais: 1,
      maxClientes: 100,
      maxAgendamentosMes: 50,
      permiteMultiEmpresa: false,
      permiteRelatorios: false,
      permiteIntegracoes: false,
      permiteWhatsapp: false,
      permiteSms: false,
      permiteAgendaOnline: true,
      permitePersonalizacao: false,
      recommended: false,
    });
    onClose();
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const canGoNext = () => {
    switch (step) {
      case 1:
        return formData.nome.trim() && formData.descricao.trim();
      case 2:
        return formData.preco && parseFloat(formData.preco) > 0;
      case 3:
        return formData.funcionalidades.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const steps = [
    "Informações Básicas",
    "Preço e Periodicidade",
    "Funcionalidades",
    "Permissões e Limites",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Plano"
      maxWidth="2xl"
    >
      <div className="p-6">
        {/* Stepper */}
        <Stepper steps={steps} currentStep={step - 1} />

        {/* Step 1: Informações Básicas */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações Básicas
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Plano
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nome: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5837B] focus:border-transparent text-gray-900"
                placeholder="Ex: Plano Premium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descricao: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5837B] focus:border-transparent resize-none text-gray-900"
                placeholder="Descreva os benefícios do plano..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Preço e Intervalo */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preço e Periodicidade
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, preco: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5837B] focus:border-transparent text-gray-900"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periodicidade
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, intervalo: "MONTHLY" }))
                  }
                  className={`py-3 px-4 rounded-lg border-2 transition-colors ${formData.intervalo === "MONTHLY"
                      ? "border-[#C5837B] bg-[#C5837B]/10 text-[#C5837B] font-medium"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, intervalo: "YEARLY" }))
                  }
                  className={`py-3 px-4 rounded-lg border-2 transition-colors ${formData.intervalo === "YEARLY"
                      ? "border-[#C5837B] bg-[#C5837B]/10 text-[#C5837B] font-medium"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                >
                  Anual
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Funcionalidades */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Funcionalidades do Plano
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={novaFuncionalidade}
                onChange={(e) => setNovaFuncionalidade(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && adicionarFuncionalidade()
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5837B] focus:border-transparent text-gray-900"
                placeholder="Digite uma funcionalidade..."
              />
              <button
                type="button"
                onClick={adicionarFuncionalidade}
                className="bg-[#C5837B] hover:bg-[#B37469] text-white px-6 py-2 rounded-lg transition-colors"
              >
                Adicionar
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {formData.funcionalidades.map((func, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-700">{func}</span>
                  <button
                    type="button"
                    onClick={() => removerFuncionalidade(index)}
                    className="text-red-500 hover:text-red-700"
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Permissões e Limites */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Permissões e Limites
            </h3>

            {/* Limites Numéricos */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Limites</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profissionais
                  </label>
                  <input
                    type="number"
                    value={formData.maxProfissionais}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxProfissionais: parseInt(e.target.value) || 1,
                      }))
                    }
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5837B] focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clientes
                  </label>
                  <input
                    type="number"
                    value={formData.maxClientes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxClientes: parseInt(e.target.value) || 100,
                      }))
                    }
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5837B] focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agendamentos/mês
                  </label>
                  <input
                    type="number"
                    value={formData.maxAgendamentosMes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxAgendamentosMes: parseInt(e.target.value) || 50,
                      }))
                    }
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5837B] focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Toggles de Permissões */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Funcionalidades</h4>

              {[
                { key: "permiteMultiEmpresa", label: "Múltiplas Empresas" },
                { key: "permiteRelatorios", label: "Relatórios Avançados" },
                { key: "permiteIntegracoes", label: "Integrações" },
                { key: "permiteWhatsapp", label: "Notificações WhatsApp" },
                { key: "permiteSms", label: "Notificações SMS" },
                { key: "permiteAgendaOnline", label: "Agenda Online Pública" },
                {
                  key: "permitePersonalizacao",
                  label: "Personalização de Marca",
                },
                {
                  key: "recommended",
                  label: "Plano Recomendado",
                },
              ].map((permission) => (
                <label
                  key={permission.key}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-700">{permission.label}</span>
                  <input
                    type="checkbox"
                    checked={
                      formData[permission.key as keyof PlanoFormData] as boolean
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [permission.key]: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-[#C5837B] focus:ring-[#C5837B] rounded"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Voltar
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canGoNext()}
                className="bg-[#C5837B] hover:bg-[#B37469] text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próximo
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#C5837B] hover:bg-[#B37469] text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {loading ? <Spinner size="sm" color="white" /> : "Atualizar Plano"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
