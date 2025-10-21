"use client";

import React, { useState, useEffect, useRef } from "react";
import Button from "@/components/visual/Button";
import Input from "@/components/visual/Input";
import TextArea from "@/components/visual/TextArea";
import Checkbox from "@/components/visual/Checkbox";
import Drawer from "@/components/visual/Drawer";
import Stepper from "@/app/components/Stepper";
import { useToast } from "@/contexts/ToastContext";
import { gsap } from "gsap";

interface Plan {
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

interface PlanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  plan?: Plan | null;
}

interface PlanFormData {
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

export default function PlanDrawer({
  isOpen,
  onClose,
  onSuccess,
  plan,
}: PlanDrawerProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [novaFuncionalidade, setNovaFuncionalidade] = useState("");
  const toast = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<PlanFormData>({
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

  // Carregar dados do plano quando abrir para edição
  useEffect(() => {
    if (isOpen && plan) {
      setFormData({
        nome: plan.name,
        descricao: plan.description,
        preco: plan.price.toString(),
        intervalo: plan.interval as "MONTHLY" | "YEARLY",
        funcionalidades: plan.features || [],
        maxProfissionais: plan.maxProfissionais,
        maxClientes: plan.maxClientes,
        maxAgendamentosMes: plan.maxAgendamentosMes,
        permiteMultiEmpresa: plan.permiteMultiEmpresa,
        permiteRelatorios: plan.permiteRelatorios,
        permiteIntegracoes: plan.permiteIntegracoes,
        permiteWhatsapp: plan.permiteWhatsapp,
        permiteSms: plan.permiteSms,
        permiteAgendaOnline: plan.permiteAgendaOnline,
        permitePersonalizacao: plan.permitePersonalizacao,
        recommended: plan.recommended,
      });
    } else if (isOpen) {
      // Reset form para novo plano
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
      setStep(1);
    }
  }, [isOpen, plan]);

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
      
      if (plan) {
        formDataToSend.append("id", plan.id);
      }
      
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
        method: plan ? "PUT" : "POST",
        body: formDataToSend,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar plano");
      }

      onSuccess(plan ? "Plano atualizado com sucesso!" : "Plano criado com sucesso!");
      handleClose();
    } catch (error: any) {
      console.error("Erro ao salvar plano:", error);
      toast.error("Erro ao salvar plano", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
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

  const drawerFooter = (
    <div className="flex justify-between">
      <Button
        type="button"
        variant="ghost"
        onClick={step > 1 ? prevStep : onClose}
        disabled={loading}
      >
        {step > 1 ? "Voltar" : "Cancelar"}
      </Button>
      <div className="flex gap-3">
        {step < 4 ? (
          <Button
            type="button"
            variant="primary"
            onClick={nextStep}
            disabled={!canGoNext()}
          >
            Próximo
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            isLoading={loading}
          >
            {plan ? "Atualizar Plano" : "Criar Plano"}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={plan ? "Editar Plano" : "Criar Novo Plano"}
      width="lg"
      position="right"
      footer={drawerFooter}
    >
      <div ref={contentRef}>
        {/* Stepper */}
        <div className="mb-6">
          <Stepper steps={steps} currentStep={step} />
        </div>

        {/* Step 1: Informações Básicas */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações Básicas
            </h3>
            <Input
              label="Nome do Plano *"
              type="text"
              value={formData.nome}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nome: e.target.value }))
              }
              placeholder="Ex: Plano Premium"
              required
            />
            <TextArea
              label="Descrição *"
              value={formData.descricao}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, descricao: e.target.value }))
              }
              placeholder="Descreva os benefícios deste plano"
              rows={4}
              required
            />
          </div>
        )}

        {/* Step 2: Preço e Periodicidade */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preço e Periodicidade
            </h3>
            <Input
              label="Preço (R$) *"
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, preco: e.target.value }))
              }
              placeholder="0.00"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalo de Cobrança *
              </label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, intervalo: "MONTHLY" }))
                  }
                  variant={formData.intervalo === "MONTHLY" ? "primary" : "ghost"}
                  className="flex-1"
                  fullWidth
                >
                  Mensal
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, intervalo: "YEARLY" }))
                  }
                  variant={formData.intervalo === "YEARLY" ? "primary" : "ghost"}
                  className="flex-1"
                  fullWidth
                >
                  Anual
                </Button>
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
                  <span className="text-sm text-gray-800">{func}</span>
                  <button
                    type="button"
                    onClick={() => removerFuncionalidade(index)}
                    className="text-red-600 hover:text-red-800 p-1"
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
                <Input
                  label="Profissionais"
                  type="number"
                  value={formData.maxProfissionais.toString()}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxProfissionais: parseInt(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Clientes"
                  type="number"
                  value={formData.maxClientes.toString()}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxClientes: parseInt(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Agend./Mês"
                  type="number"
                  value={formData.maxAgendamentosMes.toString()}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxAgendamentosMes: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            {/* Permissões */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Permissões</h4>
              <Checkbox
                label="Múltiplas Empresas"
                checked={formData.permiteMultiEmpresa}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    permiteMultiEmpresa: e.target.checked,
                  }))
                }
              />
              <Checkbox
                label="Relatórios Avançados"
                checked={formData.permiteRelatorios}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    permiteRelatorios: e.target.checked,
                  }))
                }
              />
              <Checkbox
                label="Integrações"
                checked={formData.permiteIntegracoes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    permiteIntegracoes: e.target.checked,
                  }))
                }
              />
              <Checkbox
                label="Notificações WhatsApp"
                checked={formData.permiteWhatsapp}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    permiteWhatsapp: e.target.checked,
                  }))
                }
              />
              <Checkbox
                label="Notificações SMS"
                checked={formData.permiteSms}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    permiteSms: e.target.checked,
                  }))
                }
              />
              <Checkbox
                label="Agenda Online"
                checked={formData.permiteAgendaOnline}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    permiteAgendaOnline: e.target.checked,
                  }))
                }
              />
              <Checkbox
                label="Personalização de Marca"
                checked={formData.permitePersonalizacao}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    permitePersonalizacao: e.target.checked,
                  }))
                }
              />
              <Checkbox
                label="Marcar como Recomendado"
                checked={formData.recommended}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    recommended: e.target.checked,
                  }))
                }
              />
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
