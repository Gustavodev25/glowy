"use client";

import Button from "@/components/visual/Button";

// Componente: Estatísticas da Plataforma
export function PlatformStats() {
  const stats = [
    { value: "2.500+", label: "Profissionais cadastrados" },
    { value: "15.000+", label: "Atendimentos realizados" },
    { value: "4.8★", label: "Avaliação média" },
    { value: "98%", label: "Clientes satisfeitos" },
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-[#C5837B] to-[#B0736B] text-white">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <p className="text-4xl font-bold mb-2">{stat.value}</p>
            <p className="text-sm opacity-90">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Componente: Depoimentos
export function Testimonials() {
  const testimonials = [
    {
      name: "Carla Mendes",
      avatar: "C",
      text: "Encontrei uma manicure incrível perto de casa! Super recomendo a plataforma.",
      rating: 5,
    },
    {
      name: "Pedro Oliveira",
      avatar: "P",
      text: "Agendei minha consulta com dentista em minutos. Muito prático!",
      rating: 5,
    },
    {
      name: "Julia Santos",
      avatar: "J",
      text: "Os profissionais são todos verificados. Me sinto muito mais segura.",
      rating: 5,
    },
  ];

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          O que nossos clientes dizem
        </h2>
        <p className="text-gray-600">Avaliações reais de quem já usou</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {testimonials.map((test, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#C5837B] text-white flex items-center justify-center font-bold">
                {test.avatar}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{test.name}</p>
                <div className="flex gap-1">
                  {[...Array(test.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm italic">&quot;{test.text}&quot;</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Componente: Serviços em Alta
export function TrendingServices() {
  const trending = [
    { icon: "💅", name: "Manicure", count: 234 },
    { icon: "💇", name: "Cabeleireiro", count: 189 },
    { icon: "🦷", name: "Dentista", count: 156 },
    { icon: "💪", name: "Personal", count: 142 },
    { icon: "🧘", name: "Massagem", count: 98 },
    { icon: "👨‍⚕️", name: "Fisioterapeuta", count: 87 },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Serviços em Alta</h2>
            <p className="text-sm text-gray-500">Mais buscados esta semana</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {trending.map((service, index) => (
            <Button
              key={index}
              variant="ghost"
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-[#C5837B] hover:shadow-md transition-all group h-auto"
            >
              <div className="text-3xl mb-2">{service.icon}</div>
              <p className="font-medium text-gray-900 text-sm">{service.name}</p>
              <p className="text-xs text-gray-500">{service.count} buscas</p>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}

// Componente: Ofertas Especiais
export function SpecialOffers() {
  const offers = [
    {
      professional: "Dra. Ana Paula",
      service: "Consulta Odontológica",
      originalPrice: 150,
      discountPrice: 99,
      discount: 34,
    },
    {
      professional: "Studio Beleza",
      service: "Corte + Escova",
      originalPrice: 120,
      discountPrice: 79,
      discount: 34,
    },
  ];

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ofertas Especiais</h2>
            <p className="text-sm text-gray-500">Aproveite descontos exclusivos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6 relative overflow-hidden"
            >
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{offer.discount}%
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{offer.professional}</h3>
              <p className="text-sm text-gray-600 mb-4">{offer.service}</p>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 line-through">
                  R$ {offer.originalPrice}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  R$ {offer.discountPrice}
                </span>
              </div>
              <Button
                variant="primary"
                fullWidth
                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
              >
                Aproveitar oferta
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Componente: Programa de Indicação
export function ReferralProgram() {
  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-3xl font-bold mb-3">Indique e Ganhe!</h2>
          <p className="text-lg mb-6 opacity-90">
            Ganhe R$ 20 de desconto para cada amigo que você indicar
          </p>
          <Button
            variant="outline"
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Começar a indicar
          </Button>
        </div>
      </div>
    </section>
  );
}

// Componente: Sortear Profissional
export function RandomProfessional() {
  return (
    <section className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg border-2 border-orange-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Não sabe por onde começar?
            </h3>
            <p className="text-sm text-gray-600">
              Deixe que escolhemos um profissional perfeito para você!
            </p>
          </div>
          <Button
            variant="primary"
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sortear profissional
          </Button>
        </div>
      </div>
    </section>
  );
}

// Componente: Novos Profissionais
export function NewProfessionals() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Novos Profissionais</h2>
            <p className="text-sm text-gray-500">Recém-chegados na plataforma</p>
          </div>
          <Button
            variant="ghost"
            className="text-sm text-[#C5837B] hover:text-[#B0736B] font-medium"
          >
            Ver todos →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">N</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">Novo Pro {i}</h3>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Novo
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Especialidade</p>
              <Button
                variant="outline"
                fullWidth
                className="w-full py-2 border border-[#C5837B] text-[#C5837B] rounded-lg text-sm font-medium hover:bg-[#C5837B] hover:text-white"
              >
                Conhecer
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
