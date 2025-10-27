"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// --- Utilitário de Classe ---
/**
 * Concatena nomes de classe de forma condicional.
 * @param args Argumentos que podem ser strings, números ou objetos.
 * @returns Uma string única de nomes de classe.
 */
function cn(...args: (string | object | null | undefined)[]): string {
  let result = "";
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === "string" || typeof arg === "number") {
      result += (result ? " " : "") + arg;
    } else if (typeof arg === "object") {
      for (const key in arg) {
        if (
          Object.prototype.hasOwnProperty.call(arg, key) &&
          (arg as any)[key]
        ) {
          result += (result ? " " : "") + key;
        }
      }
    }
  }
  return result;
}

// --- Definição do Componente Tooltip ---

export interface TooltipProps {
  /** O elemento que aciona o tooltip (o filho) */
  children: React.ReactNode;
  /** O texto ou JSX a ser exibido dentro do tooltip */
  content: string | React.ReactNode;
  /** Posição do tooltip em relação ao acionador */
  position?: "top" | "bottom" | "left" | "right";
  /** Atraso em milissegundos antes de mostrar o tooltip */
  delay?: number;
  /** Classes CSS adicionais para o contíner do tooltip */
  className?: string;
}

/**
 * Um componente Tooltip que aparece ao passar o mouse sobre um elemento filho,
 * usando um Portal para renderizar no corpo do documento.
 */
export default function Tooltip({
  children,
  content,
  position = "top",
  delay = 300,
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  // NOVO ESTADO: Controla se o tooltip está no DOM para animar a saída
  const [isRendered, setIsRendered] = useState(false);

  const [tooltipPosition, setTooltipPosition] = useState({ top: -9999, left: -9999 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Refs para os timeouts de "mostrar" e "esconder"
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Agenda a exibição do tooltip após o atraso especificado.
   */
  const showTooltip = () => {
    // Limpa qualquer timeout de "esconder" (unmount) pendente
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    // Limpa timeout de "mostrar" anterior
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }

    // 1. Monta o componente no DOM (invisível)
    setIsRendered(true);

    // 2. Agenda a animação de "entrada"
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  /**
   * Inicia a animação de "saída" e agenda o "unmount" do tooltip.
   */
  const hideTooltip = () => {
    // Limpa qualquer timeout de "mostrar" pendente
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }

    // 1. Inicia a animação de "saída" (fade/blur/scale out)
    setIsVisible(false);

    // 2. Agenda o "unmount" do DOM para depois da animação (300ms)
    hideTimeoutRef.current = setTimeout(() => {
      setIsRendered(false);
    }, 300); // Duração da animação (deve corresponder ao duration-300)
  };

  /**
   * Calcula e atualiza a posição do tooltip na tela,
   * ajustando para evitar que saia da viewport.
   */
  const updatePosition = useCallback(() => {
    if (typeof window === 'undefined' || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = triggerRect.top - tooltipRect.height - padding;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + padding;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - padding;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + padding;
        break;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }

    if (top < padding) {
      top = padding;
    } else if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding;
    }

    setTooltipPosition({ top: top, left: left });
  }, [position]);

  useEffect(() => {
    // Recalcula a posição SOMENTE se estiver visível e renderizado
    if (isRendered && isVisible && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        updatePosition();
      }, 0);

      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isRendered, isVisible, updatePosition]); // Adicionado isRendered

  // Limpa os timeouts se o componente for desmontado
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Retorna as classes CSS para a seta externa (borda) do tooltip.
   */
  const getArrowClasses = () => {
    const baseClasses = "absolute w-0 h-0";
    switch (position) {
      case "top":
        return cn(
          baseClasses,
          "top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-300",
        );
      case "bottom":
        return cn(
          baseClasses,
          "bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-300",
        );
      case "left":
        return cn(
          baseClasses,
          "left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-300",
        );
      case "right":
        return cn(
          baseClasses,
          "right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-300",
        );
      default:
        return baseClasses;
    }
  };

  /**
   * Retorna as classes CSS para a seta interna (fundo) do tooltip.
   */
  const getArrowInnerClasses = () => {
    const baseClasses = "absolute w-0 h-0";
    switch (position) {
      case "top":
        return cn(
          baseClasses,
          "top-full left-1/2 transform -translate-x-1/2 translate-y-[-1px] border-l-4 border-r-4 border-t-4 border-transparent border-t-white",
        );
      case "bottom":
        return cn(
          baseClasses,
          "bottom-full left-1/2 transform -translate-x-1/2 translate-y-[1px] border-l-4 border-r-4 border-b-4 border-transparent border-b-white",
        );
      case "left":
        return cn(
          baseClasses,
          "left-full top-1/2 transform -translate-y-1/2 translate-x-[-1px] border-t-4 border-b-4 border-l-4 border-transparent border-l-white",
        );
      case "right":
        return cn(
          baseClasses,
          "right-full top-1/2 transform -translate-y-1/2 translate-x-[1px] border-t-4 border-b-4 border-r-4 border-transparent border-r-white",
        );
      default:
        return baseClasses;
    }
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ATUALIZADO: Condição de renderização agora usa `isRendered`
  const tooltipContent = isMounted && isRendered && typeof window !== 'undefined' ? (
    <div
      ref={tooltipRef}
      className={cn(
        "fixed z-[9999] px-3 py-2 text-sm font-medium text-gray-700 bg-white",
        "border border-gray-300 rounded-[16px]", // Bordas e arredondamento
        "shadow-[3px_3px_0px_#e5e7eb]", // Sombra de "borda dupla"
        "pointer-events-none whitespace-nowrap", // Impede que o mouse interaja com o tooltip
        className,

        // --- ANIMAÇÃO DE ENTRADA E SAÍDA (FADE, BLUR, SCALE) ---
        "transition-all duration-300 ease-in-out", // Aumentado para 300ms

        // Estado "Para" (visível) - usa `isVisible`
        isVisible && tooltipPosition.top !== -9999
          ? "opacity-100 blur-0 scale-100"
          // Estado "De" (oculto) - usa `isVisible`
          // Aumentado para blur-lg (16px) para um efeito mais forte
          : "opacity-0 blur-lg scale-95",
      )}
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
      }}
      role="tooltip"
    >
      {content}

      {/* Seta externa (borda) */}
      <div className={getArrowClasses()} />

      {/* Seta interna (fundo) */}
      <div className={getArrowInnerClasses()} />
    </div>
  ) : null;

  const portalTarget = isMounted ? document.body : null;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex items-center justify-center"
        aria-describedby={isVisible ? "tooltip-content" : undefined}
      >
        {children}
      </span>

      {portalTarget && tooltipContent && createPortal(tooltipContent, portalTarget)}
    </>
  );
}

