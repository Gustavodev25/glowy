'use client';

import { useState, useCallback } from 'react';
import { useInputTheme } from '../contexts/InputContext';

export interface UseFormFieldOptions {
  initialValue?: any;
  validate?: (value: any) => string | undefined;
  required?: boolean;
}

export interface FormFieldState {
  value: any;
  error: string | undefined;
  touched: boolean;
  isValid: boolean;
}

export const useFormField = (options: UseFormFieldOptions = {}) => {
  const { initialValue, validate, required = false } = options;
  const { theme } = useInputTheme();

  const [state, setState] = useState<FormFieldState>({
    value: initialValue || '',
    error: undefined,
    touched: false,
    isValid: true,
  });

  const validateField = useCallback(
    (value: any): string | undefined => {
      if (required && (!value || value.toString().trim() === '')) {
        return 'Este campo é obrigatório';
      }

      if (validate) {
        return validate(value);
      }

      return undefined;
    },
    [required, validate]
  );

  const setValue = useCallback(
    (newValue: any) => {
      const error = validateField(newValue);
      setState((prev) => ({
        ...prev,
        value: newValue,
        error,
        isValid: !error,
        touched: true,
      }));
    },
    [validateField]
  );

  const setError = useCallback((error: string | undefined) => {
    setState((prev) => ({
      ...prev,
      error,
      isValid: !error,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: undefined,
      isValid: true,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      value: initialValue || '',
      error: undefined,
      touched: false,
      isValid: true,
    });
  }, [initialValue]);

  const touch = useCallback(() => {
    setState((prev) => ({ ...prev, touched: true }));
  }, []);

  return {
    ...state,
    setValue,
    setError,
    clearError,
    reset,
    touch,
    validateField,
    theme,
  };
};

export default useFormField;
