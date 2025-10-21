"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import Stepper from "@/app/components/Stepper";
import Input from "@/components/visual/Input";
import Button from "@/components/visual/Button";
import TextArea from "@/components/visual/TextArea";
import Checkbox from "@/components/visual/Checkbox";
import CardIcon from "@/components/visual/CardIcon";

interface CriarPlanoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
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

export default function CriarPlanoModal({
  isOpen,
  onClose,
  onSuccess,
}: CriarPlanoModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);
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
    setLoading(true);

    try {
      const formDataToSend = new FormData();
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
      formDataToSend.append("recommended", formData.recommended.toString());

      const response = await fetch("/api/admin/planos", {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar plano");
      }

      const data = await response.json();
      console.log("Plano criado:", data);

      onSuccess("Plano criado com sucesso!");
      handleClose();
    } catch (error) {
      console.error("Erro ao criar plano:", error);
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

  const nextStep = async () => {
    setStepLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setStep((prev) => Math.min(prev + 1, 4));
    setStepLoading(false);
  };
  const prevStep = async () => {
    setStepLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setStep((prev) => Math.max(prev - 1, 1));
    setStepLoading(false);
  };

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
      title="Criar Novo Plano"
      maxWidth="2xl"
    >
      <div className="p-6">
        {/* Stepper */}
        <Stepper steps={steps} currentStep={step - 1} />

        {/* Step 1: Informações Básicas */}
        {step === 1 && (
          <div className="space-y-4">
            {stepLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações Básicas
            </h3>
            <Input
              label="Nome do Plano"
              type="text"
              value={formData.nome}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nome: e.target.value }))
              }
              placeholder="Ex: Plano Premium"
              required
            />
            <TextArea
              label="Descrição"
              value={formData.descricao}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  descricao: e.target.value,
                }))
              }
              rows={4}
              placeholder="Descreva os benefícios do plano..."
            />
              </>
            )}
          </div>
        )}

        {/* Step 2: Preço e Intervalo */}
        {step === 2 && (
          <div className="space-y-4">
            {stepLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preço e Periodicidade
            </h3>
            <Input
              label="Preço (R$)"
              type="text"
              value={formData.preco}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                const formatted = (parseInt(value || '0') / 100).toFixed(2);
                setFormData((prev) => ({ ...prev, preco: formatted }));
              }}
              placeholder="0,00"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periodicidade
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, intervalo: "MONTHLY" }))
                  }
                  variant={formData.intervalo === "MONTHLY" ? "primary" : "outline"}
                  className={formData.intervalo === "MONTHLY" ? "bg-[#C5837B]/10 !text-[#C5837B] border-[#C5837B]" : ""}
                >
                  Mensal
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, intervalo: "YEARLY" }))
                  }
                  variant={formData.intervalo === "YEARLY" ? "primary" : "outline"}
                  className={formData.intervalo === "YEARLY" ? "bg-[#C5837B]/10 !text-[#C5837B] border-[#C5837B]" : ""}
                >
                  Anual
                </Button>
              </div>
            </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Funcionalidades */}
        {step === 3 && (
          <div className="space-y-4">
            {stepLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Funcionalidades do Plano
            </h3>
            <div className="flex gap-2">
              <Input
                type="text"
                value={novaFuncionalidade}
                onChange={(e) => setNovaFuncionalidade(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && adicionarFuncionalidade()
                }
                containerClassName="flex-1"
                placeholder="Digite uma funcionalidade..."
              />
              <Button
                type="button"
                onClick={adicionarFuncionalidade}
                className="bg-[#C5837B] hover:bg-[#B37469] !text-white"
              >
                Adicionar
              </Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {formData.funcionalidades.map((func, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-700">{func}</span>
                  <Button
                    type="button"
                    onClick={() => removerFuncionalidade(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 p-1"
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
                  </Button>
                </div>
              ))}
            </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Permissões e Limites */}
        {step === 4 && (
          <div className="space-y-6">
            {stepLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Permissões e Limites
            </h3>

            {/* Limites Numéricos */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Limites</h4>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Profissionais"
                  type="number"
                  value={formData.maxProfissionais}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxProfissionais: parseInt(e.target.value) || 1,
                    }))
                  }
                  min="1"
                />
                <Input
                  label="Clientes"
                  type="number"
                  value={formData.maxClientes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxClientes: parseInt(e.target.value) || 100,
                    }))
                  }
                  min="1"
                />
                <Input
                  label="Agendamentos/mês"
                  type="number"
                  value={formData.maxAgendamentosMes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxAgendamentosMes: parseInt(e.target.value) || 50,
                    }))
                  }
                  min="1"
                />
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
                <div
                  key={permission.key}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Checkbox
                    label={permission.label}
                    checked={
                      formData[permission.key as keyof PlanoFormData] as boolean
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [permission.key]: e.target.checked,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
              </>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={prevStep}
            disabled={step === 1 || stepLoading}
            variant="ghost"
          >
            Voltar
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleClose}
              variant="ghost"
            >
              Cancelar
            </Button>
            {step < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canGoNext() || stepLoading}
                isLoading={stepLoading}
                className="bg-[#C5837B] hover:bg-[#B37469] !text-white"
              >
                Próximo
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                isLoading={loading}
                disabled={loading}
                className="bg-[#C5837B] hover:bg-[#B37469] !text-white"
              >
                Criar Plano
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
