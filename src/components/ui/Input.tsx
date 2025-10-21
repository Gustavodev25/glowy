'use client';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
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
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      required = false,
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
      ...props
    },
    ref
  ) => {
    const inputClasses = clsx(
      'input-base',
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
        {label && (
          <label className={labelClasses}>
            {label}
            {required && <span className="input-label-required">*</span>}
          </label>
        )}

        <div className={Icon ? 'input-with-icon' : ''}>
          {Icon && iconPosition === 'left' && (
            <Icon className="input-icon" size={16} />
          )}

          <input
            ref={ref}
            className={inputClasses}
            disabled={disabled || loading}
            {...props}
          />

          {Icon && iconPosition === 'right' && (
            <Icon className="input-icon right-3" size={16} />
          )}
        </div>

        {error && <span className="input-error-text">{error}</span>}
        {helpText && !error && <span className="input-help-text">{helpText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
