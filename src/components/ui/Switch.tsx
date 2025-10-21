'use client';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  variant?: 'default' | 'outline' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      error,
      helpText,
      variant = 'default',
      size = 'md',
      className,
      containerClassName,
      labelClassName,
      ...props
    },
    ref
  ) => {
    const switchClasses = clsx(
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5837B] focus:ring-offset-2',
      {
        'bg-[#C5837B]': props.checked,
        'bg-gray-200': !props.checked,
        'h-4 w-7': size === 'sm',
        'h-6 w-11': size === 'md',
        'h-8 w-14': size === 'lg',
        'bg-red-600': props.checked && error,
        'bg-red-200': !props.checked && error,
      },
      className
    );

    const thumbClasses = clsx(
      'inline-block transform rounded-full bg-white transition-transform',
      {
        'translate-x-6': props.checked,
        'translate-x-1': !props.checked,
        'h-3 w-3': size === 'sm',
        'h-4 w-4': size === 'md',
        'h-6 w-6': size === 'lg',
      }
    );

    const containerClasses = clsx('input-container', containerClassName);

    const labelClasses = clsx(
      'text-sm font-medium text-gray-700 cursor-pointer',
      {
        'text-red-600': error,
        'text-xs': size === 'sm',
        'text-base': size === 'lg',
      },
      labelClassName
    );

    return (
      <div className={containerClasses}>
        <div className="flex items-center">
          <button
            type="button"
            className={switchClasses}
            onClick={() => {
              if (props.onChange) {
                props.onChange({
                  target: { checked: !props.checked },
                } as React.ChangeEvent<HTMLInputElement>);
              }
            }}
            disabled={props.disabled}
          >
            <span className={thumbClasses} />
          </button>

          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            checked={props.checked}
            onChange={() => { }} // Handler vazio para evitar warning
            disabled={props.disabled}
            name={props.name}
            id={props.id}
            readOnly
          />

          {label && (
            <label className={clsx(labelClasses, 'ml-3')}>
              {label}
            </label>
          )}
        </div>

        {error && <span className="input-error-text">{error}</span>}
        {helpText && !error && <span className="input-help-text">{helpText}</span>}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
