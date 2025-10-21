'use client';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { LucideIcon, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'outline' | 'filled' | 'flush';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  success?: boolean;
  className?: string;
  containerClassName?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helpText,
      icon: Icon,
      iconPosition = 'left',
      variant = 'default',
      size = 'md',
      loading = false,
      success = false,
      disabled,
      className,
      containerClassName,
      options,
      placeholder,
      ...props
    },
    ref
  ) => {
    const selectClasses = clsx(
      'input-base',
      'appearance-none cursor-pointer',
      {
        'input-error': error,
        'input-success': success && !error,
        'input-disabled': disabled,
        'input-loading': loading,
        'input-sm': size === 'sm',
        'input-lg': size === 'lg',
        'input-outline': variant === 'outline',
        'input-filled': variant === 'filled',
        'input-flush': variant === 'flush',
        'pl-10': Icon && iconPosition === 'left',
        'pr-10': Icon && iconPosition === 'right',
      },
      className
    );

    const containerClasses = clsx('input-container', containerClassName);

    const labelClasses = clsx('input-label', {
      'input-label-error': error,
    });

    return (
      <div className={containerClasses}>
        {label && <label className={labelClasses}>{label}</label>}
        
        <div className={Icon ? 'input-with-icon' : 'relative'}>
          {Icon && iconPosition === 'left' && (
            <Icon className="input-icon" size={16} />
          )}
          
          <select
            ref={ref}
            className={selectClasses}
            disabled={disabled || loading}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {Icon && iconPosition === 'right' && (
            <Icon className="input-icon right-3" size={16} />
          )}
          
          {/* Ícone de dropdown sempre visível */}
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        {error && <span className="input-error-text">{error}</span>}
        {helpText && !error && <span className="input-help-text">{helpText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
