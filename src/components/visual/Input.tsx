'use client';

import React, { forwardRef } from 'react';

// Função utilitária para combinar classes do Tailwind CSS.
// Em um projeto real, isso viria de um pacote como 'clsx' e 'tailwind-merge'.
// Substituímos o import de '@/lib/utils' por esta implementação para que o código seja executável.
const cn = (...inputs: (string | undefined | null | false)[]) => {
  return inputs.filter(Boolean).join(' ');
};

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  containerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      required = false,
      className,
      containerClassName,
      disabled,
      size,
      ...props
    },
    ref
  ) => {
    const inputClasses = cn(
      // Estilos base inspirados no seu exemplo
      'w-full px-4 py-3 text-base bg-white text-gray-500',
      'border border-gray-300 rounded-[16px] outline-none',
      'shadow-[3px_3px_0px_#e5e7eb]',
      'transition-transform transition-shadow duration-100 ease-in-out',
      'box-border',

      // Estilos de foco inspirados no seu exemplo
      'focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none',

      // Estilos do placeholder (a cor do placeholder no exemplo é a mesma do texto)
      'placeholder:text-gray-500',

      // Estilos de desabilitado (adicionando resets para transform e shadow)
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0',

      // Estilos de erro (apenas borda vermelha, mantendo o efeito de foco)
      error && 'border-red-500',

      className
    );

    const containerClasses = cn('w-full', containerClassName);

    const labelClasses = cn(
      'block text-sm font-medium text-gray-700 mb-2',
      error && 'text-red-600',
      disabled && 'text-gray-500'
    );

    const errorClasses = cn(
      'mt-1 text-xs text-red-600 transition-opacity duration-200',
      error ? 'opacity-100' : 'opacity-0 h-0'
    );

    const helpTextClasses = cn(
      'mt-1 text-xs text-gray-500',
      error && 'opacity-0 h-0'
    );

    return (
      <div className={containerClasses}>
        {label && (
          <label className={labelClasses}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          className={inputClasses}
          disabled={disabled}
          aria-invalid={!!error}
          aria-required={required}
          {...props}
        />

        {error && <p className={errorClasses}>{error}</p>}
        {helpText && !error && <p className={helpTextClasses}>{helpText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

