'use client';

import React, { ReactNode } from 'react';

// --- Utilitário de Classe ---
/**
 * Concatena nomes de classes condicionalmente. Semelhante à biblioteca 'clsx'.
 * @param {...(string | object | null | undefined)[]} args - Argumentos a serem processados.
 * @returns {string} Uma string de nomes de classe.
 */
function cn(...args: (string | object | null | undefined)[]): string {
  let result = '';
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string' || typeof arg === 'number') {
      result += (result ? ' ' : '') + arg;
    } else if (typeof arg === 'object') {
      for (const key in arg) {
        if (Object.prototype.hasOwnProperty.call(arg, key) && (arg as any)[key]) {
          result += (result ? ' ' : '') + key;
        }
      }
    }
  }
  return result;
}

// --- Componente de Abas Estilizado ---

export interface TabItem {
  id: string;
  name: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export default function StyledTabs({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  orientation = "horizontal", // Mudei o padrão para horizontal para melhor corresponder ao estilo
}: TabsProps) {
  const containerClasses = orientation === "vertical"
    ? "space-y-2"
    : "flex space-x-2";

  return (
    <div className={cn("relative", className)}>
      {/* Card de fundo com borda de sombra */}
      <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>

      {/* Card principal dos tabs */}
      <div className={cn("relative z-10 bg-white rounded-lg border border-gray-200 p-3", containerClasses)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                // Estilos base
                'relative inline-flex items-center justify-start font-medium transition-all duration-200 ease-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400',
                'overflow-hidden',

                // Estilos de orientação e tamanho
                orientation === "vertical" ? "w-full gap-3 px-4 py-3" : "gap-2 px-4 py-3 text-base",

                // Estilos de estado (desabilitado)
                tab.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",

                // Estilos de estado (ativo vs. inativo)
                {
                  // Estado Ativo: imita o botão 'primary'
                  'bg-white text-gray-800 font-semibold border border-gray-300 rounded-2xl shadow-[3px_3px_0px_#e5e7eb]': isActive,
                  // Estado Inativo: imita o botão 'ghost'
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-2xl': !isActive,
                }
              )}
            >
              {/* Efeito de brilho modificado para aparecer apenas à esquerda no estado ativo */}
              {isActive && (
                <span className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#C5837B] rounded-full blur-2xl opacity-40 animate-pulse" />
              )}

              {/* Conteúdo (ícone e texto) */}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon && (
                  <span className="flex-shrink-0">
                    {tab.icon}
                  </span>
                )}
                <span>{tab.name}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

