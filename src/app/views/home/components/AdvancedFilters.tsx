"use client";

import { useState } from "react";
import { Select } from "@/components/ui";
import Button from "@/components/visual/Button";

export default function AdvancedFilters() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    priceRange: "all",
    rating: "all",
    distance: "10",
    sortBy: "relevance",
    availability: "all",
  });

  const sortByOptions = [
    { value: "relevance", label: "Mais relevantes" },
    { value: "rating", label: "Melhor avaliados" },
    { value: "price-low", label: "Menor preço" },
    { value: "price-high", label: "Maior preço" },
    { value: "distance", label: "Mais próximos" },
  ];

  const priceOptions = [
    { value: "all", label: "Todos os preços" },
    { value: "0-50", label: "Até R$ 50" },
    { value: "50-100", label: "R$ 50 - R$ 100" },
    { value: "100-200", label: "R$ 100 - R$ 200" },
    { value: "200+", label: "Acima de R$ 200" },
  ];

  const ratingOptions = [
    { value: "all", label: "Todas" },
    { value: "4.5", label: "≥ 4.5+" },
    { value: "4.0", label: "≥ 4.0+" },
    { value: "3.5", label: "≥ 3.5+" },
  ];

  const distanceOptions = [
    { value: "5", label: "Até 5 km" },
    { value: "10", label: "Até 10 km" },
    { value: "20", label: "Até 20 km" },
    { value: "50", label: "Até 50 km" },
  ];

  const availabilityOptions = [
    { value: "all", label: "Qualquer horário" },
    { value: "today", label: "Disponível hoje" },
    { value: "week", label: "Esta semana" },
    { value: "weekend", label: "Final de semana" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">Filtros</span>
        </Button>

        <div className="min-w-[200px]">
          <Select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: (e.target as HTMLSelectElement).value })}
            options={sortByOptions}
            placeholder="Ordenar por"
          />
        </div>

        <div className="flex-1"></div>

        <Button
          variant="ghost"
          className="text-sm text-[#C5837B] hover:text-[#B0736B] font-medium"
        >
          Limpar filtros
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div>
            <Select
              label="Faixa de preço"
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: (e.target as HTMLSelectElement).value })}
              options={priceOptions}
            />
          </div>

          <div>
            <Select
              label="Avaliação mínima"
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: (e.target as HTMLSelectElement).value })}
              options={ratingOptions}
            />
          </div>

          <div>
            <Select
              label="Distância (km)"
              value={filters.distance}
              onChange={(e) => setFilters({ ...filters, distance: (e.target as HTMLSelectElement).value })}
              options={distanceOptions}
            />
          </div>

          <div>
            <Select
              label="Disponibilidade"
              value={filters.availability}
              onChange={(e) => setFilters({ ...filters, availability: (e.target as HTMLSelectElement).value })}
              options={availabilityOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
}

