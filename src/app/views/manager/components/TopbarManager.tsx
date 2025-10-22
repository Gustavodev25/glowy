"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Dropdown from "@/components/Dropdown";

interface User {
  id: string;
  nome: string;
  email: string;
  tipoUsuario?: "dono" | "usuario";
  isAdmin?: boolean;
  avatarUrl?: string;
}

interface TopbarManagerProps {
  user: User | null;
  adminMode: boolean;
  onToggleAdminMode: () => void;
  onOpenSidebarMobile?: () => void;
}

export default function TopbarManager({
  user,
  adminMode,
  onToggleAdminMode,
  onOpenSidebarMobile,
}: TopbarManagerProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const getInitials = (nome: string) => {
    const names = nome.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  const renderAvatar = (user: User, className: string = "w-10 h-10") => {
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
  };

  // Função para gerar breadcrumb baseado na rota atual
  const generateBreadcrumb = () => {
    if (!pathname) return [];

    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbItems = [];

    // Sempre começar com Dashboard
    breadcrumbItems.push({
      label: "Dashboard",
      href: "/views/manager",
      isActive: pathname === "/views/manager",
    });

    // Adicionar outros segmentos baseados na rota
    if (segments.length > 2) {
      const currentSegment = segments[segments.length - 1];

      switch (currentSegment) {
        case "usuarios":
          breadcrumbItems.push({
            label: "Usuários",
            href: "/views/manager/usuarios",
            isActive: true,
          });
          break;
        case "clientes":
          breadcrumbItems.push({
            label: "Clientes",
            href: "/views/manager/clientes",
            isActive: true,
          });
          break;
        case "profissionais":
          breadcrumbItems.push({
            label: "Profissionais",
            href: "/views/manager/profissionais",
            isActive: true,
          });
          break;
        default:
          breadcrumbItems.push({
            label:
              currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1),
            href: pathname,
            isActive: true,
          });
      }
    }

    return breadcrumbItems;
  };

  const breadcrumbItems = generateBreadcrumb();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between">
        {/* Left: Mobile menu + breadcrumb */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile hamburger to open sidebar */}
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={onOpenSidebarMobile}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2">
          {breadcrumbItems.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-gray-400 mx-2"
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
              {item.isActive ? (
                <span className="text-sm font-medium text-gray-900">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          </nav>
        </div>

        {/* User Dropdown */}
        <div className="flex items-center gap-4">
          {user ? (
            <Dropdown
              trigger={
                <button className="hover:opacity-80 transition-opacity duration-200">
                  {renderAvatar(user)}
                </button>
              }
              align="right"
            >
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">{user.nome}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              {/* Botão Painel Administrativo - apenas se for admin */}
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
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          )}
        </div>
      </div>
    </header>
  );
}
