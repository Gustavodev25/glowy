"use client";

import { useState } from "react";
import { Edit2, Save, X } from "lucide-react";
import Button from "@/components/visual/Button";
import Input from "@/components/visual/Input";
import { useToast } from "@/contexts/ToastContext";

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  cpf?: string;
  avatarUrl?: string;
}

interface InfoTabProps {
  cliente: Cliente;
  onUpdate: () => void;
}

export default function InfoTab({ cliente, onUpdate }: InfoTabProps) {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: cliente.nome,
    email: cliente.email || "",
    telefone: cliente.telefone,
    cpf: cliente.cpf || "",
  });

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/clientes/${cliente.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Sucesso", "Informações atualizadas");
        setIsEditing(false);
        onUpdate();
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

  const handleCancel = () => {
    setFormData({
      nome: cliente.nome,
      email: cliente.email || "",
      telefone: cliente.telefone,
      cpf: cliente.cpf || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Informações Pessoais
          </h2>

          {!isEditing ? (
            <Button
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                isLoading={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Input
            label="Nome Completo"
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            disabled={!isEditing}
            required
          />

          <Input
            label="Telefone"
            type="tel"
            value={formData.telefone}
            onChange={(e) =>
              setFormData({ ...formData, telefone: e.target.value })
            }
            disabled={!isEditing}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!isEditing}
          />

          <Input
            label="CPF"
            type="text"
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            disabled={!isEditing}
            placeholder="000.000.000-00"
          />
        </div>
      </div>
    </div>
  );
}
