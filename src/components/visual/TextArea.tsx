'use client';

import React, { forwardRef, useState } from 'react';

// Função utilitária para combinar classes do Tailwind CSS.
const cn = (...inputs: (string | undefined | null | false)[]) => {
  return inputs.filter(Boolean).join(' ');
};

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  containerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
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
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(String(props.defaultValue || props.value || '').length);
    const [isLimitReached, setIsLimitReached] = useState(
      props.maxLength ? String(props.defaultValue || props.value || '').length >= props.maxLength : false
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const currentLength = e.target.value.length;
      setCharCount(currentLength);

      if (props.maxLength) {
        setIsLimitReached(currentLength >= props.maxLength);
      }

      if (props.onChange) {
        props.onChange(e);
      }
    };

    const textareaClasses = cn(
      // Estilos base inspirados no Input visual
      'w-full px-4 py-3 text-base bg-white text-gray-500',
      'border border-gray-300 rounded-[16px] outline-none',
      'shadow-[3px_3px_0px_#e5e7eb]',
      'transition-transform transition-shadow duration-100 ease-in-out',
      'box-border resize-vertical',

      // Estilos de foco inspirados no Input visual
      'focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none',

      // Estilos do placeholder
      'placeholder:text-gray-500',

      // Estilos de desabilitado
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0',

      // Estilos de erro
      (error || isLimitReached) && 'border-red-500',

      // Estilos de tamanho
      size === 'sm' && 'px-3 py-2 text-sm',
      size === 'md' && 'px-4 py-3 text-base',
      size === 'lg' && 'px-5 py-4 text-lg',

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

        <textarea
          ref={ref}
          className={textareaClasses}
          disabled={disabled}
          aria-invalid={!!error || isLimitReached}
          aria-required={required}
          onChange={handleChange}
          {...props}
        />

        <div className="mt-1 flex min-h-[1rem] items-center justify-between text-xs">
          <div>
            {/* Exibe o erro externo primeiro */}
            {error && <p className="text-red-600">{error}</p>}
            {/* Exibe o erro de limite se não houver erro externo */}
            {isLimitReached && !error && <p className="text-red-600">Tamanho máximo atingido</p>}
            {/* Exibe o texto de ajuda se não houver erros */}
            {helpText && !error && !isLimitReached && <p className="text-gray-500">{helpText}</p>}
          </div>
          {props.maxLength && (
            <p className="text-gray-500">
              {charCount}/{props.maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;

