"use client";

import Button from "@/components/visual/Button";

import { useState } from "react";

interface Professional {
  id: string;
  name: string;
  profession: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  price: number;
  location: string;
  verified: boolean;
  topPro: boolean;
}

const mockProfessionals: Professional[] = [
  {
    id: "1",
    name: "Maria Silva",
    profession: "Manicure",
    avatar: "",
    rating: 4.9,
    reviewCount: 127,
    price: 50,
    location: "São Paulo, SP",
    verified: true,
    topPro: true,
  },
  {
    id: "2",
    name: "João Santos",
    profession: "Dentista",
    avatar: "",
    rating: 4.8,
    reviewCount: 95,
    price: 150,
    location: "São Paulo, SP",
    verified: true,
    topPro: false,
  },
  {
    id: "3",
    name: "Ana Costa",
    profession: "Cabeleireira",
    avatar: "",
    rating: 5.0,
    reviewCount: 203,
    price: 80,
    location: "São Paulo, SP",
    verified: true,
    topPro: true,
  },
  {
    id: "4",
    name: "Carlos Lima",
    profession: "Personal Trainer",
    avatar: "",
    rating: 4.7,
    reviewCount: 68,
    price: 120,
    location: "São Paulo, SP",
    verified: false,
    topPro: false,
  },
];

export default function FeaturedProfessionals() {
  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Profissionais em Destaque
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Os mais bem avaliados da sua região
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-sm text-[#C5837B] hover:text-[#B0736B] font-medium"
        >
          Ver todos →
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockProfessionals.map((pro) => (
          <div
            key={pro.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-[#C5837B] to-[#B0736B] flex items-center justify-center">
                <span className="text-white text-5xl font-bold">
                  {pro.name.charAt(0)}
                </span>
              </div>
              {pro.topPro && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded-full flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Top
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-1">
                    {pro.name}
                    {pro.verified && (
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">{pro.profession}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3">
                <svg
                  className="w-4 h-4 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">
                  {pro.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({pro.reviewCount})
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">A partir de</p>
                  <p className="text-lg font-bold text-gray-900">
                    R$ {pro.price}
                  </p>
                </div>
                <Button
                  variant="primary"
                  className="px-4 py-2 bg-[#C5837B] text-white text-sm font-medium rounded-lg hover:bg-[#B0736B]"
                >
                  Ver perfil
                </Button>
              </div>

              <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                <svg
                  className="w-3 h-3"
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
                </svg>
                {pro.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
