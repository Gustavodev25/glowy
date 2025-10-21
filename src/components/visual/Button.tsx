'use client';

import React, { forwardRef } from 'react';

// --- Utilitário de Classe ---
/**
 * Concatena nomes de classes condicionalmente. Semelhante à biblioteca 'clsx'.
 * @param {...(string | object | null | undefined)[]} args - Argumentos a serem processados.
 * @returns {string} Uma string de nomes de classe.
 */
function cn(...args: (string | object | null | undefined)[]): string {
  let result = '';
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string' || typeof arg === 'number') {
      result += (result ? ' ' : '') + arg;
    } else if (typeof arg === 'object') {
      for (const key in arg) {
        if (Object.prototype.hasOwnProperty.call(arg, key) && (arg as any)[key]) {
          result += (result ? ' ' : '') + key;
        }
      }
    }
  }
  return result;
}

// --- Componente Loader ---
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
    primary: 'text-black',
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
Loader.displayName = 'Loader';

// --- Componente Button ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      isLoading = false,
      disabled = false,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const buttonClasses = cn(
      // Estilos base
      'relative inline-flex items-center justify-center font-medium transition-transform transition-shadow duration-100 ease-linear',
      'focus:outline-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'overflow-hidden', // Essencial para conter o efeito de brilho
      'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',

      // Estilos de tamanho
      {
        'px-3 py-2 text-sm': size === 'sm',
        'px-4 py-3 text-base': size === 'md',
        'px-6 py-4 text-lg': size === 'lg',
      },

      // Estilos de largura
      {
        'w-full': fullWidth,
      },

      className,
      
      // Estilos de variante (depois do className para sobrescrever com !important)
      {
        'bg-white !text-black font-semibold border border-gray-300 rounded-2xl shadow-[3px_3px_0px_#e5e7eb] hover:bg-gray-50 hover:!text-black': variant === 'primary',
        'bg-gray-200 !text-black hover:bg-gray-300 hover:!text-black rounded-lg': variant === 'secondary',
        'bg-transparent border border-gray-300 !text-black hover:bg-gray-50 hover:!text-black rounded-lg': variant === 'outline',
        'bg-transparent hover:bg-gray-100 !text-black hover:!text-black rounded-lg': variant === 'ghost',
        'bg-red-600 !text-white hover:bg-red-700 hover:!text-white rounded-lg': variant === 'danger',
      }
    );

    // ANIMAÇÃO: Classes para o conteúdo do botão (texto/ícones)
    // Quando isLoading=true, o conteúdo fica transparente, com blur e levemente reduzido.
    const contentClasses = cn(
      'flex items-center justify-center gap-2 transition-all duration-300 ease-in-out',
      isLoading
        ? 'opacity-0 blur-sm scale-95'
        : 'opacity-100 blur-0 scale-100'
    );

    // ANIMAÇÃO: Classes para o container do loader
    // O container fica por cima e sua opacidade é animada. `pointer-events-none` evita interação quando oculto.
    const loaderContainerClasses = cn(
      'absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out',
      isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
    );

    const loaderSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
    const loaderColor = variant === 'danger' ? 'white' : 'primary';

    // Garantir cor do texto via inline style
    const getTextColor = () => {
      if (className?.includes('text-white') || className?.includes('!text-white')) {
        return undefined; // Deixar o className controlar
      }
      if (variant === 'danger') return '#FFFFFF';
      return '#000000';
    };

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
        style={{ color: getTextColor(), ...(props.style || {}) }}
      >
        {/* Efeito de brilho animado apenas para a variante primária */}
        {variant === 'primary' && !disabled && (
          <>
            <span className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#C5837B] rounded-full blur-2xl opacity-40 animate-pulse" />
            <span className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-16 h-16 bg-[#C5837B] rounded-full blur-2xl opacity-40 animate-pulse" />
          </>
        )}

        {/* Conteúdo do botão com animação de blur */}
        <span className={contentClasses} style={{ color: 'inherit' }}>
          {children}
        </span>

        {/* Loader com animação de fade */}
        <div className={loaderContainerClasses}>
          <Loader size={loaderSize} color={loaderColor} />
        </div>
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, Loader };
export default Button;

