'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface StyledTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  maxLength?: number;
  className?: string;
  containerClassName?: string;
}

const StyledTextarea = forwardRef<HTMLTextAreaElement, StyledTextareaProps>(
  (
    {
      label,
      required = false,
      error,
      helpText,
      maxLength,
      className,
      containerClassName,
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(0);
    const [isLimitReached, setIsLimitReached] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const currentLength = e.target.value.length;
      setCharCount(currentLength);

      if (maxLength) {
        if (currentLength >= maxLength) {
          if (!isLimitReached) setIsLimitReached(true);
        } else {
          if (isLimitReached) setIsLimitReached(false);
        }
      }

      if (onChange) {
        onChange(e);
      }
    };

    const textareaClasses = cn(
      'w-full px-4 py-3 text-sm bg-white text-gray-600',
      'border border-gray-300 rounded-2xl outline-none',
      'shadow-[3px_3px_0px_#e5e7eb]',
      'transition-all duration-100 ease-in-out',
      'focus:shadow-none focus:translate-x-[3px] focus:translate-y-[3px]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'resize-y min-h-[120px] max-h-[400px]',
      'font-sans',
      error ? 'border-red-300 focus:border-red-500' : 'focus:border-gray-400',
      isLimitReached && 'animate-[border-flash_1.5s_ease-in-out_infinite] border-red-300',
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
    const footerClasses = cn(
      'flex justify-end items-center h-5 px-1 text-xs text-gray-500',
      isLimitReached ? 'text-red-500' : 'text-gray-500'
    );
    const errorMessageClasses = cn(
      'text-red-500 text-xs absolute left-2 transition-opacity duration-200',
      isLimitReached ? 'opacity-100' : 'opacity-0'
    );

    return (
      <div className={containerClasses}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="relative">
          <textarea
            ref={ref}
            className={textareaClasses}
            onChange={handleChange}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-required={required}
            {...props}
          />
          {maxLength && (
            <div className={footerClasses}>
              <span className={errorMessageClasses}>
                Tamanho máximo atingido
              </span>
              <span>
                {charCount}/{maxLength}
              </span>
            </div>
          )}
        </div>
        {error && <p className={errorClasses}>{error}</p>}
        {helpText && !error && <p className={helpTextClasses}>{helpText}</p>}
      </div>
    );
  }
);

StyledTextarea.displayName = 'StyledTextarea';

export { StyledTextarea };
