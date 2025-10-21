'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import Spinner from './spinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface StyledButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const StyledButton = forwardRef<HTMLButtonElement, StyledButtonProps>((
  {
    children,
    className = '',
    isLoading = false,
    disabled = false,
    variant = 'primary',
    size = 'md',
    fullWidth = true,
    ...props
  },
  ref
) => {
  const buttonClasses = cn(
    'relative inline-flex items-center justify-center rounded-[6px] font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed',
    'overflow-hidden', // Garante que o loader não ultrapasse as bordas
    'min-h-[40px]', // Altura mínima para garantir espaço para o spinner
    {
      'w-full': fullWidth,
      'px-4 py-2 text-sm': size === 'sm',
      'px-6 py-3 text-base': size === 'md',
      'px-8 py-4 text-lg': size === 'lg',
      // Variantes de cor
      'bg-[#C5837B] text-white hover:bg-[#B0736B] focus:ring-[#C5837B]': variant === 'primary',
      'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400': variant === 'secondary',
      'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300': variant === 'outline',
      'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300': variant === 'ghost',
      'bg-transparent text-[#C5837B] hover:underline p-0 h-auto': variant === 'link',
      // Efeitos de hover e active
      'shadow-[3px_3px_0px_#e5e7eb] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]':
        variant !== 'ghost' && variant !== 'link',
    },
    className
  );

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      <span
        className={`font-medium transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'
          }`}
      >
        {children}
      </span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner
            variant="default"
            size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
            className={`${variant === 'primary' ? 'text-white' : 'text-[#C5837B]'
              }`}
          />
        </div>
      )}
    </button>
  );
});

StyledButton.displayName = 'StyledButton';

export { StyledButton };
