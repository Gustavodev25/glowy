"use client";

import { useState, useEffect, useRef } from "react";
import Topbar from "@/app/components/Topbar";
import { Star, MapPin, Clock, Phone, Mail, Share2, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/visual/Button";
import CardIcon from "@/components/visual/CardIcon";
import NumberFlow from "@number-flow/react";

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

export default function LojaPage() {
  // Dados mockados - você pode substituir por dados reais do banco
  const vendedor = {
    nome: "Studio Beleza & Estilo",
    logo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop",
    biografia: "Especialistas em beleza e bem-estar com mais de 10 anos de experiência. Nossa missão é realçar a beleza natural de cada cliente com atendimento personalizado e produtos de alta qualidade.",
    avaliacao: 4.8,
    totalAvaliacoes: 234,
    endereco: "Rua das Flores, 123 - Centro",
    telefone: "(11) 98765-4321",
    email: "contato@studiobeleza.com",
    horario: "Seg-Sex: 9h-20h | Sáb: 9h-18h"
  };

  const servicos = [
    {
      id: 1,
      nome: "Corte Feminino",
      descricao: "Corte personalizado com acabamento profissional e finalização impecável",
      preco: 85.00,
      duracao: "1h",
      imagem: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      nome: "Coloração Completa",
      descricao: "Coloração profissional com produtos de alta qualidade e técnicas modernas",
      preco: 180.00,
      duracao: "2h30",
      imagem: "https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      nome: "Manicure & Pedicure",
      descricao: "Cuidados completos para unhas das mãos e pés com acabamento perfeito",
      preco: 65.00,
      duracao: "1h30",
      imagem: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      nome: "Escova Modelada",
      descricao: "Escova profissional com finalização impecável e duradoura",
      preco: 60.00,
      duracao: "45min",
      imagem: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      nome: "Tratamento Capilar",
      descricao: "Hidratação profunda e reconstrução capilar com produtos premium",
      preco: 120.00,
      duracao: "1h30",
      imagem: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      nome: "Make Profissional",
      descricao: "Maquiagem para eventos especiais com técnicas avançadas",
      preco: 150.00,
      duracao: "1h",
      imagem: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop"
    }
  ];

  const avaliacoes = [
    {
      id: 1,
      nome: "Maria Silva",
      avatar: "https://i.pravatar.cc/150?img=1",
      nota: 5,
      comentario: "Atendimento excepcional! Adorei o resultado do meu cabelo. Profissionais muito atenciosos e ambiente agradável.",
      data: "há 2 dias"
    },
    {
      id: 2,
      nome: "Ana Costa",
      avatar: "https://i.pravatar.cc/150?img=5",
      nota: 5,
      comentario: "Profissionais muito competentes. Sempre volto! O melhor salão da região.",
      data: "há 1 semana"
    },
    {
      id: 3,
      nome: "Julia Santos",
      avatar: "https://i.pravatar.cc/150?img=9",
      nota: 4,
      comentario: "Ótimo ambiente e serviço de qualidade. Super recomendo para quem busca excelência.",
      data: "há 2 semanas"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Topbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section - Card com borda dupla */}
        <div className="relative mb-8">
          {/* Borda de trás */}
          <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-3xl border border-gray-200 z-0 pointer-events-none"></div>

          {/* Card principal */}
          <div className="relative z-10 bg-white rounded-3xl border border-gray-200 overflow-hidden">
            {/* Banner sutil com gradiente */}
            <div className="relative h-32 bg-gradient-to-r from-[#C5837B]/10 via-[#C5837B]/5 to-transparent">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI0M1ODM3QiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-50" />

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
                  <CardIcon size="xl" className="w-32 h-32" circular={true}>
                    <img
                      src={vendedor.logo}
                      alt={vendedor.nome}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </CardIcon>
                </div>

                {/* Informações principais */}
                <div className="flex-1 pt-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    {vendedor.nome}
                  </h1>

                  {/* Avaliação */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={i < Math.floor(vendedor.avaliacao)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900 text-lg">{vendedor.avaliacao}</span>
                    <span className="text-gray-500">• {vendedor.totalAvaliacoes} avaliações</span>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed max-w-3xl">
                    {vendedor.biografia}
                  </p>

                  {/* Informações de contato em grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 text-sm">
                      <CardIcon size="md" icon="home" />
                      <div>
                        <p className="font-medium text-gray-900">Endereço</p>
                        <p className="text-gray-600">{vendedor.endereco}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <CardIcon size="md" icon="calendar" />
                      <div>
                        <p className="font-medium text-gray-900">Horário</p>
                        <p className="text-gray-600">{vendedor.horario}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <CardIcon size="md" icon="phone" />
                      <div>
                        <p className="font-medium text-gray-900">Telefone</p>
                        <p className="text-gray-600">{vendedor.telefone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <CardIcon size="md" icon="alert" />
                      <div>
                        <p className="font-medium text-gray-900">E-mail</p>
                        <p className="text-gray-600">{vendedor.email}</p>
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
                        <p className="text-xs text-gray-500 mb-1">A partir de</p>
                        <span className="text-2xl font-bold text-black font-mono tracking-tight inline-flex items-center">
                          <AnimatedPrice value={servico.preco} />
                        </span>
                      </div>
                      <Button variant="primary" size="sm" className="flex items-center gap-2">
                        <Calendar size={16} />
                        Agendar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Avaliações */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">O que dizem sobre nós</h2>
            <button className="text-sm text-[#C5837B] hover:text-[#B07369] font-medium">
              Ver todas →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {avaliacoes.map((avaliacao) => (
              <div key={avaliacao.id} className="relative">
                {/* Borda de trás */}
                <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

                {/* Card principal */}
                <div className="relative z-10 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 h-48 flex flex-col">
                  {/* Header com avatar e info */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={avaliacao.avatar}
                      alt={avaliacao.nome}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{avaliacao.nome}</h4>
                      <p className="text-xs text-gray-500">{avaliacao.data}</p>
                    </div>
                  </div>

                  {/* Estrelas logo abaixo do nome */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < avaliacao.nota
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"}
                      />
                    ))}
                  </div>

                  {/* Comentário sem aspas */}
                  <p className="text-gray-700 text-sm leading-relaxed flex-1">
                    {avaliacao.comentario}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}