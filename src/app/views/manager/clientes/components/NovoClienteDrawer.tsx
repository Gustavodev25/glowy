"use client";

import { useState } from "react";
import Drawer from "@/components/visual/Drawer";
import Button from "@/components/visual/Button";
import Input from "@/components/visual/Input";
import { useToast } from "@/contexts/ToastContext";

interface NovoClienteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NovoClienteDrawer({
  isOpen,
  onClose,
  onSuccess,
}: NovoClienteDrawerProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.telefone) {
      toast.error("Campos Obrigatórios", "Nome e telefone são obrigatórios");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/clientes", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Sucesso!", "Cliente cadastrado com sucesso");
        setFormData({ nome: "", email: "", telefone: "", cpf: "" });
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error("Erro", error.error || "Erro ao cadastrar cliente");
      }
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast.error("Erro", "Não foi possível cadastrar o cliente");
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

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Cliente"
      width="lg"
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
            {saving ? "Salvando..." : "Salvar Cliente"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            <span className="text-red-500">*</span> Campos obrigatórios: Nome
            e Telefone
          </p>
        </div>
      </form>
    </Drawer>
  );
}
