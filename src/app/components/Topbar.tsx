"use client";

import React, { useState, useEffect, useRef, ReactNode, memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Avatar from "@/components/Avatar";
import { gsap } from "gsap";

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
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Animação de abertura e fechamento
  useEffect(() => {
    if (!menuRef.current) return;

    if (isOpen) {
      gsap.fromTo(
        menuRef.current,
        {
          opacity: 0,
          scale: 0.95,
          y: -10,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.25,
          ease: "power2.out",
        },
      );
    } else {
      gsap.to(menuRef.current, {
        opacity: 0,
        scale: 0.95,
        y: -10,
        filter: "blur(10px)",
        duration: 0.18,
        ease: "power2.in",
      });
    }
  }, [isOpen]);

  const alignmentClasses = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute ${alignmentClasses} mt-2 w-64 rounded-2xl border border-gray-300 shadow-[3px_3px_0px_#e5e7eb] bg-white z-50 overflow-hidden`}
          onClick={() => setIsOpen(false)}
          style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
        >
          {/* Efeito de brilho */}
          <span className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-16 h-16 bg-[#C5837B] rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none" />
          <span className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-16 h-16 bg-[#C5837B] rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none" />

          <div className="relative z-10" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
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

  // Estado para assinatura
  const [subscription, setSubscription] = useState<{
    plan: {
      id: string;
      name: string;
      description?: string;
      iconUrl?: string | null;
    };
    status?: string;
    nextDueDate?: Date | string | null;
    isInherited?: boolean;
    ownerName?: string | null;
    ownerPlanName?: string | null;
  } | null>(null);
  const [loadingSub, setLoadingSub] = useState<boolean>(false);

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

  // Buscar assinatura do usuário
  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      const fetchSubscription = async () => {
        try {
          setLoadingSub(true);
          const res = await fetch("/api/subscriptions/me", {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.subscription?.plan) {
              setSubscription({
                plan: data.subscription.plan,
                status: data.subscription.status,
                nextDueDate: data.subscription.nextDueDate,
                isInherited: data.subscription.isInherited,
                ownerName: data.subscription.ownerName,
                ownerPlanName: data.subscription.ownerPlanName,
              });
            } else {
              setSubscription(null);
            }
          }
        } catch (e) {
          console.error("Erro ao buscar assinatura:", e);
        } finally {
          setLoadingSub(false);
        }
      };
      fetchSubscription();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  // --- Funções Otimizadas com useCallback ---

  const handleLogout = useCallback(async () => {
    await authLogout();
  }, [authLogout]);

  const handleDashboardClick = useCallback(() => {
    if (user?.tipoUsuario === "dono" || user?.tipoUsuario === "usuario") {
      router.push("/views/manager");
    }
  }, [user?.tipoUsuario, router]);


  // --- Renderização do Componente (JSX) ---
  return (
    <div className={`sticky top-0 z-50 transition-all duration-500 ease-out ${scrolled
      ? "mx-2 md:mx-auto md:max-w-5xl mt-2"
      : "w-full"
      }`}>
      {/* Topbar principal */}
      <nav
        className={`relative z-10 transition-all duration-500 ease-out ${scrolled
          ? "rounded-b-2xl border border-white/20 bg-white/60 backdrop-blur-md shadow-lg"
          : "bg-white border-b border-gray-200"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex justify-between items-center transition-all duration-500 ease-out ${scrolled ? "h-14" : "h-16"
              }`}
          >
            {/* Logo */}
            <a href="/views/home" className="flex items-center gap-3">
              <img
                src="/assets/logo.png"
                alt="Logo Booky"
                className="w-10 h-10 rounded-lg object-cover"
              />

            </a>

            {/* Links de navegação - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a href="/views/home" className="text-gray-700 hover:text-[#C5837B] transition-colors duration-200 font-medium">
                Página Inicial
              </a>
              <a href="/views/catalogo" className="text-gray-700 hover:text-[#C5837B] transition-colors duration-200 font-medium">
                Catálogo
              </a>
              <a href="/views/planos" className="text-gray-700 hover:text-[#C5837B] transition-colors duration-200 font-medium">
                Planos
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
                  {(user.tipoUsuario === "dono" || user.tipoUsuario === "usuario") && (
                    <button
                      onClick={handleDashboardClick}
                      className="px-4 py-2 text-[#C5837B] font-medium hover:text-[#B0736B] hover:bg-[#C5837B]/5 rounded-lg transition-all duration-200"
                    >
                      Acessar Painel
                    </button>
                  )}
                  <Dropdown
                    trigger={
                      <button className="hover:opacity-80 transition-opacity duration-200 relative">
                        <Avatar
                          name={user.nome}
                          id={user.id}
                          imageUrl={user.avatarUrl}
                          size="md"
                        />
                        {user.tipoUsuario === "dono" && (
                          <span className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 p-1 rounded-full shadow-md border border-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z" />
                            </svg>
                          </span>
                        )}
                      </button>
                    }
                    align="right"
                  >
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar
                          name={user.nome}
                          id={user.id}
                          imageUrl={user.avatarUrl}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900">{user.nome}</p>
                            {user.tipoUsuario === "dono" ? (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 text-[10px] font-bold rounded-full border border-yellow-300">
                                DONO
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-[10px] font-bold rounded-full border border-blue-300">
                                PRO
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        {subscription?.isInherited ? (
                          <div className="space-y-1">
                            <div className="flex items-start gap-1.5">
                              <svg
                                className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs text-gray-700 block">
                                  Plano: <span className="font-semibold">{subscription.plan.name}</span>
                                </span>
                                <p className="text-[10px] text-blue-600 leading-tight mt-0.5">
                                  Você tem acesso ao plano {subscription.ownerPlanName} como convidado de {subscription.ownerName}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-700">
                              Plano: {subscription?.plan?.name || "—"}
                            </span>
                            {subscription?.nextDueDate && (
                              <span className="text-xs text-gray-500">
                                {(() => {
                                  const today = new Date();
                                  const dueDate = new Date(subscription.nextDueDate);
                                  const diffTime = dueDate.getTime() - today.getTime();
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                  if (diffDays < 0) {
                                    return "Expirado";
                                  } else if (diffDays === 0) {
                                    return "Expira hoje";
                                  } else if (diffDays === 1) {
                                    return "1 dia";
                                  } else {
                                    return `${diffDays} dias`;
                                  }
                                })()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
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
                  <Link href="/" className="px-4 py-2 text-[#C5837B] font-medium hover:text-[#B0736B] transition-colors duration-200">
                    Entrar
                  </Link>
                  <Link href="/cadastro" className="px-6 py-2 bg-[#C5837B] text-white font-medium hover:bg-[#B0736B] rounded-lg transition-all duration-200">
                    Começar Grátis
                  </Link>
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
              <a href="/views/planos" className="block px-3 py-2 rounded-md text-gray-700 hover:text-[#C5837B] hover:bg-gray-50 font-medium transition-colors duration-200" onClick={() => setMenuAberto(false)}>
                Planos
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
                        <div className="relative">
                          <Avatar
                            name={user.nome}
                            id={user.id}
                            imageUrl={user.avatarUrl}
                            size="lg"
                          />
                          {user.tipoUsuario === "dono" && (
                            <span className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 p-1.5 rounded-full shadow-md border border-white">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-base font-medium text-gray-900 truncate">{user.nome}</p>
                            {user.tipoUsuario === "dono" ? (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 text-[10px] font-bold rounded-full border border-yellow-300 whitespace-nowrap">
                                DONO
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-[10px] font-bold rounded-full border border-blue-300 whitespace-nowrap">
                                PRO
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    {(user.tipoUsuario === "dono" || user.tipoUsuario === "usuario") && (
                      <button onClick={() => { handleDashboardClick(); setMenuAberto(false); }} className="block w-full px-4 py-3 text-center text-[#C5837B] font-medium hover:text-[#B0736B] hover:bg-[#C5837B]/5 rounded-lg transition-all duration-200">
                        Acessar Painel
                      </button>
                    )}
                    <button onClick={() => { router.push("/perfil"); setMenuAberto(false); }} className="block w-full px-4 py-3 text-center text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                      Ver Perfil
                    </button>
                    <button onClick={() => { handleLogout(); setMenuAberto(false); }} className="block w-full px-4 py-3 text-center text-red-600 font-medium hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200">
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/" className="block w-full px-4 py-3 text-center text-[#C5837B] font-medium hover:text-[#B0736B] hover:bg-[#C5837B]/5 rounded-lg transition-all duration-200" onClick={() => setMenuAberto(false)}>
                      Entrar
                    </Link>
                    <Link href="/cadastro" className="block w-full px-4 py-3 text-center bg-[#C5837B] text-white font-medium hover:bg-[#B0736B] rounded-lg transition-all duration-200" onClick={() => setMenuAberto(false)}>
                      Começar Grátis
                    </Link>
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
