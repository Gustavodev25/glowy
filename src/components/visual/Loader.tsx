'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  color = 'primary',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const colorClasses = {
    primary: 'text-[#C5837B]',
    white: 'text-white',
    gray: 'text-gray-500'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Carregando..."
    >
      <span className="sr-only">Carregando...</span>
    </div>
  );
};

export default Loader;
