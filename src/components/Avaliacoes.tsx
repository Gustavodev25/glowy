"use client";

import { useState, useEffect } from "react";
import { Star, MessageCircle, ThumbsUp, ThumbsDown, Send, X } from "lucide-react";
import { Button } from "@/components/visual/Button";
import Input from "@/components/visual/Input";
import TextArea from "@/components/visual/TextArea";
import CardIcon from "@/components/visual/CardIcon";
import { SkeletonEstatisticas, SkeletonAvaliacao } from "@/components/ui/Skeleton";

interface Avaliacao {
  id: string;
  nota: number;
  comentario?: string;
  dataAvaliacao: string;
  cliente: {
    id: string;
    nome: string;
    avatarUrl?: string;
  };
  servico?: {
    id: string;
    nome: string;
  };
  respostas?: RespostaAvaliacao[];
}

interface RespostaAvaliacao {
  id: string;
  resposta: string;
  dataResposta: string;
  empresa: {
    id: string;
    nomeEmpresa: string;
    nomeFantasia?: string;
  };
}

interface EstatisticasAvaliacao {
  totalAvaliacoes: number;
  media: number;
  distribuicao: Record<string, number>;
}

interface AvaliacoesProps {
  empresaId: string;
  servicoId?: string;
  isOwner?: boolean;
  userId?: string;
}

