"use client";

import { useState } from "react";
import { ClipboardList, FileText, Calendar, Upload } from "lucide-react";
import Button from "@/components/visual/Button";
import CardIcon from "@/components/visual/CardIcon";
import UploadDocumentoDrawer from "./UploadDocumentoDrawer";

interface RespostaFormulario {
  id: string;
  respostas: any;
  observacoes?: string;
  createdAt: string;
  formulario: {
    id: string;
    nome: string;
    descricao?: string;
  };
  agendamento?: {
    id: string;
    dataHora: string;
  };
}

interface AnamneseTabProps {
  clienteId: string;
  respostas: RespostaFormulario[];
  onUpdate: () => void;
}

export default function AnamneseTab({
  clienteId,
  respostas,
  onUpdate,
}: AnamneseTabProps) {
  const [showUploadDrawer, setShowUploadDrawer] = useState(false);

  if (respostas.length === 0) {
    return (
      <div className="relative max-w-lg mx-auto">
        {/* Borda de trás estática */}
        <div className="absolute inset-0 translate-x-2 translate-y-2 bg-white border border-gray-300 rounded-lg" />

        {/* Card principal */}
        <div className="relative bg-white border border-gray-300 rounded-lg shadow-[3px_3px_0px_#e5e7eb] p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <CardIcon size="xl" icon="file-description" color="#C5837B" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Nenhuma anamnese registrada
          </h3>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">
            Este cliente ainda não possui formulários preenchidos
          </p>
          <Button variant="primary">Preencher Anamnese</Button>
        </div>
      </div>
    );
  }

  const respostasOrdenadas = [...respostas].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Histórico de Anamneses
        </h2>
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => setShowUploadDrawer(true)}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Enviar Documento
          </Button>
          <Button variant="primary">Nova Anamnese</Button>
        </div>
      </div>

      {respostasOrdenadas.map((resposta) => (
        <div
          key={resposta.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {resposta.formulario.nome}
              </h3>
              {resposta.formulario.descricao && (
                <p className="text-sm text-gray-600">
                  {resposta.formulario.descricao}
                </p>
              )}
            </div>

            <span className="text-sm text-gray-500">
              {new Date(resposta.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>

          {resposta.agendamento && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Calendar className="w-4 h-4" />
              <span>
                Vinculado ao atendimento de{" "}
                {new Date(resposta.agendamento.dataHora).toLocaleDateString(
                  "pt-BR",
                )}
              </span>
            </div>
          )}

          {resposta.observacoes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{resposta.observacoes}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
            <Button variant="ghost" size="sm">
              Ver Detalhes
            </Button>
          </div>
        </div>
      ))}

      {/* Drawer de Upload */}
      <UploadDocumentoDrawer
        isOpen={showUploadDrawer}
        onClose={() => setShowUploadDrawer(false)}
        clienteId={clienteId}
        onSuccess={onUpdate}
      />
    </div>
  );
}
