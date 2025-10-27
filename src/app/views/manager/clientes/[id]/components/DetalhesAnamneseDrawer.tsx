"use client";

import Drawer from "@/components/visual/Drawer";
import Button from "@/components/visual/Button";
import { Calendar, User, FileText } from "lucide-react";

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

interface DetalhesAnamneseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  anamnese: RespostaFormulario | null;
}

export default function DetalhesAnamneseDrawer({
  isOpen,
  onClose,
  anamnese,
}: DetalhesAnamneseDrawerProps) {
  if (!anamnese) return null;

  const respostas = anamnese.respostas || {};

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Anamnese"
      width="xl"
      position="right"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} fullWidth>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Informações do Formulário com borda dupla */}
        <div className="relative">
          {/* Borda de trás */}
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-white border border-gray-300 rounded-lg" />

          {/* Card principal */}
          <div className="relative bg-white border border-gray-300 rounded-lg shadow-[3px_3px_0px_#e5e7eb] p-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-[#FEF2F2] rounded-lg">
                <FileText className="w-6 h-6 text-[#C5837B]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {anamnese.formulario.nome}
                </h3>
                {anamnese.formulario.descricao && (
                  <p className="text-sm text-gray-500 mb-2">
                    {anamnese.formulario.descricao}
                  </p>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(anamnese.createdAt).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agendamento Vinculado com borda dupla */}
        {anamnese.agendamento && (
          <div className="relative">
            {/* Borda de trás */}
            <div className="absolute inset-0 translate-x-2 translate-y-2 bg-blue-50 border border-blue-200 rounded-lg" />

            {/* Card principal */}
            <div className="relative bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Calendar className="w-4 h-4" />
                <span>
                  Vinculado ao atendimento de{" "}
                  {new Date(anamnese.agendamento.dataHora).toLocaleDateString(
                    "pt-BR"
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Respostas */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            Respostas
          </h4>

          {Object.keys(respostas).length === 0 ? (
            <div className="relative">
              {/* Borda de trás */}
              <div className="absolute inset-0 translate-x-2 translate-y-2 bg-gray-50 border border-gray-200 rounded-lg" />

              {/* Card principal */}
              <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-500">
                  Nenhuma resposta registrada
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(respostas).map(([key, value]) => (
                <div key={key} className="relative">
                  {/* Borda de trás */}
                  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-white border border-gray-200 rounded-lg" />

                  {/* Card principal */}
                  <div className="relative bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formatLabel(key)}
                    </label>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {String(value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Observações com borda dupla */}
        {anamnese.observacoes && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-3">
              Observações Adicionais
            </h4>
            <div className="relative">
              {/* Borda de trás */}
              <div className="absolute inset-0 translate-x-2 translate-y-2 bg-amber-50 border border-amber-200 rounded-lg" />

              {/* Card principal */}
              <div className="relative bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {anamnese.observacoes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

// Helper para formatar labels de campos camelCase
function formatLabel(key: string): string {
  // Mapeamento de campos conhecidos
  const labels: Record<string, string> = {
    motivoConsulta: "Motivo da consulta",
    historicoMedico: "Histórico médico",
    medicamentos: "Medicamentos em uso",
    alergias: "Alergias conhecidas",
    gestante: "Gestante/Amamentando",
    tratamentosAnteriores: "Tratamentos anteriores",
    expectativas: "Expectativas",
    cuidadosPele: "Cuidados com a pele",
    exposicaoSolar: "Exposição solar",
  };

  // Retorna o label mapeado ou formata o camelCase
  return (
    labels[key] ||
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  );
}
