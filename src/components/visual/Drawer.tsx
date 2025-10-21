"use client";

import React, { useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";

// --- Utilitário de Classe ---
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

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  position?: "left" | "right" | "top" | "bottom";
  hideHeader?: boolean;
  dismissible?: boolean;
  className?: string;
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = "md",
  position = "right",
  hideHeader = false,
  dismissible = true,
  className = "",
}: DrawerProps) {

  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  const positionClasses = {
    left: "left-0",
    right: "right-0",
    top: "top-0",
    bottom: "bottom-0",
  };

  const sizeClasses = {
    left: "h-full",
    right: "h-full",
    top: "w-full",
    bottom: "w-full",
  };

  const transformClasses = {
    left: "translate-x-[-100%]",
    right: "translate-x-[100%]",
    top: "translate-y-[-100%]",
    bottom: "translate-y-[100%]",
  };

  useEffect(() => {
    if (isOpen) {
      // Animação de entrada
      const tl = gsap.timeline();

      // Overlay fade in
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" },
      );

      // Drawer slide in with blur
      tl.fromTo(
        drawerRef.current,
        {
          transform: position === "left" ? "translateX(-100%)" :
            position === "right" ? "translateX(100%)" :
              position === "top" ? "translateY(-100%)" : "translateY(100%)",
          filter: "blur(20px)",
          opacity: 0
        },
        {
          transform: "translateX(0) translateY(0)",
          filter: "blur(0px)",
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        },
        "-=0.1"
      );

      // Content fade in
      tl.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" },
        "-=0.1"
      );

      // Previne scroll do body
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, position]);

  const handleClose = () => {
    if (!dismissible) return;

    // Animação de saída
    const tl = gsap.timeline();

    // Content fade out
    tl.to(contentRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.15,
      ease: "power2.in"
    });

    // Drawer slide out with blur
    tl.to(drawerRef.current, {
      transform: position === "left" ? "translateX(-100%)" :
        position === "right" ? "translateX(100%)" :
          position === "top" ? "translateY(-100%)" : "translateY(100%)",
      filter: "blur(20px)",
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    }, "-=0.1");

    // Overlay fade out
    tl.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in"
    }, "-=0.1");

    // Fecha após animação
    tl.call(() => {
      onClose();
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && dismissible) {
      handleClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && dismissible) {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleOverlayClick}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          'fixed bg-white border border-gray-300 shadow-[3px_3px_0px_#e5e7eb] flex flex-col',
          positionClasses[position],
          sizeClasses[position],
          width !== "full" && position !== "top" && position !== "bottom" ? widthClasses[width] : '',
          className
        )}
        style={{
          transformStyle: "preserve-3d",
          width: width === "lg" ? "32rem" : width === "md" ? "28rem" : width === "sm" ? "24rem" : width === "xl" ? "36rem" : width === "2xl" ? "42rem" : undefined
        }}
      >
        {/* Efeito de brilho */}
        <span className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-30 animate-pulse" />
        <span className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-30 animate-pulse" />

        {/* Container do conteúdo para garantir que fique acima do brilho */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Header */}
          {!hideHeader && (
            <div className="flex flex-shrink-0 items-center justify-between p-6 border-b border-gray-200">
              {title && (
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              )}
              {dismissible && (
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Fechar"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto p-6"
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex-shrink-0 border-t border-gray-200 p-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Portal para renderizar fora da árvore DOM
  return createPortal(drawerContent, document.body);
}
