"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Navigation, MapPin, AlertCircle } from "lucide-react";
import CardIcon from "@/components/visual/CardIcon";

interface MapCardProps {
  endereco: string;
  className?: string;
}

// Configurar o token do Mapbox (token público para desenvolvimento)
const MAPBOX_TOKEN = "pk.eyJ1IjoiZ3VzdGF2b2RldjI1IiwiYSI6ImNsbWIzbXdqMTB0MGszZG1uZThnY2txaDYifQ.7ZAHvdvW8Mm74TPGPGWeoA";

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
} else {
  console.warn("Mapbox token não definido");
}

export default function MapCard({ endereco, className = "" }: MapCardProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Função para geocodificar o endereço
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      console.log("📍 Geocodificando:", address);

      if (!MAPBOX_TOKEN) {
        throw new Error("Token do Mapbox não configurado");
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=BR&limit=1`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Token do Mapbox inválido ou expirado. Verifique sua configuração.");
        }
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 Resposta:", data);

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        console.log("✅ Coordenadas:", { lng, lat });
        return [lng, lat];
      }

      return null;
    } catch (error) {
      console.error("💥 Erro na geocodificação:", error);
      return null;
    }
  };

  // Função para abrir no Google Maps
  const openInGoogleMaps = () => {
    if (coordinates) {
      const [lng, lat] = coordinates;
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, "_blank");
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
      window.open(url, "_blank");
    }
  };

  // Função para obter direções
  const getDirections = () => {
    if (coordinates) {
      const [lng, lat] = coordinates;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`;
      window.open(url, "_blank");
    }
  };

  // useEffect para geocodificação
  useEffect(() => {
    console.log("🔄 Iniciando geocodificação...");

    const geocodeAndPrepare = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const coords = await geocodeAddress(endereco);

        if (!coords) {
          if (!MAPBOX_TOKEN) {
            setError("Token do Mapbox não configurado");
          } else {
            setError("Endereço não encontrado");
          }
          setIsLoading(false);
          return;
        }

        setCoordinates(coords);
        console.log("✅ Geocodificação concluída");

      } catch (error) {
        console.error("💥 Erro na geocodificação:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro ao processar endereço";
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    geocodeAndPrepare();
  }, [endereco]);

  // useEffect para criar o mapa quando coordenadas estiverem prontas
  useEffect(() => {
    // Verificar se temos o token
    if (!MAPBOX_TOKEN) {
      console.error("❌ Token do Mapbox não configurado");
      setError("Token do Mapbox não configurado");
      setIsLoading(false);
      return;
    }

    // Aguardar coordenadas
    if (!coordinates) {
      console.log("⏳ Aguardando coordenadas...");
      return;
    }

    // Aguardar container estar disponível
    if (!mapContainer.current) {
      console.log("⏳ Aguardando container do mapa...");
      return;
    }

    // Se o mapa já existe, remova-o antes de criar um novo
    if (map.current) {
      console.log("🗑️ Removendo mapa existente");
      map.current.remove();
      map.current = null;
    }

    console.log("🗺️ Criando mapa com coordenadas:", coordinates);

    try {
      // Criar o mapa
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: coordinates,
        zoom: 15,
        attributionControl: false,
      });

      map.current = mapInstance;
      console.log("✅ Instância do mapa criada");

      // Quando o mapa carregar
      mapInstance.on("load", () => {
        console.log("🎉 Mapa carregado com sucesso!");

        // Adicionar controles
        mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Adicionar marcador
        new mapboxgl.Marker({ color: "#C5837B" })
          .setLngLat(coordinates)
          .addTo(mapInstance);

        // Adicionar popup
        new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setLngLat(coordinates)
          .setHTML(`<div class="p-2"><h3 class="font-semibold text-gray-900">${endereco}</h3></div>`)
          .addTo(mapInstance);

        console.log("✅ Marcador e popup adicionados");
        setIsLoading(false);
        setMapReady(true);

        // Redimensionar o mapa para garantir que seja exibido corretamente
        mapInstance.resize();
      });

      // Lidar com erros
      mapInstance.on("error", (e) => {
        console.error("❌ Erro no mapa:", e);
        setError("Erro ao carregar mapa");
        setIsLoading(false);
        setMapReady(false);
      });

    } catch (error) {
      console.error("💥 Erro ao criar mapa:", error);
      setError("Erro ao criar mapa");
      setIsLoading(false);
      setMapReady(false);
    }

    // Cleanup
    return () => {
      if (map.current) {
        console.log("🧹 Limpando instância do mapa");
        map.current.remove();
        map.current = null;
      }
    };
  }, [coordinates, endereco]);

  // Restante do código (render) permanece igual
  return (
    <div className={`relative ${className}`}>
      {/* Borda de trás */}
      <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-3xl border border-gray-200 z-0 pointer-events-none"></div>

      {/* Card principal */}
      <div className="relative z-10 bg-white rounded-3xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardIcon size="md" icon="map" className="bg-[#C5837B]/10" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Localização</h3>
                <p className="text-sm text-gray-500">Encontre nossa empresa</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={openInGoogleMaps}
                className="px-3 py-1.5 text-xs font-medium text-[#C5837B] bg-[#C5837B]/10 rounded-lg hover:bg-[#C5837B]/20 transition-colors"
              >
                Ver no Maps
              </button>
              <button
                onClick={getDirections}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#C5837B] rounded-lg hover:bg-[#C5837B]/90 transition-colors flex items-center gap-1"
              >
                <Navigation size={12} />
                Direções
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {isLoading ? (
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#C5837B] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Carregando mapa...</p>
                <p className="text-xs text-gray-400 mt-1">Aguarde alguns segundos</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">Mapa não disponível</p>
                <p className="text-xs text-gray-400 mb-4">{error}</p>
                {error.includes("Token") && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      <strong>Dica:</strong> Verifique se o token do Mapbox está configurado corretamente no código.
                    </p>
                  </div>
                )}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={openInGoogleMaps}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#C5837B] rounded-lg hover:bg-[#C5837B]/90 transition-colors flex items-center gap-2"
                  >
                    <MapPin size={16} />
                    Ver no Google Maps
                  </button>
                  <button
                    onClick={getDirections}
                    className="px-4 py-2 text-sm font-medium text-[#C5837B] bg-[#C5837B]/10 rounded-lg hover:bg-[#C5837B]/20 transition-colors flex items-center gap-2"
                  >
                    <Navigation size={16} />
                    Direções
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-lg overflow-hidden border border-gray-200 relative">
              <div
                ref={mapContainer}
                className="w-full h-full"
                style={{ minHeight: '256px' }}
              />
              {!mapReady && coordinates && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#C5837B] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Preparando mapa...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Endereço */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Endereço:</span> {endereco}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}