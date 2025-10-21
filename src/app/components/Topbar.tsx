"use client";

import React, { useState, useEffect, useRef, ReactNode, memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// --- Tipos (Interfaces) ---
interface User {
  id: string;
  nome: string;
  email: string;
  tipoUsuario?: "dono" | "usuario";
  avatarUrl?: string;
}

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

// --- Componente Dropdown Otimizado ---
const Dropdown = memo<DropdownProps>(({ trigger, children, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const alignmentClasses = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute ${alignmentClasses} mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50`}
          onClick={() => setIsOpen(false)}
        >
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {children}
          </div>
        </div>
      )}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

// --- Componente Principal: Topbar ---
function Topbar() {
  // --- Estados do Componente ---
  const router = useRouter();
  const { user, loading, logout: authLogout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // --- Efeitos (Lifecycle) ---
  // Adiciona um listener para o evento de scroll com throttle para melhor performance
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 12);
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll(); // Verifica o estado inicial
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Funções Otimizadas com useCallback ---

  const handleLogout = useCallback(async () => {
    await authLogout();
  }, [authLogout]);

  const handleDashboardClick = useCallback(() => {
    if (user?.tipoUsuario === "dono") {
      router.push("/views/manager");
    } else if (user?.tipoUsuario === "usuario") {
      router.push("/dashboard/usuario");
    }
  }, [user?.tipoUsuario, router]);

  const getInitials = useCallback((nome: string) => {
    const names = nome.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  }, []);

  const renderAvatar = useCallback((user: User, className: string = "w-10 h-10") => {
    if (user.avatarUrl) {
      return (
        <img
          src={user.avatarUrl}
          alt={`Avatar de ${user.nome}`}
          className={`${className} rounded-full object-cover`}
        />
      );
    }

    return (
      <div
        className={`${className} rounded-full bg-[#C5837B] text-white font-semibold flex items-center justify-center`}
      >
        {getInitials(user.nome)}
      </div>
    );
  }, [getInitials]);

  // --- Renderização do Componente (JSX) ---
  return (
    <div className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
      ? "mx-2 md:mx-auto md:max-w-5xl mt-2"
      : "w-full"
      }`}>
      {/* Topbar principal */}
      <nav
        className={`relative z-10 transition-all duration-300 ${scrolled
          ? "rounded-b-2xl border border-white/20 bg-white/60 backdrop-blur-md shadow-lg"
          : "bg-white border-b border-gray-200"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex justify-between items-center transition-all duration-300 ${scrolled ? "h-14" : "h-16"
              }`}
          >
            {/* Logo */}
            <a href="/views/home" className="flex items-center gap-3">
              <img
                src="/assets/logo.png"
                alt="Logo Booky"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <span className="text-2xl font-bold text-[#C5837B]">Booky</span>
            </a>

            {/* Links de navegação - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a href="/views/home" className="text-gray-700 hover:text-[#C5837B] transition-colors duration-200 font-medium">
                Página Inicial
              </a>
              <a href="/views/catalogo" className="text-gray-700 hover:text-[#C5837B] transition-colors duration-200 font-medium">
                Catálogo
              </a>
              <a href="#funcionalidades" className="text-gray-700 hover:text-[#C5837B] transition-colors duration-200 font-medium">
                Funcionalidades
              </a>
              <a href="/views/planos" className="text-gray-700 hover:text-[#C5837B] transition-colors duration-200 font-medium">
                Planos
              </a>
              <a href="#contato" className="text-gray-700 hover:text-[#C5837B] transition-colors duration-200 font-medium">
                Contato
              </a>
            </div>

            {/* Botões de ação - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              {loading ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-8 rounded-md bg-gray-200 animate-pulse"></div>
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
              ) : user ? (
                <>
                  {user.tipoUsuario === "dono" && (
                    <button
                      onClick={handleDashboardClick}
                      className="px-4 py-2 text-[#C5837B] font-medium hover:text-[#B0736B] transition-colors duration-200"
                    >
                      Acessar Painel
                    </button>
                  )}
                  <Dropdown
                    trigger={
                      <button className="hover:opacity-80 transition-opacity duration-200">
                        {renderAvatar(user)}
                      </button>
                    }
                    align="right"
                  >
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.nome}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => router.push("/perfil")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      Sair
                    </button>
                  </Dropdown>
                </>
              ) : (
                <>
                  <a href="/login" className="px-4 py-2 text-[#C5837B] font-medium hover:text-[#B0736B] transition-colors duration-200">
                    Entrar
                  </a>
                  <a href="/cadastro" className="px-6 py-2 bg-[#C5837B] text-white rounded-md font-medium hover:bg-[#B0736B] focus:outline-none focus:ring-2 focus:ring-[#C5837B] focus:ring-offset-2 transition duration-200">
                    Começar Grátis
                  </a>
                </>
              )}
            </div>

            {/* Menu Mobile - Botão hamburguer */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="p-2 rounded-md text-gray-700 hover:text-[#C5837B] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C5837B]"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuAberto ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile - Conteúdo */}
        {menuAberto && (
          <div
            className={`md:hidden ${scrolled
              ? "border-t border-white/20 bg-white/60 backdrop-blur-md"
              : "border-t border-gray-200 bg-white"
              }`}
          >
            <div className="px-4 pt-2 pb-4 space-y-3">
              <a href="/views/home" className="block px-3 py-2 rounded-md text-gray-700 hover:text-[#C5837B] hover:bg-gray-50 font-medium transition-colors duration-200" onClick={() => setMenuAberto(false)}>
                Página Inicial
              </a>
              <a href="/views/catalogo" className="block px-3 py-2 rounded-md text-gray-700 hover:text-[#C5837B] hover:bg-gray-50 font-medium transition-colors duration-200" onClick={() => setMenuAberto(false)}>
                Catálogo
              </a>
              <a href="#funcionalidades" className="block px-3 py-2 rounded-md text-gray-700 hover:text-[#C5837B] hover:bg-gray-50 font-medium transition-colors duration-200" onClick={() => setMenuAberto(false)}>
                Funcionalidades
              </a>
              <a href="/views/planos" className="block px-3 py-2 rounded-md text-gray-700 hover:text-[#C5837B] hover:bg-gray-50 font-medium transition-colors duration-200" onClick={() => setMenuAberto(false)}>
                Planos
              </a>
              <a href="#contato" className="block px-3 py-2 rounded-md text-gray-700 hover:text-[#C5837B] hover:bg-gray-50 font-medium transition-colors duration-200" onClick={() => setMenuAberto(false)}>
                Contato
              </a>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    <div className="px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="w-24 h-4 rounded bg-gray-200 animate-pulse"></div>
                          <div className="w-32 h-3 rounded bg-gray-200 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-10 rounded-md bg-gray-200 animate-pulse"></div>
                    <div className="w-full h-10 rounded-md bg-gray-200 animate-pulse"></div>
                    <div className="w-full h-10 rounded-md bg-gray-200 animate-pulse"></div>
                  </div>
                ) : user ? (
                  <>
                    <div className="px-3">
                      <div className="flex items-center gap-3">
                        {renderAvatar(user, "w-12 h-12")}
                        <div>
                          <p className="text-base font-medium text-gray-900 truncate">{user.nome}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    {user.tipoUsuario === "dono" && (
                      <button onClick={() => { handleDashboardClick(); setMenuAberto(false); }} className="block w-full px-4 py-2 text-center text-[#C5837B] font-medium border border-[#C5837B] rounded-md hover:bg-gray-50 transition-colors duration-200">
                        Acessar Painel
                      </button>
                    )}
                    <button onClick={() => { router.push("/perfil"); setMenuAberto(false); }} className="block w-full px-4 py-2 text-center text-gray-700 font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200">
                      Ver Perfil
                    </button>
                    <button onClick={() => { handleLogout(); setMenuAberto(false); }} className="block w-full px-4 py-2 text-center bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition duration-200">
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/login" className="block w-full px-4 py-2 text-center text-[#C5837B] font-medium border border-[#C5837B] rounded-md hover:bg-gray-50 transition-colors duration-200" onClick={() => setMenuAberto(false)}>
                      Entrar
                    </a>
                    <a href="/cadastro" className="block w-full px-4 py-2 text-center bg-[#C5837B] text-white rounded-md font-medium hover:bg-[#B0736B] transition duration-200" onClick={() => setMenuAberto(false)}>
                      Começar Grátis
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

export default memo(Topbar);
