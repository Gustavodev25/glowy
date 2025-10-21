'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  containerClassName?: string;
}

const StyledInput = forwardRef<HTMLInputElement, StyledInputProps>(
  (
    {
      label,
      required = false,
      error,
      helpText,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const inputClasses = cn(
      'w-full px-4 py-3 text-sm bg-white text-gray-600',
      'border border-gray-300 rounded-2xl outline-none',
      'shadow-[3px_3px_0px_#e5e7eb]',
      'transition-all duration-100 ease-in-out',
      'focus:shadow-none focus:translate-x-[3px] focus:translate-y-[3px]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      error ? 'border-red-300 focus:border-red-500' : 'focus:border-gray-400',
      className
    );

    const containerClasses = cn('w-full max-w-md', containerClassName);
    const labelClasses = cn(
      'block text-sm font-medium text-gray-700 mb-1',
      error && 'text-red-600'
    );
    const errorClasses = cn(
      'mt-1 text-xs text-red-600 transition-opacity duration-200',
      error ? 'opacity-100' : 'opacity-0 h-0'
    );
    const helpTextClasses = 'mt-1 text-xs text-gray-500';

    return (
      <div className={containerClasses}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          ref={ref}
          className={inputClasses}
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

StyledInput.displayName = 'StyledInput';

export { StyledInput };
