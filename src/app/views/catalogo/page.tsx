"use client";

import { useState, useEffect } from "react";
import Topbar from "@/app/components/Topbar";
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Clock,
  X,
  ChevronDown,
  TrendingUp,
  Sparkles,
  Award,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/visual/Button";
import Input from "@/components/visual/Input";
import Select from "@/components/visual/Select";
import CardIcon from "@/components/visual/CardIcon";
import Link from "next/link";
import { SkeletonCard } from "@/components/ui/Skeleton";

// Tipos
interface Categoria {
  id: string;
  nome: string;
  icone: string;
  quantidade: number;
  cor: string;
}

interface Vendedor {
  id: string;
  nome: string;
  logo: string;
  categoria: string;
  avaliacao: number;
  totalAvaliacoes: number;
  endereco: string;
  descricao: string;
  precoMinimo: number;
  destaque?: boolean;
  novo?: boolean;
  verificado?: boolean;
}

export default function CatalogoPage() {
  // Dados de categorias (mantém mockado por enquanto)
  const categorias: Categoria[] = [
    { id: "todas", nome: "Todas", icone: "grid", quantidade: 0, cor: "#C5837B" },
    { id: "beleza", nome: "Beleza & Estética", icone: "sparkles", quantidade: 0, cor: "#E91E63" },
    { id: "saude", nome: "Saúde & Bem-estar", icone: "heart", quantidade: 0, cor: "#4CAF50" },
    { id: "alimentacao", nome: "Alimentação", icone: "utensils", quantidade: 0, cor: "#FF9800" },
    { id: "moda", nome: "Moda & Acessórios", icone: "shopping-bag", quantidade: 0, cor: "#9C27B0" },
    { id: "servicos", nome: "Serviços Gerais", icone: "briefcase", quantidade: 0, cor: "#2196F3" },
  ];

  // Estado para empresas (vendedores) vindos da API
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("todas");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [ordenacao, setOrdenacao] = useState("relevancia");
  const [filtroPreco, setFiltroPreco] = useState<[number, number]>([0, 500]);
  const [filtroAvaliacao, setFiltroAvaliacao] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Buscar empresas da API
  useEffect(() => {
    async function fetchEmpresas() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (filtroPreco[0] > 0) params.append('minPreco', filtroPreco[0].toString());
        if (filtroPreco[1] < 500) params.append('maxPreco', filtroPreco[1].toString());

        console.log('[Catálogo] Buscando empresas com params:', params.toString());

        const response = await fetch(`/api/empresas?${params.toString()}`);
        const data = await response.json();

        console.log('[Catálogo] Resposta da API:', data);

        if (data.success) {
          console.log(`[Catálogo] ${data.empresas.length} empresas recebidas`);
          setVendedores(data.empresas);
        } else {
          console.error('[Catálogo] Erro ao buscar empresas:', data.error);
          setVendedores([]);
        }
      } catch (error) {
        console.error('[Catálogo] Erro ao buscar empresas:', error);
        setVendedores([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEmpresas();
  }, [searchTerm, filtroPreco]);

  // Auto-scroll do carousel de categorias
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % categorias.length);
    }, 3000); // Muda a cada 3 segundos

    return () => clearInterval(interval);
  }, [categorias.length]);

  // Filtrar vendedores
  const vendedoresFiltrados = vendedores.filter(vendedor => {
    const matchCategoria = categoriaAtiva === "todas" || vendedor.categoria === categoriaAtiva;
    const matchSearch = vendedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendedor.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPreco = vendedor.precoMinimo >= filtroPreco[0] && vendedor.precoMinimo <= filtroPreco[1];
    const matchAvaliacao = vendedor.avaliacao >= filtroAvaliacao;

    return matchCategoria && matchSearch && matchPreco && matchAvaliacao;
  });

  // Ordenar vendedores
  const vendedoresOrdenados = [...vendedoresFiltrados].sort((a, b) => {
    switch (ordenacao) {
      case "avaliacao":
        return b.avaliacao - a.avaliacao;
      case "preco-menor":
        return a.precoMinimo - b.precoMinimo;
      case "preco-maior":
        return b.precoMinimo - a.precoMinimo;
      default:
        return (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Topbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative mb-12">
          <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-3xl border border-gray-200 z-0 pointer-events-none"></div>

          <div className="relative z-10 bg-white rounded-3xl border border-gray-200 overflow-hidden">
            <div className="relative p-8 md:p-12">
              {/* Efeitos de fundo */}
              <span className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-64 h-64 bg-[#C5837B] rounded-full blur-3xl opacity-20" />
              <span className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-64 h-64 bg-[#C5837B] rounded-full blur-3xl opacity-20" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-[#C5837B]" size={24} />
                  <span className="text-sm font-semibold text-[#C5837B] uppercase tracking-wider">
                    Descubra os Melhores
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Catálogo Completo de Serviços
                </h1>

                <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                  Explore centenas de profissionais qualificados e encontre exatamente o que você precisa
                </p>

                {/* Barra de busca */}
                <div className="flex flex-col md:flex-row gap-3 max-w-3xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-20 pointer-events-none" size={20} />
                    <Input
                      type="text"
                      placeholder="Buscar por nome, serviço ou categoria..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4"
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setFiltrosAbertos(!filtrosAbertos)}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <SlidersHorizontal size={18} />
                    Filtros
                    {(filtroAvaliacao > 0 || filtroPreco[0] > 0 || filtroPreco[1] < 500) && (
                      <span className="ml-1 px-2 py-0.5 bg-[#C5837B] text-white text-xs rounded-full">
                        {[filtroAvaliacao > 0, filtroPreco[0] > 0 || filtroPreco[1] < 500].filter(Boolean).length}
                      </span>
                    )}
                  </Button>
                </div>

                {/* Estatísticas rápidas */}
                <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{loading ? '...' : `${vendedores.length}+`}</div>
                    <div className="text-sm text-gray-600">Empresas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">6</div>
                    <div className="text-sm text-gray-600">Categorias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{loading ? '...' : `${vendedores.reduce((acc, v) => acc + v.totalAvaliacoes, 0)}+`}</div>
                    <div className="text-sm text-gray-600">Avaliações</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Painel de Filtros Expandível - Design Melhorado */}
        {filtrosAbertos && (
          <div className="relative mb-8 animate-in fade-in slide-in-from-top-4 zoom-in-95 duration-300 z-50">
            <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-3xl border border-gray-200 z-0 pointer-events-none"></div>

            <div className="relative z-10 bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl">
              {/* Header com gradiente */}
              <div className="relative bg-gradient-to-r from-[#C5837B]/5 via-transparent to-[#C5837B]/5 px-8 py-6 border-b border-gray-200">
                <span className="absolute top-0 left-0 w-32 h-32 bg-[#C5837B] rounded-full blur-3xl opacity-10" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardIcon size="md" icon="briefcase" className="bg-[#C5837B]/10" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Filtros Avançados</h3>
                      <p className="text-sm text-gray-600">Refine sua busca</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFiltrosAbertos(false)}
                    className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Filtro de Preço Melhorado */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <CardIcon size="sm" icon="star" />
                        Faixa de Preço
                      </label>
                      <button
                        onClick={() => setFiltroPreco([0, 500])}
                        className="text-xs text-[#C5837B] hover:text-[#B07369] font-medium"
                      >
                        Resetar
                      </button>
                    </div>

                    {/* Slider customizado */}
                    <div className="relative pt-2 pb-6">
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={filtroPreco[1]}
                        onChange={(e) => setFiltroPreco([0, parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C5837B] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#C5837B] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
                        style={{
                          background: `linear-gradient(to right, #C5837B 0%, #C5837B ${(filtroPreco[1] / 500) * 100}%, #e5e7eb ${(filtroPreco[1] / 500) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>

                    {/* Cards de preço */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Mínimo</p>
                        <p className="text-2xl font-bold text-gray-900">R$ {filtroPreco[0]}</p>
                      </div>
                      <div className="bg-gradient-to-br from-[#C5837B]/10 to-white border border-[#C5837B]/30 rounded-xl p-4 text-center">
                        <p className="text-xs text-[#C5837B] mb-1">Máximo</p>
                        <p className="text-2xl font-bold text-[#C5837B]">R$ {filtroPreco[1]}</p>
                      </div>
                    </div>

                    {/* Faixas rápidas */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Até R$ 50", value: 50 },
                        { label: "Até R$ 100", value: 100 },
                        { label: "Até R$ 200", value: 200 },
                        { label: "Todos", value: 500 }
                      ].map((faixa) => (
                        <button
                          key={faixa.value}
                          onClick={() => setFiltroPreco([0, faixa.value])}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filtroPreco[1] === faixa.value
                            ? "bg-[#C5837B] text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                          {faixa.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtro de Avaliação Melhorado */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <CardIcon size="sm" icon="star" className="bg-amber-100" />
                        Avaliação Mínima
                      </label>
                      <button
                        onClick={() => setFiltroAvaliacao(0)}
                        className="text-xs text-[#C5837B] hover:text-[#B07369] font-medium"
                      >
                        Resetar
                      </button>
                    </div>

                    {/* Cards de avaliação */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { rating: 4.5, label: "Excelente", color: "amber" },
                        { rating: 4, label: "Muito Bom", color: "yellow" },
                        { rating: 3, label: "Bom", color: "lime" },
                        { rating: 0, label: "Todas", color: "gray" }
                      ].map((option) => (
                        <button
                          key={option.rating}
                          onClick={() => setFiltroAvaliacao(option.rating)}
                          className={`border-2 rounded-xl p-4 transition-all ${filtroAvaliacao === option.rating
                            ? "border-[#C5837B] bg-[#C5837B]/10 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-2">
                            {option.rating > 0 ? (
                              <>
                                <Star size={18} className="fill-amber-400 text-amber-400" />
                                <span className="text-xl font-bold text-gray-900">
                                  {option.rating}+
                                </span>
                              </>
                            ) : (
                              <span className="text-xl font-bold text-gray-900">
                                Todas
                              </span>
                            )}
                          </div>
                          <p className={`text-xs font-medium ${filtroAvaliacao === option.rating
                            ? "text-[#C5837B]"
                            : "text-gray-600"
                            }`}>
                            {option.label}
                          </p>
                        </button>
                      ))}
                    </div>

                    {/* Visualização de estrelas */}
                    <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Visualizar:</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < (filtroAvaliacao || 5)
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">
                        {filtroAvaliacao === 0
                          ? "Mostrando todos os vendedores"
                          : `Mostrando vendedores com ${filtroAvaliacao}+ estrelas`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões de ação melhorados */}
                <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFiltroPreco([0, 500]);
                      setFiltroAvaliacao(0);
                    }}
                    className="flex-1 h-12"
                  >
                    <X size={18} className="mr-2" />
                    Limpar Tudo
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setFiltrosAbertos(false)}
                    className="flex-1 h-12"
                  >
                    Aplicar Filtros
                    <ChevronRight size={18} className="ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categorias com Carousel */}
        <div className="mb-8 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Categorias</h3>
            <div className="flex gap-2">
              {categorias.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCarouselIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${index === carouselIndex
                    ? "w-8 bg-[#C5837B]"
                    : "w-1.5 bg-gray-300 hover:bg-gray-400"
                    }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Container do carousel */}
          <div className="relative group">
            {/* Setas de navegação nos cantos */}
            <button
              onClick={() => setCarouselIndex((prev) => (prev - 1 + categorias.length) % categorias.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
              aria-label="Categoria anterior"
            >
              <ChevronRight size={20} className="rotate-180 text-gray-700" />
            </button>
            <button
              onClick={() => setCarouselIndex((prev) => (prev + 1) % categorias.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
              aria-label="Próxima categoria"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>

            {/* Gradientes nas bordas */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white via-white/50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white/50 to-transparent z-10 pointer-events-none" />

            {/* Wrapper do carousel */}
            <div className="overflow-hidden">
              <div
                className="flex gap-4 transition-all duration-700 ease-out"
                style={{
                  transform: `translateX(-${carouselIndex * 25}%)`,
                }}
              >
                {/* Renderiza categorias em loop para efeito infinito */}
                {[...categorias, ...categorias, ...categorias].map((categoria, index) => {
                  const isActive = categoriaAtiva === categoria.id;
                  const isCurrent = index % categorias.length === carouselIndex;

                  return (
                    <button
                      key={`${categoria.id}-${index}`}
                      onClick={() => {
                        setCategoriaAtiva(categoria.id);
                        setCarouselIndex(index % categorias.length);
                      }}
                      className={`flex-shrink-0 transition-all duration-500 ${isCurrent ? "scale-100 opacity-100" : "scale-95 opacity-60 hover:opacity-80"
                        }`}
                      style={{ width: "calc(25% - 12px)" }}
                    >
                      {/* Card com borda dupla */}
                      <div className="relative">
                        {/* Borda de trás */}
                        <div className={`absolute inset-0.5 translate-x-1.5 translate-y-1.5 rounded-2xl border transition-all ${isActive ? "border-[#C5837B]/40" : "border-gray-200"
                          }`}></div>

                        {/* Card principal */}
                        <div className={`relative bg-white rounded-2xl border-2 p-4 transition-all ${isActive
                          ? "border-[#C5837B] shadow-md"
                          : "border-gray-200 hover:border-gray-300 shadow-sm"
                          }`}>
                          {/* Layout horizontal: ícone + textos */}
                          <div className="flex items-center gap-3">
                            {/* Ícone */}
                            <CardIcon
                              size="md"
                              icon={categoria.icone as any}
                              className={`flex-shrink-0 transition-all ${isActive
                                ? "bg-[#C5837B]/20 scale-110"
                                : "bg-gray-100"
                                }`}
                            />

                            {/* Textos */}
                            <div className="flex-1 min-w-0 text-left">
                              {/* Nome da categoria */}
                              <h4 className={`font-bold text-sm mb-1 transition-colors ${isActive ? "text-[#C5837B]" : "text-gray-900"
                                }`}>
                                {categoria.nome}
                              </h4>

                              {/* Quantidade */}
                              <p className="text-xs text-gray-600">
                                {categoria.quantidade} vendedores
                              </p>
                            </div>

                            {/* Seta no canto */}
                            <div className={`flex-shrink-0 transition-all ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                              }`}>
                              <ChevronRight size={16} className="text-[#C5837B]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Header da listagem */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {vendedoresOrdenados.length} {vendedoresOrdenados.length === 1 ? "vendedor encontrado" : "vendedores encontrados"}
            </h2>
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-1">
                Resultados para: <span className="font-medium">&quot;{searchTerm}&quot;</span>
              </p>
            )}
          </div>

          {/* Ordenação */}
          <div className="relative w-auto min-w-[200px]">
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-[16px] px-4 py-3 text-base text-gray-500 shadow-[3px_3px_0px_#e5e7eb] focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none transition-all duration-100 ease-in-out w-full pr-10 cursor-pointer"
            >
              <option value="relevancia">Mais Relevantes</option>
              <option value="avaliacao">Melhor Avaliados</option>
              <option value="preco-menor">Menor Preço</option>
              <option value="preco-maior">Maior Preço</option>
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Grid de Vendedores */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : vendedoresOrdenados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {vendedoresOrdenados.map((vendedor, index) => (
              <Link
                href={`/showcase/${vendedor.id}`}
                key={`${vendedor.id}-${index}`}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative group cursor-pointer">
                  {/* Borda de trás */}
                  <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

                  {/* Card principal */}
                  <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300">
                    {/* Header com logo e badges */}
                    <div className="relative p-6 pb-4 bg-gradient-to-br from-gray-50 to-white">
                      {/* Efeitos de fundo sutis */}
                      <span className="absolute top-0 right-0 w-32 h-32 bg-[#C5837B] rounded-full blur-3xl opacity-10" />

                      <div className="relative flex items-start gap-4">
                        {/* Logo com CardIcon */}
                        <CardIcon size="sm" circular={true} className="flex-shrink-0 w-12 h-12">
                          <img
                            src={vendedor.logo}
                            alt={vendedor.nome}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </CardIcon>

                        {/* Info e badges */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">
                              {vendedor.nome}
                            </h3>
                            {vendedor.verificado && (
                              <Award size={18} className="text-[#C5837B] flex-shrink-0" />
                            )}
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {vendedor.destaque && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                <TrendingUp size={12} />
                                Destaque
                              </span>
                            )}
                            {vendedor.novo && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                <Sparkles size={12} />
                                Novo
                              </span>
                            )}
                          </div>

                          {/* Avaliação */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star size={16} className="fill-amber-400 text-amber-400" />
                              <span className="font-bold text-gray-900">{vendedor.avaliacao}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              ({vendedor.totalAvaliacoes})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="px-6 py-4 space-y-3">
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {vendedor.descricao}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={16} className="flex-shrink-0" />
                        <span className="truncate">{vendedor.endereco}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">A partir de</p>
                          <span className="text-xl font-bold text-gray-900">
                            R$ {vendedor.precoMinimo.toFixed(2)}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#C5837B] font-medium p-0 h-auto"
                        >
                          Ver serviços
                          <ChevronRight size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Estado vazio
          <div className="text-center py-16">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0"></div>
              <CardIcon size="xl" icon="briefcase" className="relative z-10 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nenhum vendedor encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Tente ajustar seus filtros ou buscar por outros termos
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setCategoriaAtiva("todas");
                setFiltroPreco([0, 500]);
                setFiltroAvaliacao(0);
              }}
            >
              Limpar todos os filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}