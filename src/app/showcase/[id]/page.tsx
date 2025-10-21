"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Topbar from "@/app/components/Topbar";
import { Star, MapPin, Clock, Phone, Mail, Share2, Heart, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/visual/Button";
import CardIcon from "@/components/visual/CardIcon";
// import NumberFlow from "@number-flow/react";
import Avaliacoes from "@/components/Avaliacoes";
import { SkeletonCard, SkeletonServico } from "@/components/ui/Skeleton";
import ScheduleDropdown from "@/components/ScheduleDropdown";
import OptimizedBanner from "@/components/OptimizedBanner";

// Componente para preço com NumberFlow animado
function AnimatedPrice({ value }: { value: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <span ref={ref} className="inline-block text-3xl font-bold text-black">
      R$ {value.toFixed(2)}
    </span>
  );
}

interface Empresa {
  id: string;
  nome: string;
  logo: string;
  banner?: string;
  biografia: string;
  avaliacao: number;
  totalAvaliacoes: number;
  endereco: string;
  telefone: string;
  email: string;
  horario: string;
  horariosDetalhados?: Array<{
    dia: number;
    aberto: boolean;
    abertura: string;
    fechamento: string;
    intervaloInicio?: string;
    intervaloFim?: string;
  }>;
}

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: string;
  imagem: string;
}

interface Avaliacao {
  id: number;
  nome: string;
  avatar: string;
  nota: number;
  comentario: string;
  data: string;
}

