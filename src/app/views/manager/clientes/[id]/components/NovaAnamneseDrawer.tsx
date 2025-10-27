"use client";

import { useState } from "react";
import Drawer from "@/components/visual/Drawer";
import Button from "@/components/visual/Button";
import Input from "@/components/visual/Input";
import TextArea from "@/components/visual/TextArea";
import Checkbox from "@/components/visual/Checkbox";
import { useToast } from "@/contexts/ToastContext";

interface NovaAnamneseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  onSuccess: () => void;
}

interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "radio";
  required?: boolean;
  options?: string[];
}

// Formulário padrão de anamnese estética
const CAMPOS_ANAMNESE: FormField[] = [
  {
    id: "motivoConsulta",
    label: "Motivo da consulta",
    type: "textarea",
    required: true,
  },
  {
    id: "historicoMedico",
    label: "Histórico médico (doenças, cirurgias)",
    type: "textarea",
    required: false,
  },
  {
    id: "medicamentos",
    label: "Medicamentos em uso",
    type: "text",
    required: false,
  },
  {
    id: "alergias",
    label: "Alergias conhecidas",
    type: "text",
    required: false,
  },
  {
    id: "gestante",
    label: "Está gestante ou amamentando?",
    type: "radio",
    required: true,
    options: ["Não", "Sim - Gestante", "Sim - Amamentando"],
  },
  {
    id: "tratamentosAnteriores",
    label: "Tratamentos estéticos anteriores",
    type: "textarea",
    required: false,
  },
  {
    id: "expectativas",
    label: "Expectativas com o tratamento",
    type: "textarea",
    required: true,
  },
  {
    id: "cuidadosPele",
    label: "Rotina atual de cuidados com a pele",
    type: "textarea",
    required: false,
  },
  {
    id: "exposicaoSolar",
    label: "Exposição solar frequente?",
    type: "radio",
    required: false,
    options: ["Raramente", "Às vezes", "Frequentemente"],
  },
];

export default function NovaAnamneseDrawer({
  isOpen,
  onClose,
  clienteId,
  onSuccess,
}: NovaAnamneseDrawerProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obrigatórios
    const camposObrigatorios = CAMPOS_ANAMNESE.filter((campo) => campo.required);
    const camposFaltantes = camposObrigatorios.filter(
      (campo) => !formData[campo.id] || formData[campo.id].trim() === ""
    );

    if (camposFaltantes.length > 0) {
      toast.error(
        "Campos obrigatórios",
        `Por favor, preencha: ${camposFaltantes.map((c) => c.label).join(", ")}`
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/anamnese", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId,
          respostas: formData,
          observacoes: observacoes || undefined,
        }),
      });

      if (response.ok) {
        toast.success("Sucesso!", "Anamnese registrada com sucesso");
        setFormData({});
        setObservacoes("");
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error("Erro", error.error || "Erro ao salvar anamnese");
      }
    } catch (error) {
      console.error("Erro ao salvar anamnese:", error);
      toast.error("Erro", "Não foi possível salvar a anamnese");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || "";

    switch (field.type) {
      case "text":
        return (
          <Input
            key={field.id}
            label={field.label}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      case "textarea":
        return (
          <TextArea
            key={field.id}
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            rows={3}
          />
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <Checkbox
                  key={option}
                  label={option}
                  checked={value === option}
                  onChange={() => handleFieldChange(field.id, option)}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => !saving && onClose()}
      title="Nova Anamnese"
      width="xl"
      position="right"
      dismissible={!saving}
      footer={
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
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
            onClick={handleSubmit}
          >
            {saving ? "Salvando..." : "Salvar Anamnese"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card informativo com borda dupla estilo visual */}
        <div className="relative">
          {/* Borda de trás */}
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-blue-50 border border-blue-200 rounded-lg" />

          {/* Card principal */}
          <div className="relative bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Preencha o formulário de anamnese com as informações do cliente. Campos
              marcados com <span className="text-red-500">*</span> são obrigatórios.
            </p>
          </div>
        </div>

        {CAMPOS_ANAMNESE.map(renderField)}

        {/* Observações Adicionais */}
        <div className="pt-4 border-t border-gray-200">
          <TextArea
            label="Observações Adicionais"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            placeholder="Adicione observações ou informações relevantes..."
          />
        </div>
      </form>
    </Drawer>
  );
}
