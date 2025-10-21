"use client";

import React from "react";

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

export interface CardIconProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "outline" | "filled" | "minimal";
  color?: string;
}

export default function CardIcon({
  size = "md",
  className = "",
  variant = "outline",
  color = "#C5837B",
}: CardIconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const containerSizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "filled":
        return "bg-[#C5837B]/10 text-[#C5837B]";
      case "minimal":
        return "text-gray-600";
      case "outline":
      default:
        return "text-[#C5837B]";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl",
        containerSizeClasses[size],
        variant === "filled" ? getVariantClasses() : "",
        className
      )}
    >
      <svg
        className={cn(sizeClasses[size], variant !== "filled" ? getVariantClasses() : "")}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 21l18 0" />
        <path d="M9 8l1 0" />
        <path d="M9 12l1 0" />
        <path d="M9 16l1 0" />
        <path d="M14 8l1 0" />
        <path d="M14 12l1 0" />
        <path d="M14 16l1 0" />
        <path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16" />
      </svg>
    </div>
  );
}
