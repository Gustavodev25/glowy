'use client';

import { ReactNode } from 'react';
import { toaster } from '../app/components/Toaster';
import { ToastContext } from './ToastContext';

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const success = (title: string, message?: string, duration?: number) => {
    toaster.create({
      title,
      description: message,
      type: 'success',
      duration: duration || 5000,
    });
  };

  const error = (title: string, message?: string, duration?: number) => {
    toaster.create({
      title,
      description: message,
      type: 'error',
      duration: duration || 5000,
    });
  };

  const warning = (title: string, message?: string, duration?: number) => {
    toaster.create({
      title,
      description: message,
      type: 'warning',
      duration: duration || 5000,
    });
  };

  const info = (title: string, message?: string, duration?: number) => {
    toaster.create({
      title,
      description: message,
      type: 'info',
      duration: duration || 5000,
    });
  };

  const value = {
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}
