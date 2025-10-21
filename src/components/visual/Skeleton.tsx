"use client";

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export default function Skeleton({
  className = '',
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse'
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
    none: ''
  };

  return (
    <div
      className={`bg-gray-200 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1em' : '100%')
      }}
    />
  );
}

// Skeleton específico para Card de Template
export function SkeletonTemplateCard() {
  return (
    <div className="relative">
      {/* Borda de trás estática */}
      <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>

      {/* Card principal */}
      <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton variant="circular" width="48px" height="48px" />
          <div className="flex-1 space-y-2">
            <Skeleton height="20px" width="60%" />
            <Skeleton height="16px" width="40%" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton height="14px" />
          <Skeleton height="14px" />
          <Skeleton height="14px" />
          <Skeleton height="14px" />
        </div>
      </div>
    </div>
  );
}

// Skeleton específico para Service Card
export function SkeletonServiceCard() {
  return (
    <div className="relative">
      {/* Borda de trás estática */}
      <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>

      {/* Card principal */}
      <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="rectangular" width="48px" height="48px" />
          <div className="flex-1 space-y-2">
            <Skeleton height="18px" width="70%" />
            <Skeleton height="14px" width="90%" />
            <div className="flex items-center gap-4 mt-1">
              <Skeleton height="12px" width="60px" />
              <Skeleton height="12px" width="60px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton específico para Form
export function SkeletonForm() {
  return (
    <div className="space-y-4">
      {/* Image upload */}
      <div>
        <Skeleton height="16px" width="120px" className="mb-2" />
        <Skeleton variant="rectangular" width="96px" height="96px" className="rounded-2xl" />
      </div>

      {/* Nome */}
      <div>
        <Skeleton height="16px" width="120px" className="mb-2" />
        <Skeleton height="40px" className="rounded-lg" />
      </div>

      {/* Descrição */}
      <div>
        <Skeleton height="16px" width="80px" className="mb-2" />
        <Skeleton height="80px" className="rounded-lg" />
      </div>

      {/* Duração */}
      <div>
        <Skeleton height="16px" width="80px" className="mb-2" />
        <Skeleton height="40px" className="rounded-lg" />
      </div>

      {/* Preço */}
      <div>
        <Skeleton height="16px" width="80px" className="mb-2" />
        <Skeleton height="40px" className="rounded-lg" />
      </div>
    </div>
  );
}
