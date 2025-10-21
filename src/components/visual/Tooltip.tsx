"use client";

import React, { useState, useRef, useEffect } from "react";

// --- Utilitário de Classe ---
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

export interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export default function Tooltip({
  children,
  content,
  position = "top",
  delay = 300,
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left =
          triggerRect.left +
          scrollX +
          (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + scrollY + 8;
        left =
          triggerRect.left +
          scrollX +
          (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top =
          triggerRect.top +
          scrollY +
          (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case "right":
        top =
          triggerRect.top +
          scrollY +
          (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollX + 8;
        break;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowClasses = () => {
    const baseClasses = "absolute w-0 h-0";
    switch (position) {
      case "top":
        return cn(
          baseClasses,
          "top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200",
        );
      case "bottom":
        return cn(
          baseClasses,
          "bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-200",
        );
      case "left":
        return cn(
          baseClasses,
          "left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-200",
        );
      case "right":
        return cn(
          baseClasses,
          "right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-200",
        );
      default:
        return baseClasses;
    }
  };

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

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-[99999] px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 shadow-lg",
            "animate-fade-in pointer-events-none",
            className,
          )}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          {content}

          {/* Seta externa (borda) */}
          <div className={getArrowClasses()} />

          {/* Seta interna (fundo) */}
          <div className={getArrowInnerClasses()} />
        </div>
      )}
    </>
  );
}
