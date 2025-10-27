"use client";

import React, { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Dropdown from "@/components/Dropdown";
import Avatar from "@/components/Avatar";

interface SubMenuItem {
  label: string;
  href: string;
  hasArrow?: boolean;
}

interface MenuItem {
  label: string;
  icon: React.ReactElement;
  href?: string;
  hasDropdown?: boolean;
  subItems?: SubMenuItem[];
  badge?: number;
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  adminMode?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  user?: {
    id: string;
    nome: string;
    email: string;
    tipoUsuario?: "dono" | "usuario";
    isAdmin?: boolean;
    avatarUrl?: string;
  } | null;
  onToggleAdminMode?: () => void;
}

export default function Sidebar({
  isCollapsed = false,
  onToggle,
  adminMode = false,
  mobileOpen = false,
  onCloseMobile,
  user = null,
  onToggleAdminMode,
}: SidebarProps) {
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<MenuItem | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const pathname = usePathname();

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

  // Empresa e convites para dropdown de equipe no header
  const [empresa, setEmpresa] = useState<{
    id: string;
    nomeEmpresa: string;
    cidade?: string | null;
    estado?: string | null;
  } | null>(null);
  const [convitesPendentes, setConvitesPendentes] = useState<Array<{
    id: string;
    email: string;
    nome?: string | null;
    status?: string;
    createdAt?: string;
  }>>([]);
  const [membrosAtivos, setMembrosAtivos] = useState<Array<{
    id: string;
    nome?: string | null;
    email: string;
    avatarUrl?: string | null;
  }>>([]);
  const [loadingEquipeInfo, setLoadingEquipeInfo] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const isActive = (href: string) => {
    return pathname === href;
  };

  const handleMouseEnter = (label: string, event: React.MouseEvent) => {
    if (isCollapsed) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setHoveredPosition({
        top: rect.top,
        left: rect.right + 16,
      });
      setHoveredMenu(label);
    }
  };

  const handleMouseLeave = () => {
    setHoveredMenu(null);
    setHoveredPosition(null);
  };

  const toggleMenu = (label: string, event?: React.MouseEvent) => {
    if (isCollapsed) {
      // No modo colapsado, abrir popup de submenu
      const item = menuItems.find((m) => m.label === label);
      if (item && item.hasDropdown && event) {
        const rect = (
          event.currentTarget as HTMLElement
        ).getBoundingClientRect();
        setSubmenuPosition({
          top: rect.top,
          left: rect.right + 16,
        });
        setActiveSubmenu(item);
      }
    } else {
      // No modo expandido, comportamento normal
      if (openMenus.includes(label)) {
        setOpenMenus(openMenus.filter((item) => item !== label));
      } else {
        setOpenMenus([...openMenus, label]);
      }
    }
  };

  const closeSubmenu = () => {
    setActiveSubmenu(null);
    setSubmenuPosition(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeSubmenu) {
        closeSubmenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeSubmenu]);

  useEffect(() => {
    // Lazy load: buscar subscription após 1 segundo (não bloqueia renderização inicial)
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
  }, []);

  // Buscar dados da empresa e convites (dropdown de equipe no header)
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setLoadingEquipeInfo(true);
        const resEmp = await fetch("/api/empresa", { credentials: "include" });
        if (resEmp.ok) {
          const data = await resEmp.json();
          if (data?.empresa) {
            setEmpresa({
              id: data.empresa.id,
              nomeEmpresa: data.empresa.nomeEmpresa,
              cidade: data.empresa.cidade,
              estado: data.empresa.estado,
            });
          }
        }
        const resEq = await fetch("/api/empresa/equipe", { credentials: "include" });
        if (resEq.ok) {
          const data = await resEq.json();
          const convites = (data?.equipe || []).filter((i: any) => i?.tipo === 'convite');
          setConvitesPendentes(convites.map((c: any) => ({ id: c.id, email: c.email, nome: c.nome, status: c.status, createdAt: c.createdAt })));
          const membros = (data?.equipe || []).filter((i: any) => i?.tipo === 'membro');
          setMembrosAtivos(membros.map((m: any) => ({ id: m.id, nome: m.nome, email: m.email, avatarUrl: m.avatarUrl })));
        }
      } catch (e) {
        console.error('Erro ao buscar dados de empresa/equipe:', e);
      } finally {
        setLoadingEquipeInfo(false);
      }
    }, 800);
    return () => clearTimeout(t);
  }, []);

  // Gera QR estático e aplica blur no componente
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await QRCode.toDataURL("https://glowy.app/mobile-coming-soon", {
          width: 192,
          margin: 0,
          color: { dark: "#111827", light: "#ffffff" },
          errorCorrectionLevel: "M",
        });
        if (mounted) setQrDataUrl(data);
      } catch {
        // ignora
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // (sem QRCode dinâmico — pedido para abrir o mesmo card do perfil)

  // Menus do painel normal (dono)
  const normalMenuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: (
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      href: "/views/manager",
    },
    {
      label: "Minha Agenda",
      icon: (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      href: "/views/manager/minha-agenda",
    },
    {
      label: "Meus Serviços",
      icon: (
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
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      href: "/views/manager/meus-servicos",
    },
    {
      label: "Clientes",
      icon: (
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      href: "/views/manager/clientes",
    },
    {
      label: "Gerenciamento de Profissionais",
      icon: (
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      href: "/views/manager/profissionais/equipe",
    },
  ];

  // Menus do painel administrativo
  const adminMenuItems: MenuItem[] = [
    {
      label: "Painel Administrativo",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      href: "/views/admin/dashboard",
    },
    {
      label: "Planos",
      icon: (
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      href: "/views/admin/planos",
    },
  ];

  const menuItems = adminMode ? adminMenuItems : normalMenuItems;

  const handleItemClick = () => {
    if (mobileOpen && onCloseMobile) onCloseMobile();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <>
      {/* Backdrop (mobile only) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={
          `bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ease-in-out ` +
          // Mobile (off-canvas) - fixed position, não ocupa espaço no layout
          `fixed inset-y-0 left-0 z-50 w-64 shadow-2xl ` +
          (mobileOpen ? `translate-x-0` : `-translate-x-full`) +
          // Desktop - relative position, ocupa espaço no layout
          ` md:translate-x-0 md:shadow-none md:relative ` +
          // Desktop widths
          (isCollapsed ? ` md:w-20` : ` md:w-64`)
        }
      >
        {/* Logo + Dropdown Equipe */}
        <div className="p-6 pl-5">
          <div className={`flex items-center ${isCollapsed ? 'justify-start' : 'gap-3'}`}>
            <div className={`transition-all duration-300 ${isCollapsed ? "scale-90" : "scale-100"} ${isCollapsed ? '' : 'flex-shrink-0'}`}>
              <img src="/assets/logo.png" alt="Booky Logo" className={`rounded-lg object-cover transition-all duration-300 ${isCollapsed ? "w-10 h-10" : "w-12 h-12"}`} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 relative">
                <div className="absolute inset-1 translate-x-1 translate-y-1 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
                <Dropdown
                  trigger={
                    <button type="button" className="relative z-10 w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0 flex flex-col items-start">
                        <span className="text-sm font-semibold text-gray-900 truncate w-full text-left" title={empresa?.nomeEmpresa || 'Minha Empresa'}>{empresa?.nomeEmpresa || 'Minha Empresa'}</span>
                        <span className="text-[11px] text-gray-500 truncate w-full text-left" title={`${empresa?.cidade || ''}${empresa?.estado ? ' - ' + empresa?.estado : ''}`}>{(empresa?.cidade || '') + (empresa?.estado ? ' - ' + empresa?.estado : '')}</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                  }
                  align="left"
                >
                <div className="p-3 w-full">
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Empresa</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{empresa?.nomeEmpresa || 'Minha Empresa'}</p>
                    <p className="text-xs text-gray-500 truncate">{(empresa?.cidade || '') + (empresa?.estado ? ' - ' + empresa?.estado : '')}</p>
                  </div>

                  {/* Mostrar lista de profissionais apenas para donos */}
                  {user?.tipoUsuario === 'dono' && (
                    <>
                      <div className="border-t border-gray-200 my-2" />
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-700">Profissionais ativos</span>
                        </div>
                        {membrosAtivos.length === 0 ? (
                          <p className="text-xs text-gray-500">Nenhum profissional ativo ainda.</p>
                        ) : (
                          <ul className="max-h-56 overflow-y-auto divide-y divide-gray-100">
                            {membrosAtivos.map((m) => (
                              <li key={m.id} className="py-2">
                                <div className="flex items-center gap-2">
                                  <Avatar name={m.nome || m.email} id={m.id} imageUrl={m.avatarUrl || undefined} size="sm" />
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-900 truncate">{m.nome || m.email}</p>
                                    <p className="text-[11px] text-gray-500 truncate">{m.email}</p>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-700">Profissionais convidados</span>
                          {loadingEquipeInfo && <span className="text-[11px] text-gray-400">carregando...</span>}
                        </div>
                        {convitesPendentes.length === 0 ? (
                          <p className="text-xs text-gray-500">Nenhum convite pendente.</p>
                        ) : (
                          <ul className="max-h-56 overflow-y-auto divide-y divide-gray-100">
                            {convitesPendentes.map((c) => (
                              <li key={c.id} className="py-2">
                                <div className="flex items-start gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-[11px] font-bold">{(c.nome || c.email || '?').slice(0,1).toUpperCase()}</div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-900 truncate">{c.nome || c.email}</p>
                                    <p className="text-[11px] text-gray-500 truncate">{c.email}</p>
                                  </div>
                                  <span className="px-1.5 py-0.5 text-[10px] rounded-full border border-yellow-200 bg-yellow-50 text-yellow-700">{c.status === 'EXPIRED' ? 'Expirado' : 'Pendente'}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </>
                  )}

                  {/* Mensagem para contas convidadas */}
                  {user?.tipoUsuario !== 'dono' && (
                    <>
                      <div className="border-t border-gray-200 my-2" />
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Você faz parte desta empresa como profissional convidado.
                        </p>
                        {empresa?.cidade && empresa?.estado && (
                          <div className="flex items-start gap-2 pt-1">
                            <svg className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-xs text-gray-700">{empresa.cidade} - {empresa.estado}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Dropdown>
              </div>
            )}
          </div>
        </div>
        {/* Menu Items */}
        <nav className="flex-1 px-3">
          <ul className={`${isCollapsed ? "space-y-2" : "space-y-1"}`}>
            {menuItems.map((item, index) => (
              <li key={item.label} className="relative">
                {item.hasDropdown ? (
                  <>
                    <button
                      ref={(el) => {
                        buttonRefs.current[item.label] = el;
                      }}
                      onClick={(e) => toggleMenu(item.label, e)}
                      onMouseEnter={(e) => handleMouseEnter(item.label, e)}
                      onMouseLeave={handleMouseLeave}
                      className={`w-full flex items-center ${
                        isCollapsed
                          ? "justify-center py-3 px-3"
                          : "justify-between py-2.5 px-3"
                      } text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150 group relative`}
                    >
                      <div
                        className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}
                      >
                        <span className="text-gray-500 group-hover:text-gray-700 flex items-center justify-center w-5 h-5">
                          {item.icon}
                        </span>
                        <span
                          className={`text-sm font-medium transition-all duration-300 ${
                            isCollapsed ? "hidden" : "opacity-100 blur-0"
                          } ${
                            item.label === "Gerenciamento de Profissionais"
                              ? "leading-tight"
                              : "whitespace-nowrap"
                          }`}
                          aria-hidden={isCollapsed}
                          style={
                            !isCollapsed
                              ? {
                                  filter: "blur(0px)",
                                  transition: "all 0.3s ease-in-out",
                                }
                              : undefined
                          }
                        >
                          {item.label === "Gerenciamento de Profissionais" ? (
                            <>
                              Gerenciamento
                              <br />
                              de Profissionais
                            </>
                          ) : (
                            item.label
                          )}
                        </span>
                      </div>
                      {!isCollapsed && (
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            openMenus.includes(item.label) ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </button>
                    {/* Submenu expandido (modo normal) */}
                    {openMenus.includes(item.label) &&
                      item.subItems &&
                      !isCollapsed && (
                        <ul className="mt-1 ml-8 space-y-1 animate-fade-in">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.label}>
                              <Link
                                href={subItem.href}
                                prefetch={true}
                                onClick={handleItemClick}
                                className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                                  isActive(subItem.href)
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-500 hover:text-gray-900"
                                }`}
                              >
                                <span>{subItem.label}</span>
                                {subItem.hasArrow && (
                                  <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    prefetch={true}
                    onClick={handleItemClick}
                    onMouseEnter={(e) => handleMouseEnter(item.label, e)}
                    onMouseLeave={handleMouseLeave}
                    className={`flex items-center ${
                      isCollapsed
                        ? "justify-center py-3 px-3"
                        : "justify-between py-2.5 px-3"
                    } rounded-lg transition-colors duration-150 group relative ${
                      isActive(item.href!)
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}
                    >
                      <span
                        className={`flex items-center justify-center w-5 h-5 ${
                          isActive(item.href!)
                            ? "text-gray-900"
                            : "text-gray-500 group-hover:text-gray-700"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`text-sm font-medium transition-all duration-300 ${
                          isCollapsed ? "hidden" : "opacity-100 blur-0"
                        } ${
                          item.label === "Gerenciamento de Profissionais"
                            ? "leading-tight"
                            : "whitespace-nowrap"
                        }`}
                        aria-hidden={isCollapsed}
                        style={
                          !isCollapsed
                            ? {
                                filter: "blur(0px)",
                                transition: "all 0.3s ease-in-out",
                              }
                            : undefined
                        }
                      >
                        {item.label === "Gerenciamento de Profissionais" ? (
                          <>
                            Gerenciamento
                            <br />
                            de Profissionais
                          </>
                        ) : (
                          item.label
                        )}
                      </span>
                    </div>
                    {item.badge && !isCollapsed && (
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer User Section */}
        <div className="p-4 border-t border-gray-200">
          {/* Ação: Baixar app mobile (mostra card com QR e aviso "Em breve") */}
          {!isCollapsed && (
            <Dropdown
              align="right"
              placement="right"
              trigger={
                <button
                  type="button"
                  className="group w-full mb-3 flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 16l4-5h-3V4h-2v7H8l4 5z" />
                      <path d="M20 18v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 truncate">Baixar app mobile</span>
                  </div>
                  {/* Seta animada (esquerda -> direita) */}
                  <svg className="w-4 h-4 text-gray-600 transition-transform duration-200 ease-out group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              }
            >
              {/* Card do aplicativo em desenvolvimento */}
              <div className="p-4 min-w-[280px] max-w-sm">
                <div className="flex items-start gap-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z" />
                    <path d="M11 4h2" />
                    <path d="M12 17v.01" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Aplicativo mobile</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">Estamos desenvolvendo nosso aplicativo para iOS e Android.</p>
                  </div>
                </div>
                <div className="relative mx-auto w-40 h-40 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 mb-3">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR code (em breve)" className="w-full h-full object-contain blur-[2px] opacity-90" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm">Em breve</span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-gray-600">
                  O aplicativo está em desenvolvimento. Assim que estiver pronto, você poderá instalar escaneando o QR code e aproveitar a experiência completa no celular.
                </p>
              </div>
            </Dropdown>
          )}
          {user ? (
            <Dropdown
              align="right"
              placement="right"
              trigger={
                <button
                  type="button"
                  className={`w-full ${isCollapsed ? "flex items-center justify-center" : ""} hover:opacity-90 transition-opacity`}
                >
                  <div
                    className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
                  >
                    <div className="relative">
                      <Avatar
                        name={user.nome}
                        id={user.id}
                        imageUrl={user.avatarUrl}
                        size="md"
                      />
                      {user.tipoUsuario === "dono" && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 p-0.5 rounded-full shadow-md border border-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="min-w-0 text-left flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.nome}
                          </p>
                          {user.tipoUsuario === "dono" ? (
                            <span className="px-1.5 py-0.5 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 text-[9px] font-bold rounded-full border border-yellow-300 whitespace-nowrap">
                              DONO
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-[9px] font-bold rounded-full border border-blue-300 whitespace-nowrap">
                              PRO
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              }
            >
              <div className="px-4 py-3 border-b border-gray-200">
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

              {user.isAdmin && (
                <button
                  onClick={onToggleAdminMode}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    adminMode
                      ? "bg-[#C5837B] text-white hover:bg-[#B0736B]"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {adminMode ? "Voltar ao Painel" : "Painel Administrativo"}
                </button>
              )}

              <Link
                href="/perfil"
                prefetch={true}
                onClick={handleItemClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
              >
                Sair
              </button>
            </Dropdown>
          ) : (
            <div
              className={`flex ${isCollapsed ? "justify-center" : "items-center gap-3"}`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              {!isCollapsed && (
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-36 bg-gray-200 rounded" />
                </div>
              )}
            </div>
          )}
        </div>
        {/* Área clicável na borda direita para colapsar/expandir */}
        {onToggle && (
          <div
            onClick={onToggle}
            className="hidden md:block absolute right-0 top-0 bottom-0 w-3 cursor-pointer z-50"
            title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          />
        )}
      </aside>

      {/* Tooltip card no hover quando colapsado */}
      {isCollapsed && hoveredMenu && !activeSubmenu && hoveredPosition && (
        <div
          className="fixed bg-white border border-gray-300 rounded-2xl shadow-[3px_3px_0px_#e5e7eb] z-50 min-w-[160px] animate-fade-in overflow-hidden"
          style={{
            top: `${hoveredPosition.top}px`,
            left: `${hoveredPosition.left}px`,
          }}
        >
          {/* Efeito de brilho (igual ao modal) */}
          <span className="absolute top-0 left-0 w-12 h-12 bg-[#C5837B] rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none" />
          <span className="absolute bottom-0 right-0 w-12 h-12 bg-[#C5837B] rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none" />

          {/* Conteúdo */}
          <div className="relative z-10 px-4 py-2.5">
            <span className="text-sm font-medium text-gray-800">
              {hoveredMenu}
            </span>
          </div>
          {/* Setinha apontando para o ícone */}
          <div
            className="absolute right-full top-1/2 -translate-y-1/2"
            style={{
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderRight: "6px solid #c9cccf",
            }}
          />
          <div
            className="absolute right-full top-1/2 -translate-y-1/2 translate-x-[1px]"
            style={{
              width: 0,
              height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderRight: "5px solid white",
            }}
          />
        </div>
      )}

      {/* Card popup de submenu quando colapsado e clicado */}
      {isCollapsed && activeSubmenu && submenuPosition && (
        <div
          className="fixed bg-white border border-gray-300 rounded-2xl shadow-[3px_3px_0px_#e5e7eb] z-50 min-w-[200px] animate-fade-in overflow-hidden"
          style={{
            top: `${submenuPosition.top}px`,
            left: `${submenuPosition.left}px`,
          }}
          onMouseLeave={closeSubmenu}
        >
          {/* Efeito de brilho (igual ao modal) */}
          <span className="absolute top-0 left-0 w-12 h-12 bg-[#C5837B] rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none" />
          <span className="absolute bottom-0 right-0 w-12 h-12 bg-[#C5837B] rounded-full blur-2xl opacity-20 animate-pulse pointer-events-none" />

          {/* Conteúdo */}
          <div className="relative z-10 p-2">
            <div className="px-3 py-2 border-b border-gray-200 mb-1">
              <span className="text-sm font-semibold text-gray-800">
                {activeSubmenu.label}
              </span>
            </div>
            <ul className="space-y-1">
              {activeSubmenu.subItems?.map((subItem) => (
                <li key={subItem.label}>
                  <Link
                    href={subItem.href}
                    prefetch={true}
                    onClick={() => {
                      closeSubmenu();
                      handleItemClick();
                    }}
                    className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                      isActive(subItem.href)
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span>{subItem.label}</span>
                    {subItem.hasArrow && (
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Setinha apontando para o ícone */}
          <div
            className="absolute right-full top-4"
            style={{
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderRight: "6px solid #c9cccf",
            }}
          />
          <div
            className="absolute right-full top-4 translate-x-[1px]"
            style={{
              width: 0,
              height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderRight: "5px solid white",
            }}
          />
        </div>
      )}
    </>
  );
}
