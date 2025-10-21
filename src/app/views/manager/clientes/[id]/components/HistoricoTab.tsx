"use client";

import { Calendar, Clock, DollarSign, CheckCircle, XCircle } from "lucide-react";
import CardIcon from "@/components/visual/CardIcon";

interface Agendamento {
  id: string;
  dataHora: string;
  duracao: number;
  valor: string;
  status: string;
  observacoes?: string;
  formaPagamento?: string;
  servico: {
    id: string;
    nome: string;
    descricao?: string;
  };
}

interface HistoricoTabProps {
  clienteId: string;
  agendamentos: Agendamento[];
}

export default function HistoricoTab({
  clienteId,
  agendamentos,
}: HistoricoTabProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      agendado: "bg-blue-100 text-blue-800",
      confirmado: "bg-green-100 text-green-800",
      concluido: "bg-gray-100 text-gray-800",
      cancelado: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      agendado: "Agendado",
      confirmado: "Confirmado",
      concluido: "Concluído",
      cancelado: "Cancelado",
    };
    return labels[status] || status;
  };

  const agendamentosOrdenados = [...agendamentos].sort(
    (a, b) =>
      new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime(),
  );

  if (agendamentos.length === 0) {
    return (
      <div className="relative max-w-lg mx-auto">
        {/* Borda de trás estática */}
        <div className="absolute inset-0 translate-x-2 translate-y-2 bg-white border border-gray-300 rounded-lg" />
        
        {/* Card principal */}
        <div className="relative bg-white border border-gray-300 rounded-lg shadow-[3px_3px_0px_#e5e7eb] p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <CardIcon
              size="xl"
              icon="history"
              color="#C5837B"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Nenhum atendimento encontrado
          </h3>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">
            Este cliente ainda não possui histórico de atendimentos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {agendamentosOrdenados.map((agendamento) => {
        const dataHora = new Date(agendamento.dataHora);
        const isPassado = dataHora < new Date();

        return (
          <div
            key={agendamento.id}
            className="relative"
          >
            {/* Card com efeitos do Modal */}
            <div className="relative bg-white border border-gray-300 rounded-lg shadow-[3px_3px_0px_#e5e7eb] overflow-hidden transition-all duration-200 hover:shadow-[5px_5px_0px_#C5837B] hover:border-[#C5837B]">
              {/* Efeito de brilho igual ao Modal */}
              <span className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-20 animate-pulse" />
              <span className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-20 animate-pulse" />
              
              {/* Conteúdo do card */}
              <div className="relative z-10 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">
                      {agendamento.servico.nome}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {dataHora.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {dataHora.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          ({agendamento.duracao} min)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>
                          R${" "}
                          {parseFloat(agendamento.valor).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${
                          agendamento.status === "concluido"
                            ? "bg-green-100 text-green-800"
                            : agendamento.status === "cancelado"
                              ? "bg-red-100 text-red-800"
                              : isPassado
                                ? "bg-gray-100 text-gray-800"
                                : "bg-blue-100 text-blue-800"
                        }
                      `}
                    >
                      {agendamento.status === "concluido" && (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {agendamento.status === "cancelado" && (
                        <XCircle className="w-3 h-3" />
                      )}
                      {getStatusLabel(agendamento.status)}
                    </span>
                  </div>
                </div>

                {agendamento.observacoes && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-600">{agendamento.observacoes}</p>
                  </div>
                )}

                {agendamento.formaPagamento && (
                  <div className="mt-2 text-xs text-gray-500">
                    Pagamento: {agendamento.formaPagamento}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
