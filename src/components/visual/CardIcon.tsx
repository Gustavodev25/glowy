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
  color?: string;
  icon?: "building" | "check" | "briefcase" | "scissors" | "sparkles" | "heart" | "car" | "phone" | "camera" | "music" | "book" | "home" | "gift" | "star" | "brain" | "baby" | "stethoscope" | "paintbrush" | "massage" | "tooth" | "eye" | "pill" | "calendar" | "alert" | "map" | "history" | "files" | "file-description";
  children?: React.ReactNode;
  circular?: boolean;
  // A prop 'variant' foi removida para adotar um estilo único e consistente.
}

export default function CardIcon({
  size = "md",
  className = "",
  color = "#C5837B",
  icon = "building",
  children,
  circular = false,
}: CardIconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  } as const;

  // As classes de estilo foram movidas diretamente para o JSX para corresponder ao visual do componente Button.
  const cardClasses = cn(
    // Estilos base para replicar o visual do botão
    'relative inline-flex items-center justify-center', // Layout
    children ? 'p-0' : 'p-3', // Padding condicional: sem padding se há children
    'bg-white text-gray-700', // Cor de fundo e do texto
    'border border-gray-300', // Borda
    circular ? 'rounded-full' : 'rounded-2xl', // Bordas condicionais: circular ou arredondadas
    'shadow-[3px_3px_0px_#e5e7eb]', // Sombra 3D
    'transition-transform transition-shadow duration-100 ease-linear', // Transições suaves
    'hover:bg-gray-50', // Efeito ao passar o mouse
    'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none', // Efeito de clique
    className // Permite classes customizadas
  );

  const renderIcon = () => {
    if (icon === "check") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M5 12l5 5l10 -10" />
        </svg>
      );
    }

    if (icon === "briefcase") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M22 13.478v4.522a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3v-4.522l.553 .277a20.999 20.999 0 0 0 18.897 -.002l.55 -.275zm-8 -11.478a3 3 0 0 1 3 3v1h2a3 3 0 0 1 3 3v2.242l-1.447 .724a19.002 19.002 0 0 1 -16.726 .186l-.647 -.32l-1.18 -.59v-2.242a3 3 0 0 1 3 -3h2v-1a3 3 0 0 1 3 -3h4zm-2 8a1 1 0 0 0 -1 1a1 1 0 1 0 2 .01c0 -.562 -.448 -1.01 -1 -1.01zm2 -6h-4a1 1 0 0 0 -1 1v1h6v-1a1 1 0 0 0 -1 -1z" />
        </svg>
      );
    }

    if (icon === "scissors") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M6 7m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
          <path d="M6 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
          <path d="M8.6 8.6l10.4 10.4" />
          <path d="M8.6 15.4l10.4 -10.4" />
        </svg>
      );
    }

    if (icon === "sparkles") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z" />
        </svg>
      );
    }

    if (icon === "heart") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
        </svg>
      );
    }

    if (icon === "car") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M5 17h-2v-6l2 -5h9l4 5v6h-2m-4 0h-6m-6 -6h15m-6 0v-5a2 2 0 0 0 -2 -2h-4a2 2 0 0 0 -2 2v5" />
        </svg>
      );
    }

    if (icon === "phone") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
        </svg>
      );
    }

    if (icon === "camera") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
          <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
        </svg>
      );
    }

    if (icon === "music") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
          <path d="M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
          <path d="M9 17v-13h10v13" />
          <path d="M9 8h10" />
        </svg>
      );
    }

    if (icon === "book") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 19.5a2.5 2.5 0 0 1 2.5 -2.5h11a2.5 2.5 0 0 1 2.5 2.5v-15a2.5 2.5 0 0 0 -2.5 -2.5h-11a2.5 2.5 0 0 0 -2.5 2.5v15z" />
          <path d="M8 7h8" />
          <path d="M8 11h8" />
          <path d="M8 15h4" />
        </svg>
      );
    }

    if (icon === "home") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
          <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
          <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
        </svg>
      );
    }

    if (icon === "gift") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z" />
          <path d="M12 8l0 13" />
          <path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7" />
          <path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5" />
        </svg>
      );
    }

    if (icon === "star") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
        </svg>
      );
    }

    if (icon === "brain") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1 -1v-1a3.5 3.5 0 0 0 -3.5 -3.5z" />
          <path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-1a3.5 3.5 0 0 1 3.5 -3.5z" />
          <path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5a7 7 0 0 0 -13 0h-.5a3.5 3.5 0 0 0 0 7h.5a7 7 0 0 0 13 0h.5z" />
        </svg>
      );
    }

    if (icon === "baby") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
          <path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
          <path d="M9 16c.64 .88 1.4 1.5 2.25 1.5s1.61 -.62 2.25 -1.5" />
          <path d="M8 7h8a7 7 0 0 1 7 7v3a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-3a7 7 0 0 1 7 -7z" />
        </svg>
      );
    }

    if (icon === "stethoscope") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M6 4h-1a2 2 0 0 0 -2 2v3.5h0a5.5 5.5 0 0 0 11 0v-3.5a2 2 0 0 0 -2 -2h-1" />
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <path d="M11 10.5a5.5 5.5 0 0 1 5.5 5.5v3.5a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-3.5a5.5 5.5 0 0 1 5.5 -5.5z" />
        </svg>
      );
    }

    if (icon === "paintbrush") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 21h18" />
          <path d="M5 21v-16l8 -4v16" />
          <path d="M19 21v-11l-6 -6" />
          <path d="M9 9l0 6" />
          <path d="M15 9l0 6" />
        </svg>
      );
    }

    if (icon === "massage") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 17m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
          <path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
          <path d="M4 22c0 -1.5 1.5 -2 3 -2s3 .5 3 2" />
          <path d="M9 5c0 -1.5 1.5 -2 3 -2s3 .5 3 2" />
          <path d="M12 5c0 -1.5 1.5 -2 3 -2s3 .5 3 2v6.5c0 1.5 -1.5 2 -3 2s-3 -.5 -3 -2v-6.5" />
          <path d="M9 12c0 -1.5 1.5 -2 3 -2s3 .5 3 2v6.5c0 1.5 -1.5 2 -3 2s-3 -.5 -3 -2v-6.5" />
          <path d="M6 12c0 -1.5 1.5 -2 3 -2s3 .5 3 2v6.5c0 1.5 -1.5 2 -3 2s-3 -.5 -3 -2v-6.5" />
        </svg>
      );
    }

    if (icon === "tooth") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 5.5c-1.5 0 -3 1.5 -3 3c0 1.5 1.5 3 3 3s3 -1.5 3 -3c0 -1.5 -1.5 -3 -3 -3z" />
          <path d="M12 2.5c-2 0 -4 2 -4 4c0 2 2 4 4 4s4 -2 4 -4c0 -2 -2 -4 -4 -4z" />
          <path d="M12 8.5v8" />
          <path d="M8 12.5h8" />
        </svg>
      );
    }

    if (icon === "eye") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
          <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
        </svg>
      );
    }

    if (icon === "pill") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4.5 12.5l8 -8a4.94 4.94 0 0 1 7 7l-8 8a4.94 4.94 0 0 1 -7 -7z" />
          <path d="M8.5 8.5l7 7" />
        </svg>
      );
    }

    if (icon === "calendar") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" />
          <path d="M16 3v4" />
          <path d="M8 3v4" />
          <path d="M4 11h16" />
        </svg>
      );
    }

    if (icon === "alert") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }

    if (icon === "map") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3z" />
          <path d="M9 4v13" />
          <path d="M15 7v13" />
        </svg>
      );
    }

    if (icon === "history") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 8l0 4l2 2" />
          <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
        </svg>
      );
    }

    if (icon === "files") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M15 3v4a1 1 0 0 0 1 1h4" />
          <path d="M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2z" />
          <path d="M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2" />
        </svg>
      );
    }

    if (icon === "file-description") {
      return (
        <svg
          className={cn(sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ color: '#000000' }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm3 14h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m0 -4h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2" />
          <path d="M19 7h-4l-.001 -4.001z" />
        </svg>
      );
    }

    // Ícone padrão (building)
    return (
      <svg
        className={cn(sizeClasses[size])}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: '#000000' }}
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
    );
  };

  return (
    <div className={cardClasses}>
      {children || renderIcon()}
    </div>
  );
}
