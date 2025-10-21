"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "avatar" | "button" | "image";
  lines?: number;
}

export default function Skeleton({
  className,
  variant = "default",
  lines = 1
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";

  const variants = {
    default: "h-4 w-full",
    card: "h-32 w-full",
    text: "h-4 w-full",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-24 rounded-lg",
    image: "h-48 w-full rounded-lg",
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variants[variant],
              i === lines - 1 ? "w-3/4" : "w-full",
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        className
      )}
    />
  );
}

// Componentes específicos de skeleton
export function SkeletonCard() {
  return (
    <div className="relative group">
      {/* Borda de trás */}
      <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

      {/* Card principal */}
      <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header com gradiente */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-gray-50 to-white">
          {/* Efeitos de fundo sutis */}
          <span className="absolute top-0 right-0 w-32 h-32 bg-gray-200 rounded-full blur-3xl opacity-10 animate-pulse" />

          <div className="relative flex items-start gap-4">
            {/* Avatar/Logo skeleton */}
            <Skeleton variant="avatar" className="flex-shrink-0" />

            {/* Info skeleton */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-16" />
              </div>

              {/* Badges skeleton */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Rating skeleton */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-4 rounded-sm" />
                  ))}
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-4 space-y-3">
          <Skeleton variant="text" lines={2} />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton variant="button" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonAvaliacao() {
  return (
    <div className="relative group">
      {/* Borda de trás */}
      <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

      {/* Card principal */}
      <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header com avatar e info */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-gray-50 to-white">
          {/* Efeitos de fundo sutis */}
          <span className="absolute top-0 right-0 w-32 h-32 bg-gray-200 rounded-full blur-3xl opacity-10 animate-pulse" />

          <div className="relative flex items-start gap-4">
            {/* Avatar skeleton */}
            <Skeleton variant="avatar" className="flex-shrink-0" />

            {/* Info skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Serviço skeleton */}
              <div className="mb-3">
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>

              {/* Avaliação skeleton */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-4 rounded-sm" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-4 space-y-3">
          <Skeleton variant="text" lines={2} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonServico() {
  return (
    <div className="relative">
      {/* Borda de trás */}
      <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

      {/* Card principal */}
      <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
        {/* Imagem skeleton */}
        <Skeleton variant="image" className="rounded-none" />

        {/* Conteúdo */}
        <div className="p-6 space-y-4 flex-1">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton variant="text" lines={2} />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton variant="button" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonEstatisticas() {
  return (
    <div className="relative group">
      {/* Borda de trás */}
      <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

      {/* Card principal */}
      <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header com gradiente */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-gray-50 to-white">
          {/* Efeitos de fundo sutis */}
          <span className="absolute top-0 right-0 w-32 h-32 bg-gray-200 rounded-full blur-3xl opacity-10 animate-pulse" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton variant="button" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Média geral */}
            <div className="text-center space-y-3">
              <Skeleton className="h-8 w-16 mx-auto" />
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-4 rounded-sm" />
                ))}
              </div>
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>

            {/* Distribuição */}
            <div className="col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-4 w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

