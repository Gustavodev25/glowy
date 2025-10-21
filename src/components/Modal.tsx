"use client";

import { useEffect, useRef, ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import Button from "@/components/visual/Button";

// --- Utilitário de Classe (Adicionado para consistência) ---
/**
 * Concatena nomes de classes condicionalmente. Semelhante à biblioteca 'clsx'.
 * @param {...(string | object | null | undefined)[]} args - Argumentos a serem processados.
 * @returns {string} Uma string de nomes de classe.
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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  // Visual e animação
  variant?: "center" | "fullscreen"; // fullscreen: ocupa tela toda e entra de baixo para cima
  hideHeader?: boolean; // esconde título e botão fechar
  dismissible?: boolean; // permite fechar por overlay/botão
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "lg",
  variant = "center",
  hideHeader = false,
  dismissible = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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

      if (variant === "fullscreen") {
        // Entra de baixo para cima ocupando a tela toda
        tl.fromTo(
          modalRef.current,
          { y: "100%" },
          { y: 0, duration: 0.45, ease: "power3.out" },
          "-=0.1",
        );
        tl.fromTo(
          contentRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: "power2.out" },
          "-=0.15",
        );
      } else {
        // Modal central com blur/scale
        tl.fromTo(
          modalRef.current,
          {
            filter: "blur(20px)",
            opacity: 0,
            scale: 0.8,
            y: 50,
          },
          {
            filter: "blur(0px)",
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.45,
            ease: "back.out(1.7)",
            clearProps: "filter", // Remove o filter inline após animação
          },
          "-=0.1",
        );
        tl.fromTo(
          contentRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
          "-=0.15",
        );
      }

      // Previne scroll do body
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, variant]);

  const handleClose = () => {
    // Se não for dismissible, ignora fechamento
    if (!dismissible) return;

    // Animação de saída
    const tl = gsap.timeline({ onComplete: onClose });

    if (variant === "fullscreen") {
      tl.to(contentRef.current, {
        opacity: 0,
        duration: 0.15,
        ease: "power2.in",
      });
      tl.to(
        modalRef.current,
        { y: "100%", duration: 0.35, ease: "power2.in" },
        "-=0.05",
      );
      tl.to(
        overlayRef.current,
        { opacity: 0, duration: 0.25, ease: "power2.in" },
        "-=0.25",
      );
    } else {
      // Conteúdo fade out
      tl.to(contentRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.2,
        ease: "power2.in",
      });
      // Modal blur out
      tl.to(
        modalRef.current,
        {
          filter: "blur(20px)",
          opacity: 0,
          scale: 0.8,
          y: 50,
          duration: 0.35,
          ease: "power2.in",
        },
        "-=0.1",
      );
      // Overlay fade out
      tl.to(
        overlayRef.current,
        { opacity: 0, duration: 0.25, ease: "power2.in" },
        "-=0.25",
      );
    }
  };

  if (!isOpen || !mounted) return null;

  const outerContainerPadding = variant === "fullscreen" ? "p-0" : "p-4";

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${outerContainerPadding}`}
    >
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={dismissible ? handleClose : undefined}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn("relative w-full overflow-hidden", {
          // Estilo do Modal centralizado (inspirado nas abas)
          "bg-white rounded-2xl border border-gray-300 shadow-[3px_3px_0px_#e5e7eb]":
            variant === "center",
          [maxWidthClasses[maxWidth]]: variant === "center",

          // Estilo do Modal fullscreen
          "h-screen w-screen rounded-none bg-white shadow-none":
            variant === "fullscreen",
        })}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Efeito de brilho apenas para o modal central */}
        {variant === "center" && (
          <>
            <span className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-30 animate-pulse" />
            <span className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-30 animate-pulse" />
          </>
        )}

        {/* Container do conteúdo para garantir que fique acima do brilho */}
        <div className={cn("relative z-10 flex flex-col", {
          "max-h-[90vh]": variant === "center",
          "h-full": variant === "fullscreen",
        })}>
          {/* Header */}
          {!hideHeader && (
            <div className="flex flex-shrink-0 items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              {dismissible && (
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              )}
            </div>
          )}

          {/* Content */}
          <div
            ref={contentRef}
            className="overflow-y-auto scrollbar-hide flex-1 min-h-0"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