export default function ShowcasePage() {
  const params = useParams();
  const router = useRouter();
  const empresaId = params?.id as string;

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmpresa() {
      try {
        setLoading(true);
        const response = await fetch(`/api/empresas/${empresaId}`);
        const data = await response.json();

        console.log('[Showcase] Resposta da API:', data);
        console.log('[Showcase] Status da resposta:', response.status);

        if (data.success && data.empresa) {
          console.log('[Showcase] Empresa carregada:', data.empresa);
          setEmpresa(data.empresa);
          setServicos(data.servicos || []);
          setAvaliacoes(data.avaliacoes || []);
        } else {
          console.error('[Showcase] Erro na resposta:', data.error);
          setError(data.error || 'Erro ao carregar empresa');
        }
      } catch (err) {
        console.error('Erro ao buscar empresa:', err);
        setError('Erro ao carregar dados da empresa');
      } finally {
        setLoading(false);
      }
    }

    if (empresaId) {
      fetchEmpresa();
    }
  }, [empresaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Topbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Skeleton do perfil da empresa */}
            <SkeletonCard />

            {/* Skeleton dos serviços */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <SkeletonServico key={i} />
                ))}
              </div>
            </div>

            {/* Skeleton das avaliações */}
            <div className="mb-12">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !empresa) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Topbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <CardIcon size="xl" icon="alert" className="mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {error || 'Empresa não encontrada'}
            </h3>
            <p className="text-gray-600 mb-6">
              A empresa que você procura não está disponível no momento.
            </p>
            <Button variant="primary" onClick={() => router.push('/views/catalogo')}>
              <ArrowLeft size={18} className="mr-2" />
              Voltar ao Catálogo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Topbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Voltar
        </Button>

        {/* Header Section - Card com borda dupla */}
        <div className="relative mb-8">
          {/* Borda de trás */}
          <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-3xl border border-gray-200 z-0 pointer-events-none"></div>

          {/* Card principal */}
          <div className="relative z-10 bg-white rounded-3xl border border-gray-200 overflow-hidden">
            {/* Banner */}
            <div className="relative h-32 bg-gradient-to-r from-[#C5837B]/10 via-[#C5837B]/5 to-transparent">
              {empresa.banner ? (
                <OptimizedBanner
                  src={empresa.banner}
                  alt={`Banner de ${empresa.nome}`}
                />
              ) : (
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI0M1ODM3QiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-50" />
              )}

              {/* Botões de ação */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="ghost" size="sm" className="p-2.5">
                  <Share2 size={18} className="text-gray-600" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2.5">
                  <Heart size={18} className="text-gray-600" />
                </Button>
              </div>
            </div>

            {/* Profile Section */}
            <div className="px-8 pb-8 -mt-16 relative">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Logo com CardIcon */}
                <div className="relative">
                  <CardIcon size="xl" className="w-20 h-20" circular={true}>
                    <img
                      src={empresa.logo}
                      alt={empresa.nome}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </CardIcon>
                </div>

                {/* Informações principais */}
                <div className="flex-1 pt-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    {empresa.nome}
                  </h1>

                  {/* Avaliação */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={i < Math.floor(empresa.avaliacao)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900 text-lg">{empresa.avaliacao.toFixed(1)}</span>
                    <span className="text-gray-500">• {empresa.totalAvaliacoes} avaliações</span>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed max-w-3xl">
                    {empresa.biografia}
                  </p>

                  {/* Informações de contato em grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 text-sm">
                      <CardIcon size="md" icon="home" />
                      <div>
                        <p className="font-medium text-gray-900">Endereço</p>
                        <p className="text-gray-600">{empresa.endereco}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <CardIcon size="md" icon="calendar" />
                      <div>
                        <p className="font-medium text-gray-900">Horário</p>
                        <ScheduleDropdown
                          horariosDetalhados={empresa.horariosDetalhados || []}
                          horarioResumido={empresa.horario}
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <CardIcon size="md" icon="phone" />
                      <div>
                        <p className="font-medium text-gray-900">Telefone</p>
                        <p className="text-gray-600">{empresa.telefone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <CardIcon size="md" icon="alert" />
                      <div>
                        <p className="font-medium text-gray-900">E-mail</p>
                        <p className="text-gray-600">{empresa.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Serviços */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nossos Serviços</h2>
            <span className="text-sm text-gray-500">{servicos.length} serviços disponíveis</span>
          </div>

          {servicos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicos.map((servico) => (
                <div key={servico.id} className="relative">
                  {/* Borda de trás */}
                  <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

                  {/* Card principal */}
                  <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                    {/* Efeito de brilho nos cantos */}
                    <span className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-30 animate-pulse" />
                    <span className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-30 animate-pulse" />

                    {/* Imagem do serviço */}
                    <div className="relative h-52 overflow-hidden bg-gray-100 z-10">
                      <img
                        src={servico.imagem}
                        alt={servico.nome}
                        className="w-full h-full object-cover"
                      />

                      {/* Badge de duração */}
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 flex items-center gap-1.5 shadow-sm">
                        <Clock size={14} />
                        {servico.duracao}
                      </div>
                    </div>

                    {/* Conteúdo do card */}
                    <div className="p-5 flex-1 relative z-10">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {servico.nome}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {servico.descricao}
                      </p>
                    </div>

                    {/* Footer do card */}
                    <div className="border-t border-gray-200 p-5 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Preço</p>
                          <span className="text-2xl font-bold text-black font-mono tracking-tight inline-flex items-center">
                            <AnimatedPrice value={servico.preco} />
                          </span>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => router.push(`/showcase/${empresaId}/agendar/${servico.id}`)}
                        >
                          <Calendar size={16} />
                          Agendar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                    <CardIcon size="md" icon="briefcase" className="bg-[#C5837B]/10 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Nenhum serviço disponível
                      </h3>
                      <p className="text-sm text-gray-600">
                        Esta empresa ainda não cadastrou seus serviços
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="px-6 py-4">
                  <p className="text-gray-500 mb-4">
                    Os serviços desta empresa serão exibidos aqui assim que forem cadastrados.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={16} />
                    <span>Em breve</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Avaliações */}
        <div className="mb-12">
          <Avaliacoes
            empresaId={empresaId}
            isOwner={false} // Você pode implementar lógica para verificar se é dono
            userId={undefined} // Você pode implementar lógica para obter o userId do usuário logado
          />
        </div>
      </div>
    </div>
  );
}
