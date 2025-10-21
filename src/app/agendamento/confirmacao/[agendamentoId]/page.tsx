"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle, Calendar, Clock, MapPin, Phone, Mail,
  CreditCard, ArrowLeft, AlertCircle, XCircle
} from "lucide-react";
import { Button } from "@/components/visual/Button";
import BookLoader from "@/components/BookLoader";
import Topbar from "@/app/components/Topbar";

interface Agendamento {
  id: string;
  dataHora: string;
  duracao: number;
  valor: string;
  status: string;
  observacoes?: string;
  formaPagamento: string;
  cliente: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
  };
  servico: {
    id: string;
    nome: string;
    descricao: string;
    duracao: number;
    preco: string;
    imageUrl: string;
  };
  empresa: {
    id: string;
    nomeEmpresa: string;
    nomeFantasia?: string;
    logoUrl?: string;
    telefone: string;
    email: string;
    enderecoCompleto?: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    latitude?: number;
    longitude?: number;
  };
}

export default function ConfirmacaoAgendamentoPage() {
  const params = useParams();
  const router = useRouter();
  const agendamentoId = params?.agendamentoId as string;

  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgendamento();
  }, [agendamentoId]);

  const formatarEndereco = (empresa: Agendamento['empresa']) => {
    // Se enderecoCompleto for um JSON string, tentar parsear
    if (empresa.enderecoCompleto) {
      try {
        const parsed = JSON.parse(empresa.enderecoCompleto);
        return `${parsed.logradouro}, ${parsed.numero} - ${parsed.bairro}, ${parsed.localidade} - ${parsed.uf}`;
      } catch {
        // Se não for JSON, retornar como está
        return empresa.enderecoCompleto;
      }
    }
    // Fallback para construir o endereço dos campos individuais
    return `${empresa.logradouro}, ${empresa.numero} - ${empresa.bairro}, ${empresa.cidade} - ${empresa.estado}`;
  };

  const getGoogleMapsEmbedUrl = () => {
    if (!agendamento?.empresa) return '';
    const { logradouro, numero, bairro, cidade, estado } = agendamento.empresa;
    const address = `${logradouro}, ${numero}, ${bairro}, ${cidade}, ${estado}`;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}&zoom=15`;
  };

  const fetchAgendamento = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/agendamentos/${agendamentoId}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAgendamento(data.agendamento);
      } else {
        console.error("Erro ao buscar agendamento");
        router.push("/");
      }
    } catch (error) {
      console.error("Erro ao buscar agendamento:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      dayOfWeek: date.toLocaleDateString('pt-BR', { weekday: 'long' })
    };
  };

  const getFormaPagamentoLabel = (formaPagamento: string) => {
    const formas: Record<string, string> = {
      dinheiro: "Dinheiro",
      pix: "PIX",
      cartao_debito: "Cartão de Débito",
      cartao_credito: "Cartão de Crédito"
    };
    return formas[formaPagamento] || formaPagamento;
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; Icon: any; bgColor: string }> = {
      agendado: {
        label: "Aguardando Confirmação",
        color: "text-yellow-600",
        Icon: AlertCircle,
        bgColor: "bg-yellow-50"
      },
      confirmado: {
        label: "Confirmado",
        color: "text-green-600",
        Icon: CheckCircle,
        bgColor: "bg-green-50"
      },
      em_atendimento: {
        label: "Em Atendimento",
        color: "text-blue-600",
        Icon: Clock,
        bgColor: "bg-blue-50"
      },
      concluido: {
        label: "Concluído",
        color: "text-gray-600",
        Icon: CheckCircle,
        bgColor: "bg-gray-50"
      },
      cancelado: {
        label: "Cancelado",
        color: "text-red-600",
        Icon: XCircle,
        bgColor: "bg-red-50"
      }
    };
    return statusMap[status] || statusMap.agendado;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <BookLoader size={48} className="text-[#C5837B]" />
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Agendamento não encontrado
          </h2>
          <Button onClick={() => router.push("/")} variant="primary">
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const dateTime = formatDateTime(agendamento.dataHora);
  const statusInfo = getStatusInfo(agendamento.status);
  const nomeEmpresa = agendamento.empresa.nomeFantasia || agendamento.empresa.nomeEmpresa;
  const enderecoCompleto = formatarEndereco(agendamento.empresa);

  const StatusIcon = statusInfo.Icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Card */}
        <div className="relative">
          {/* Borda de trás */}
          <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

          {/* Card principal */}
          <div className="relative z-10 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header com confirmação */}
            <div className="relative px-6 py-8 bg-gradient-to-br from-green-50 to-emerald-50 border-b border-green-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Agendamento Confirmado!
                  </h1>
                  <p className="text-gray-600 text-sm mb-3">
                    Seu agendamento foi realizado com sucesso
                  </p>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                    <span className={`text-xs font-semibold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      • ID: {agendamento.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes do Agendamento */}
            <div className="p-6 space-y-6">
              {/* Informações Principais */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C5837B]" />
                  Detalhes do Agendamento
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Serviço</p>
                    <p className="font-semibold text-gray-900 text-sm">{agendamento.servico.nome}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Data e Hora</p>
                    <p className="font-semibold text-gray-900 text-sm">{dateTime.date} às {dateTime.time}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Duração</p>
                    <p className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {agendamento.duracao} minutos
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Valor</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatCurrency(agendamento.valor)}
                    </p>
                  </div>
                </div>

                {agendamento.observacoes && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium mb-1">Observações:</p>
                    <p className="text-sm text-gray-700">{agendamento.observacoes}</p>
                  </div>
                )}
              </div>

              {/* Local do Atendimento com Mapa */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C5837B]" />
                  Local do Atendimento
                </h2>

                <div className="space-y-3">
                  {/* Informações da Empresa */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      {agendamento.empresa.logoUrl && (
                        <img
                          src={agendamento.empresa.logoUrl}
                          alt={nomeEmpresa}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{nomeEmpresa}</h3>
                        <p className="text-sm text-gray-600 mt-1">{enderecoCompleto}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-200">
                      <a
                        href={`tel:${agendamento.empresa.telefone}`}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#C5837B] transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {agendamento.empresa.telefone}
                      </a>
                      <a
                        href={`mailto:${agendamento.empresa.email}`}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#C5837B] transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {agendamento.empresa.email}
                      </a>
                    </div>
                  </div>

                  {/* Mapa */}
                  <iframe
                    src={getGoogleMapsEmbedUrl()}
                    className="w-full h-64 rounded-lg border border-gray-200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>

            {/* Footer com ações */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <Button
                variant="secondary"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => router.push(`/showcase/${agendamento.empresa.id}`)}
              >
                <ArrowLeft size={18} />
                Voltar à Loja
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}