export default function Avaliacoes({ empresaId, servicoId, isOwner = false, userId }: AvaliacoesProps) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasAvaliacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [novaAvaliacao, setNovaAvaliacao] = useState({
    nota: 0,
    comentario: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [respostaForm, setRespostaForm] = useState<Record<string, string>>({});

  useEffect(() => {
    carregarAvaliacoes();
  }, [empresaId, servicoId]);

  const carregarAvaliacoes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        empresaId,
        includeRespostas: 'true',
        limit: '20',
      });

      if (servicoId) {
        params.append('servicoId', servicoId);
      }

      const response = await fetch(`/api/avaliacoes?${params}`);
      const data = await response.json();

      if (data.success) {
        setAvaliacoes(data.data.avaliacoes);
        setEstatisticas(data.data.estatisticas);
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert('Você precisa estar logado para avaliar');
      return;
    }

    if (novaAvaliacao.nota === 0) {
      alert('Selecione uma nota');
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          empresaId,
          servicoId,
          nota: novaAvaliacao.nota,
          comentario: novaAvaliacao.comentario || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNovaAvaliacao({ nota: 0, comentario: "" });
        setShowForm(false);
        carregarAvaliacoes();
        alert('Avaliação enviada com sucesso!');
      } else {
        alert(data.error || 'Erro ao enviar avaliação');
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitResposta = async (avaliacaoId: string) => {
    const resposta = respostaForm[avaliacaoId];

    if (!resposta || resposta.trim().length === 0) {
      alert('Digite uma resposta');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/avaliacoes/${avaliacaoId}/resposta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ resposta }),
      });

      const data = await response.json();

      if (data.success) {
        setRespostaForm(prev => ({ ...prev, [avaliacaoId]: "" }));
        carregarAvaliacoes();
        alert('Resposta enviada com sucesso!');
      } else {
        alert(data.error || 'Erro ao enviar resposta');
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      alert('Erro ao enviar resposta');
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderStars = (nota: number, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onStarClick?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              size={20}
              className={`${star <= nota
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
                }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonEstatisticas />
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonAvaliacao key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {estatisticas && (
        <div className="relative group">
          {/* Borda de trás */}
          <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

          {/* Card principal */}
          <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header com gradiente */}
            <div className="relative p-6 pb-4 bg-gradient-to-br from-gray-50 to-white">
              {/* Efeitos de fundo sutis */}
              <span className="absolute top-0 right-0 w-32 h-32 bg-[#C5837B] rounded-full blur-3xl opacity-10" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardIcon size="md" icon="star" className="bg-[#C5837B]/10" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Avaliações</h3>
                    <p className="text-sm text-gray-600">O que nossos clientes dizem</p>
                  </div>
                </div>
                {userId && !showForm && (
                  <Button
                    onClick={() => setShowForm(true)}
                    variant="primary"
                    size="sm"
                  >
                    Avaliar
                  </Button>
                )}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Média geral */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {estatisticas.media.toFixed(1)}
                  </div>
                  <div className="mb-2 flex justify-center">
                    {renderStars(Math.round(estatisticas.media))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {estatisticas.totalAvaliacoes} avaliação{estatisticas.totalAvaliacoes !== 1 ? 'ões' : ''}
                  </div>
                </div>

                {/* Distribuição */}
                <div className="col-span-2">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900 w-8">{star}</span>
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{
                              width: `${estatisticas.totalAvaliacoes > 0
                                ? (estatisticas.distribuicao[`${star}_estrelas`] || 0) / estatisticas.totalAvaliacoes * 100
                                : 0}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-900 w-8 text-right">
                          {estatisticas.distribuicao[`${star}_estrelas`] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de avaliação */}
      {showForm && (
        <div className="relative group">
          {/* Borda de trás */}
          <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

          {/* Card principal */}
          <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header com gradiente */}
            <div className="relative p-6 pb-4 bg-gradient-to-br from-gray-50 to-white">
              {/* Efeitos de fundo sutis */}
              <span className="absolute top-0 right-0 w-32 h-32 bg-[#C5837B] rounded-full blur-3xl opacity-10" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardIcon size="md" icon="star" className="bg-[#C5837B]/10" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Sua Avaliação</h4>
                    <p className="text-sm text-gray-600">Compartilhe sua experiência</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="px-6 py-6">
              <form onSubmit={handleSubmitAvaliacao} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nota
                  </label>
                  {renderStars(novaAvaliacao.nota, true, (star) =>
                    setNovaAvaliacao(prev => ({ ...prev, nota: star }))
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentário (opcional)
                  </label>
                  <TextArea
                    value={novaAvaliacao.comentario}
                    onChange={(e) => setNovaAvaliacao(prev => ({ ...prev, comentario: e.target.value }))}
                    placeholder="Conte-nos sobre sua experiência..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    isLoading={submitting}
                  >
                    Enviar Avaliação
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lista de avaliações */}
      <div className="space-y-6">
        {avaliacoes.length === 0 ? (
          <div className="relative group">
            {/* Borda de trás */}
            <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

            {/* Card principal */}
            <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Header com gradiente */}
              <div className="relative p-6 pb-4 bg-gradient-to-br from-gray-50 to-white">
                {/* Efeitos de fundo sutis */}
                <span className="absolute top-0 right-0 w-32 h-32 bg-[#C5837B] rounded-full blur-3xl opacity-10" />

                <div className="relative flex items-center gap-3">
                  <CardIcon size="md" icon="star" className="bg-[#C5837B]/10 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Nenhuma avaliação ainda
                    </h3>
                    <p className="text-sm text-gray-600">
                      Seja o primeiro a avaliar esta empresa!
                    </p>
                  </div>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="px-6 py-4">
                <p className="text-gray-500 mb-4">
                  As avaliações desta empresa serão exibidas aqui assim que os clientes começarem a avaliar.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Star size={16} />
                  <span>Seja o primeiro!</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          avaliacoes.map((avaliacao) => (
            <div key={avaliacao.id} className="relative group">
              {/* Borda de trás */}
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

              {/* Card principal */}
              <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300">
                {/* Header com avatar e info */}
                <div className="relative p-6 pb-4 bg-gradient-to-br from-gray-50 to-white">
                  {/* Efeitos de fundo sutis */}
                  <span className="absolute top-0 right-0 w-32 h-32 bg-[#C5837B] rounded-full blur-3xl opacity-10" />

                  <div className="relative flex items-start gap-4">
                    {/* Avatar com CardIcon */}
                    <CardIcon size="sm" circular={true} className="flex-shrink-0 w-12 h-12">
                      {avaliacao.cliente.avatarUrl ? (
                        <img
                          src={avaliacao.cliente.avatarUrl}
                          alt={avaliacao.cliente.nome}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-600">
                          {avaliacao.cliente.nome.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </CardIcon>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">
                          {avaliacao.cliente.nome}
                        </h3>
                        <div className="text-sm text-gray-500 flex-shrink-0">
                          {formatarData(avaliacao.dataAvaliacao)}
                        </div>
                      </div>

                      {/* Serviço */}
                      {avaliacao.servico && (
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            <MessageCircle size={12} />
                            {avaliacao.servico.nome}
                          </span>
                        </div>
                      )}

                      {/* Avaliação */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {renderStars(avaliacao.nota)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="px-6 py-4 space-y-3">
                  {avaliacao.comentario && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {avaliacao.comentario}
                    </p>
                  )}

                  {/* Respostas */}
                  {avaliacao.respostas && avaliacao.respostas.length > 0 && (
                    <div className="space-y-3">
                      {avaliacao.respostas.map((resposta) => (
                        <div key={resposta.id} className="bg-gradient-to-r from-[#C5837B]/5 to-transparent rounded-lg p-4 border border-[#C5837B]/10">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle size={16} className="text-[#C5837B]" />
                            <span className="font-medium text-gray-900">
                              {resposta.empresa.nomeFantasia || resposta.empresa.nomeEmpresa}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatarData(resposta.dataResposta)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{resposta.resposta}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer com formulário de resposta (apenas para donos) */}
                {isOwner && (!avaliacao.respostas || avaliacao.respostas.length === 0) && (
                  <div className="border-t border-gray-200 px-6 py-4">
                    <div className="flex gap-3">
                      <TextArea
                        value={respostaForm[avaliacao.id] || ""}
                        onChange={(e) => setRespostaForm(prev => ({
                          ...prev,
                          [avaliacao.id]: e.target.value
                        }))}
                        placeholder="Responder à avaliação..."
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleSubmitResposta(avaliacao.id)}
                        variant="primary"
                        size="sm"
                        className="self-end"
                      >
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
