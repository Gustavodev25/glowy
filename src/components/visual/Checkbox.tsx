'use client';

import React, { forwardRef } from 'react';

// Função utilitária para combinar classes do Tailwind CSS.
const cn = (...inputs: (string | undefined | null | false)[]) => {
  return inputs.filter(Boolean).join(' ');
};

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  containerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helpText,
      required = false,
      className,
      containerClassName,
      disabled,
      size = 'md',
      indeterminate = false,
      checked,
      onChange,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-4 h-4 rounded-md',
      md: 'w-6 h-6 rounded-lg', // Aumentado para 24px como no original
      lg: 'w-7 h-7 rounded-lg'
    };

    const checkboxClasses = cn(
      // Estilos base
      'appearance-none cursor-pointer flex-shrink-0',
      'border border-gray-300 rounded-[8px]', // Borda e arredondamento como no original
      'bg-white transition-all duration-100 ease-in-out',
      'shadow-[3px_3px_0px_#e5e7eb]',

      // Efeito de clique (ativo)
      'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',

      // Foco para acessibilidade
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C5837B]',

      // Tamanhos
      sizeClasses[size],

      // Estados
      'checked:bg-[#C5837B] checked:border-[#C5837B]',
      'checked:shadow-none', // Remove a sombra quando checado

      // Desabilitado
      'disabled:bg-gray-100 disabled:border-gray-200 disabled:cursor-not-allowed',
      'disabled:shadow-none disabled:active:translate-x-0 disabled:active:translate-y-0',
      'disabled:checked:bg-gray-400 disabled:checked:border-gray-400',

      // Erro
      error && 'border-red-500',
      error && 'focus:ring-red-500',

      className
    );

    const containerClasses = cn('flex items-start gap-3', containerClassName);

    const labelClasses = cn(
      'font-medium text-gray-700 cursor-pointer select-none',
      error && 'text-red-600',
      disabled && 'text-gray-500 cursor-not-allowed',
      size === 'sm' && 'text-sm',
      size === 'md' && 'text-base',
      size === 'lg' && 'text-lg'
    );

    const errorClasses = cn(
      'mt-1 text-xs text-red-600 transition-opacity duration-200',
      error ? 'opacity-100' : 'opacity-0 h-0'
    );

    const helpTextClasses = cn(
      'mt-1 text-xs text-gray-500',
      error && 'opacity-0 h-0'
    );

    // Ícone de check personalizado (do design original)
    const checkIcon = (
      <svg
        className={cn(
          'absolute inset-0 w-full h-full text-white pointer-events-none p-1', // Padding para ajustar o tamanho
          'transition-transform duration-150 ease-in-out',
          checked && !indeterminate ? 'scale-100' : 'scale-0'
        )}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );

    // Ícone de indeterminado
    const indeterminateIcon = (
      <svg
        className={cn(
          'absolute inset-0 w-full h-full text-white pointer-events-none p-1.5',
          'transition-opacity duration-200',
          indeterminate ? 'opacity-100' : 'opacity-0'
        )}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    );

    return (
      <div className="w-full">
        <div className={containerClasses}>
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <input
              ref={ref}
              type="checkbox"
              className={checkboxClasses}
              disabled={disabled}
              checked={checked}
              onChange={onChange}
              aria-invalid={!!error}
              aria-required={required}
              {...props}
            />
            {checkIcon}
            {indeterminateIcon}
          </div>

          {label && (
            <div className="flex-1 mt-0.5">
              <label htmlFor={props.id} className={labelClasses}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
          )}
        </div>

        {error && <p className={errorClasses}>{error}</p>}
        {helpText && !error && <p className={helpTextClasses}>{helpText}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
