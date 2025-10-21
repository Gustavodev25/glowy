"use client";

import Modal from "@/components/Modal";
import { Spinner } from "@/components/Spinner";
import { AlertTriangle } from "lucide-react";

interface DeletarPlanoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  planoNome: string;
  loading?: boolean;
}

export default function DeletarPlanoModal({
  isOpen,
  onClose,
  onConfirm,
  planoNome,
  loading = false,
}: DeletarPlanoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="md">
      <div className="p-6">
        {/* Ícone de Alerta */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Excluir Plano
        </h2>

        {/* Mensagem */}
        <p className="text-gray-600 text-center mb-6">
          Tem certeza que deseja excluir o plano{" "}
          <span className="font-semibold text-gray-900">{planoNome}</span>?
        </p>

        {/* Aviso */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Atenção:</strong> Esta ação não pode ser desfeita. Todos os
            dados relacionados a este plano serão permanentemente removidos.
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" color="white" />
                <span>Excluindo...</span>
              </>
            ) : (
              "Excluir Plano"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
