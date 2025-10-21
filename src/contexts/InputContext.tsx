'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface InputThemeConfig {
  variant: 'default' | 'outline' | 'filled' | 'flush';
  size: 'sm' | 'md' | 'lg';
  showHelpText: boolean;
  showIcons: boolean;
  animationDuration: number;
  focusRingColor: string;
  errorColor: string;
  successColor: string;
}

interface InputContextType {
  theme: InputThemeConfig;
  updateTheme: (updates: Partial<InputThemeConfig>) => void;
  resetTheme: () => void;
}

const defaultTheme: InputThemeConfig = {
  variant: 'default',
  size: 'md',
  showHelpText: true,
  showIcons: true,
  animationDuration: 300,
  focusRingColor: '#C5837B',
  errorColor: 'red',
  successColor: 'green',
};

const InputContext = createContext<InputContextType | undefined>(undefined);

interface InputProviderProps {
  children: ReactNode;
  initialTheme?: Partial<InputThemeConfig>;
}

export const InputProvider: React.FC<InputProviderProps> = ({
  children,
  initialTheme = {},
}) => {
  const [theme, setTheme] = useState<InputThemeConfig>({
    ...defaultTheme,
    ...initialTheme,
  });

  const updateTheme = (updates: Partial<InputThemeConfig>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  return (
    <InputContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </InputContext.Provider>
  );
};

export const useInputTheme = (): InputContextType => {
  const context = useContext(InputContext);
  if (!context) {
    throw new Error('useInputTheme deve ser usado dentro de um InputProvider');
  }
  return context;
};

export default InputContext;
