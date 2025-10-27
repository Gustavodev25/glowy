"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { gsap } from "gsap";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right"; // for bottom placement
  placement?: "bottom" | "right"; // default bottom; 'right' renders outside to the right
  offset?: number; // px offset from anchor/aside
}

interface SmartPosition {
  align: "left" | "right";
  position: "top" | "bottom";
}

export default function Dropdown({
  trigger,
  children,
  align = "right",
  placement = "bottom",
  offset = 8,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [smartPosition, setSmartPosition] = useState<SmartPosition>({
    align: align,
    position: "bottom",
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inTrigger = dropdownRef.current?.contains(target);
      const inMenu = menuRef.current?.contains(target);
      if (!inTrigger && !inMenu) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute fixed position when opening at right of sidebar
  useEffect(() => {
    const updatePosition = () => {
      if (!dropdownRef.current || !menuRef.current) return;
      const root = dropdownRef.current;
      const menu = menuRef.current;
      const triggerRect = root.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = 224; // w-56 = 14rem = 224px
      const menuHeight = menuRect.height || 200; // altura estimada ou real

      if (placement === "right") {
        // Anchor to the RIGHT OUTSIDE of the closest <aside>
        const aside = root.closest("aside") as HTMLElement | null;
        const asideRect = aside?.getBoundingClientRect();
        let left = (asideRect ? asideRect.right : triggerRect.right) + offset;
        let top = triggerRect.top;

        // Verifica se vai sair da tela pela direita
        if (left + menuWidth > viewportWidth) {
          // Coloca à esquerda do aside ou trigger
          left =
            (asideRect ? asideRect.left : triggerRect.left) -
            menuWidth -
            offset;
        }

        // Verifica se vai sair da tela por baixo
        if (top + menuHeight > viewportHeight) {
          top = viewportHeight - menuHeight - 10; // 10px de margem
        }

        // Verifica se vai sair da tela por cima
        if (top < 10) {
          top = 10; // 10px de margem do topo
        }

        setMenuPos({ left, top });
      } else {
        // placement === "bottom" - detecção inteligente de posição
        let finalAlign: "left" | "right" = align;
        let finalPosition: "top" | "bottom" = "bottom";

        // Verifica espaço na horizontal
        const spaceRight = viewportWidth - triggerRect.right;
        const spaceLeft = triggerRect.left;

        if (align === "right") {
          // Menu alinhado à direita do trigger
          if (spaceRight < menuWidth && spaceLeft > spaceRight) {
            finalAlign = "left"; // Muda para esquerda se não couber à direita
          }
        } else {
          // Menu alinhado à esquerda do trigger
          if (spaceLeft < menuWidth && spaceRight > spaceLeft) {
            finalAlign = "right"; // Muda para direita se não couber à esquerda
          }
        }

        // Verifica espaço na vertical
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
          finalPosition = "top"; // Abre para cima se não couber embaixo
        }

        setSmartPosition({ align: finalAlign, position: finalPosition });
        setMenuPos(null);
      }
    };

    if (isOpen) {
      // Pequeno delay para garantir que o menu foi renderizado
      setTimeout(updatePosition, 0);
      window.addEventListener("scroll", updatePosition, { passive: true });
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, placement, offset, align]);

  // Animate open/close
  useEffect(() => {
    if (!menuRef.current) return;
    const yOffset =
      placement === "right" ? 0 : smartPosition.position === "top" ? 10 : -10;
    const xOffset = placement === "right" ? -10 : 0;

    if (isOpen) {
      gsap.fromTo(
        menuRef.current,
        {
          opacity: 0,
          scale: 0.95,
          y: yOffset,
          x: xOffset,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          x: 0,
          filter: "blur(0px)",
          duration: 0.25,
          ease: "power2.out",
        },
      );
    } else {
      gsap.to(menuRef.current, {
        opacity: 0,
        scale: 0.95,
        y: yOffset,
        x: xOffset,
        filter: "blur(10px)",
        duration: 0.18,
        ease: "power2.in",
      });
    }
  }, [isOpen, placement, smartPosition.position]);

  const toggleDropdown = () => setIsOpen((v) => !v);
  const closeDropdown = () => setIsOpen(false);

  return (
    <div ref={dropdownRef} className="relative">
      <div onClick={toggleDropdown}>{trigger}</div>

      {isOpen &&
        (placement === "right" ? (
          <div
            ref={menuRef}
            className="fixed min-w-56 max-w-md bg-white rounded-2xl shadow-[3px_3px_0px_#e5e7eb] py-1 z-50 border border-gray-300 overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{
              top: menuPos?.top ?? 0,
              left: menuPos?.left ?? 0,
              transformOrigin: "top left",
            }}
          >
            {/* Efeito de brilho */}
            <span className="absolute top-0 left-0 w-12 h-12 bg-[#C5837B] rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none" />
            <span className="absolute bottom-0 right-0 w-12 h-12 bg-[#C5837B] rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none" />

            <div className="relative z-10" onClick={closeDropdown}>
              {children}
            </div>
          </div>
        ) : (
          <div
            ref={menuRef}
            className={`absolute ${smartPosition.align === "right" ? "right-0" : "left-0"} ${smartPosition.position === "top" ? "bottom-full mb-2" : "mt-2"} w-56 bg-white rounded-2xl shadow-[3px_3px_0px_#e5e7eb] py-1 z-50 border border-gray-300 overflow-hidden max-h-[90vh] overflow-y-auto`}
            style={{
              transformOrigin:
                smartPosition.position === "top"
                  ? smartPosition.align === "right"
                    ? "bottom right"
                    : "bottom left"
                  : smartPosition.align === "right"
                    ? "top right"
                    : "top left",
            }}
          >
            {/* Efeito de brilho */}
            <span className="absolute top-0 left-0 w-12 h-12 bg-[#C5837B] rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none" />
            <span className="absolute bottom-0 right-0 w-12 h-12 bg-[#C5837B] rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none" />

            <div className="relative z-10" onClick={closeDropdown}>
              {children}
            </div>
          </div>
        ))}
    </div>
  );
}
