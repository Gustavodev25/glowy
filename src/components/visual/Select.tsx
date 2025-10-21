'use client';

import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Função utilitária para combinar classes do Tailwind CSS de forma condicional.
const cn = (...inputs: (string | undefined | null | false | { [key: string]: any })[]) => {
  return inputs
    .map(input => {
      if (typeof input === 'object' && input !== null) {
        return Object.entries(input)
          .filter(([_, value]) => value)
          .map(([key, _]) => key)
          .join(' ');
      }
      return input;
    })
    .filter(Boolean)
    .join(' ');
};

// --- Tipos e Interfaces ---
export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  containerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

// --- Componente Principal ---
const Select = forwardRef<HTMLDivElement, SelectProps>(
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
      options = [],
      placeholder = 'Selecione uma opção',
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const selectRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((option) => option.value === value);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    // Efeito para calcular a posição do dropdown e mantê-la atualizada
    useEffect(() => {
      if (isOpen && triggerRef.current) {
        const updatePosition = () => {
          if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Usa position fixed, então não precisa adicionar scrollY/scrollX
            setDropdownPosition({
              top: rect.bottom + 4, // Apenas 4px abaixo do elemento
              left: rect.left,
              width: rect.width,
            });
          }
        };

        updatePosition();

        // Atualiza a posição quando houver scroll ou resize para seguir o select
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
          window.removeEventListener('scroll', updatePosition, true);
          window.removeEventListener('resize', updatePosition);
        };
      }
    }, [isOpen]);

    // Efeito para fechar o dropdown ao clicar fora dele
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleOptionClick = (optionValue: string) => {
      if (onChange) {
        onChange(optionValue);
      }
      setIsOpen(false);
    };

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen((prev) => !prev);
        // Força o recálculo da posição ao abrir
        if (!isOpen && triggerRef.current) {
          setTimeout(() => {
            if (triggerRef.current) {
              const rect = triggerRef.current.getBoundingClientRect();
              setDropdownPosition({
                top: rect.bottom + 4, // Usa position fixed, não precisa de scrollY
                left: rect.left,
                width: rect.width,
              });
            }
          }, 0);
        }
      }
    };

    // --- Definição das Classes de Estilo com Tailwind CSS ---

    // Estilos para o cabeçalho (a parte clicável)
    const selectHeaderClasses = cn(
      // Estilos base
      'flex w-full items-center justify-between bg-white text-gray-500',
      'border border-gray-300 rounded-[16px] outline-none cursor-pointer',
      'transition-transform transition-shadow duration-100 ease-in-out',
      'box-border',

      // ✨ [VISUAL] Efeito de camada/sombra dura para o estado padrão
      !disabled && 'shadow-[3px_3px_0px_#e5e7eb]',

      // Estilos de tamanho
      size === 'sm' && 'px-3 py-2 text-sm',
      size === 'md' && 'px-4 py-3 text-base',
      size === 'lg' && 'px-5 py-4 text-lg',

      // ✨ [VISUAL] Efeito de "pressionado" quando o menu está aberto
      isOpen && 'translate-x-[3px] translate-y-[3px] shadow-none border-gray-400',

      // Estilos quando desabilitado
      disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',

      // Estilos de erro
      error && 'border-red-500',

      className
    );

    // Estilos para a lista de opções
    const optionsListClasses = cn(
      'fixed z-[99999]', // z-index muito alto para ficar sobre todos os elementos
      'bg-white border border-gray-300 rounded-[16px]',
      'p-2 max-h-56 overflow-y-auto scrollbar-hide',
      'transition-all duration-200 ease-out',

      // ✨ [VISUAL] Efeito de camada/sombra dura para a lista
      'shadow-[3px_3px_0px_#e5e7eb]',

      // Animação de aparição
      isOpen
        ? 'opacity-100 scale-100 pointer-events-auto'
        : 'opacity-0 scale-95 pointer-events-none'
    );

    const optionItemClasses =
      'px-3 py-2.5 text-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors';

    return (
      <div className={cn(containerClassName || 'w-full')} {...props} ref={ref}>
        {label && (
          <label className={cn('block text-sm font-medium text-gray-700 mb-2', { 'text-red-600': error })}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative" ref={selectRef}>
          {/* O elemento clicável que abre/fecha o menu */}
          <div
            ref={triggerRef}
            className={selectHeaderClasses}
            onClick={handleToggle}
            role="button"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className={cn({ 'text-gray-400': !selectedOption })}>{displayLabel}</span>
            <svg
              className={cn('transition-transform duration-200 ease-in-out', { 'rotate-180': isOpen })}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 10L12 15L17 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* A lista de opções é renderizada fora da div principal para evitar problemas de overflow */}
          {typeof window !== 'undefined' &&
            createPortal(
              <div
                ref={dropdownRef}
                className={optionsListClasses}
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  transformOrigin: 'top center',
                }}
              >
                {options.map((option) => (
                  <div
                    key={option.value}
                    className={optionItemClasses}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Evita que o evento de 'blur' feche o menu antes da seleção
                      handleOptionClick(option.value);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>,
              document.body
            )}
        </div>

        {/* Textos de ajuda e erro */}
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        {helpText && !error && <p className="mt-1.5 text-xs text-gray-500">{helpText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;