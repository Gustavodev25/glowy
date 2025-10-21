"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../manager/components/Sidebar";
import UniversalLoader from "@/components/UniversalLoader";

interface User {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: "dono" | "usuario";
  isAdmin?: boolean;
}
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Carrega o estado do sidebar do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setSidebarCollapsed(savedState === "true");
    }
  }, []);

  // Salva o estado do sidebar no localStorage quando muda
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        // Verifica se o usuário é admin
        if (!data.user.isAdmin) {
          router.push("/views/home");
          return;
        }

        setUser(data.user);
        setAuthorized(true);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <UniversalLoader size="xl" text="Carregando..." />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar em modo admin */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        adminMode={true}
        user={user}
        onToggleAdminMode={() => router.push("/views/manager")}
      />

      {/* Toggle Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="fixed z-50 bg-white rounded-full w-8 h-8 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 border border-gray-100"
        style={{
          left: sidebarCollapsed ? "76px" : "252px",
          top: "32px",
          transform: "translateY(-50%)",
        }}
        aria-label={sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
      >
        <svg
          className={`w-4 h-4 text-gray-700 transition-transform duration-300 ${
            sidebarCollapsed ? "" : "rotate-180"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
