"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import Button from "@/components/visual/Button";
import CardIcon from "@/components/visual/CardIcon";

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

interface FooterConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function FooterConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  message,
  confirmText = "Aceitar",
  cancelText = "Cancelar",
  isLoading = false,
}: FooterConfirmationProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Animação de entrada
      const tl = gsap.timeline();

      // Card slide up with blur
      tl.fromTo(
        cardRef.current,
        {
          y: 50,
          opacity: 0,
          filter: "blur(20px)",
        },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.4,
          ease: "power2.out",
        },
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!cardRef.current) return;

    // Animação de saída
    const tl = gsap.timeline();

    // Card slide down with blur
    tl.to(cardRef.current, {
      y: 50,
      opacity: 0,
      filter: "blur(20px)",
      duration: 0.3,
      ease: "power2.in",
    });

    // Fecha após animação
    tl.call(() => {
      onClose();
    });
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {/* Card no footer */}
      <div
        ref={cardRef}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4"
      >
        <div className="relative">
          {/* Borda de trás estática */}
          <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>

          {/* Card principal */}
          <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              {/* Ícone */}
              <div className="flex-shrink-0">
                <CardIcon icon="alert" size="md" color="#3b82f6" />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {title}
                  </h3>
                  <p className="text-xs text-gray-500">{subtitle}</p>
                </div>
                <p className="text-sm text-gray-600 mb-3 text-left">
                  {message}
                </p>

                {/* Botões */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    {cancelText}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onConfirm}
                    isLoading={isLoading}
                  >
                    {confirmText}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
