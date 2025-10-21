"use client";

import { useState, useEffect, useRef } from "react";
import { BlurFade } from "@/components/BlurFade";
import BookLoader from "@/components/BookLoader";
import Input from "@/components/visual/Input";
import Button from "@/components/visual/Button";

const categories = [
  "Dentistas",
  "Manicures",
  "Cabeleireiras",
  "Cabeleireiros",
  "Pediatras",
  "Podólogos",
  "Psicólogos",
  "Nutricionistas",
  "Personal Trainers",
  "Oftalmologistas",
  "Dermatologistas",
  "Esteticistas",
  "Barbeiros",
  "Massoterapeutas",
  "Depilação",
  "Maquiadores",
  "Design de Sobrancelhas",
  "Fisioterapeutas",
  "Mais",
];

interface Location {
  city: string;
  state: string;
}

export default function Hero() {
  const [searchText, setSearchText] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [showCepModal, setShowCepModal] = useState(false);
  const [cep, setCep] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [heroMessage, setHeroMessage] = useState("Ajude. Alcance.");

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    // Executar operações em paralelo sem bloquear UI
    requestLocation();
    generateGreeting();

    // Animar inputs e botões usando CSS transitions (muito mais performático)
    const timer = setTimeout(() => {
      if (searchContainerRef.current) {
        searchContainerRef.current.classList.add("animate-in");
      }
    }, 100);

    // Mostrar categorias rapidamente (reduzido de 800ms para 400ms)
    const categoriesTimer = setTimeout(() => {
      setShowCategories(true);
      setTimeout(() => {
        if (categoriesRef.current) {
          categoriesRef.current.classList.add("animate-in");
        }
      }, 50);
    }, 400);

    return () => {
      clearTimeout(timer);
      clearTimeout(categoriesTimer);
    };
  }, []);

  const generateGreeting = async () => {
    try {
      console.log("[Hero] Buscando dados do usuário...");

      // Buscar dados do usuário de forma não bloqueante
      fetch("/api/auth/me", {
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Não autenticado");
        })
        .then(({ user }) => {
          console.log("[Hero] Usuário encontrado:", user.nome);

          // Gerar saudação personalizada baseada no horário
          const now = new Date();
          const hour = now.getHours();
          const day = now.getDay();

          let greeting = "";
          if (hour >= 5 && hour < 12) {
            greeting = "Bom dia";
          } else if (hour >= 12 && hour < 18) {
            greeting = "Boa tarde";
          } else {
            greeting = "Boa noite";
          }

          let message = `${greeting}, ${user.nome}!`;

          // Adicionar contexto especial
          if (day === 5) {
            message += " Sextou!";
          } else if (day === 0) {
            message += " Domingo de descanso!";
          } else if (day === 6) {
            message += " Final de semana!";
          } else if (hour >= 0 && hour < 6) {
            message += " O que faz acordado?";
          }

          setHeroMessage(message);
        })
        .catch((error) => {
          console.log("[Hero] Usuário não autenticado");
        });
    } catch (error) {
      console.error("[Hero] Erro ao gerar saudação:", error);
    }
  };

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Buscar localização usando API de geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`,
            );
            const data = await response.json();

            if (data.address) {
              setLocation({
                city:
                  data.address.city ||
                  data.address.town ||
                  data.address.village ||
                  "Cidade não identificada",
                state: data.address.state || "",
              });
            } else {
              setShowCepModal(true);
            }
          } catch (error) {
            console.error("Erro ao buscar localização:", error);
            setShowCepModal(true);
          } finally {
            setLoadingLocation(false);
          }
        },
        () => {
          setLoadingLocation(false);
          setShowCepModal(true);
        },
      );
    } else {
      setShowCepModal(true);
    }
  };

  const handleCepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      alert("CEP inválido");
      return;
    }

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado");
        return;
      }

      setLocation({
        city: data.localidade,
        state: data.uf,
      });
      setShowCepModal(false);
      setCep("");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      alert("Erro ao buscar CEP");
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Título e descrição */}
        <BlurFade delay={0.1} inView>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 line-clamp-2">
            {heroMessage}
          </h1>
        </BlurFade>
        <BlurFade delay={0.2} inView>
          <p className="text-lg text-gray-600 mb-8">
            Procure o serviço que precisa ou ofereça sua ajuda para quem
            necessita.
          </p>
        </BlurFade>

        {/* Barra de pesquisa */}
        <div
          ref={searchContainerRef}
          className="mb-4 opacity-0 translate-y-4 transition-all duration-500 ease-out"
        >
          <div className="flex gap-3">
            <Input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Com o que você precisa de ajuda?"
              className="flex-1"
              containerClassName="flex-1"
            />
            <Button
              variant="primary"
              className="px-10 py-4 text-base font-medium bg-[#C5837B] text-white hover:bg-[#B0736B]"
            >
              Pesquisar
            </Button>
          </div>

          {/* Localização detectada */}
          {location && (
            <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                {location.city}, {location.state}
              </span>
            </div>
          )}

          {loadingLocation && (
            <div className="mt-2 text-sm text-gray-500">
              Detectando sua localização...
            </div>
          )}
        </div>

        {/* Categorias */}
        {!showCategories ? (
          <div className="mt-6">
            <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
              <BookLoader size={16} className="text-gray-500" />
              <span>Puxando serviços em tendência</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-32 bg-gray-200 rounded-full animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            ref={categoriesRef}
            className="mt-6 flex flex-wrap gap-2 opacity-0 translate-y-4 transition-all duration-500 ease-out"
          >
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-gray-700"
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de CEP */}
      {showCepModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Informe sua localização
            </h2>
            <p className="text-gray-600 mb-6">
              Não conseguimos detectar sua localização automaticamente. Por
              favor, informe seu CEP.
            </p>

            <form onSubmit={handleCepSubmit}>
              <Input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="Digite seu CEP"
                maxLength={9}
                className="mb-4"
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setShowCepModal(false)}
                  variant="secondary"
                  fullWidth
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium"
                >
                  Confirmar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  );
}
