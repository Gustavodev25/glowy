"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  nome: string;
  email: string;
  tipoUsuario?: "dono" | "usuario";
  empresa?: {
    id: string;
    nomeEmpresa: string;
    logoUrl?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isDono: boolean;
  isUsuario: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache em memória para evitar chamadas repetidas
let authCache: { user: User | null; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 segundos

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const checkAuthPromiseRef = useRef<Promise<void> | null>(null);

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    // Se já existe uma verificação em andamento, esperar por ela
    if (checkAuthPromiseRef.current) {
      return checkAuthPromiseRef.current;
    }

    // Verificar cache primeiro
    const now = Date.now();
    if (authCache && (now - authCache.timestamp) < CACHE_DURATION) {
      console.log("AuthContext: Usando cache");
      setUser(authCache.user);
      setLoading(false);
      return;
    }

    // Criar promise de verificação
    const promise = (async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("AuthContext: Usuário autenticado encontrado:", data.user);
          setUser(data.user);
          // Atualizar cache
          authCache = { user: data.user, timestamp: Date.now() };
        } else {
          console.log("AuthContext: Usuário não autenticado");
          setUser(null);
          authCache = { user: null, timestamp: Date.now() };
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setUser(null);
        authCache = null;
      } finally {
        setLoading(false);
        checkAuthPromiseRef.current = null;
      }
    })();

    checkAuthPromiseRef.current = promise;
    return promise;
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao fazer login");
    }

    const data = await response.json();
    setUser(data.user);

    // Não redirecionar automaticamente - deixar o componente decidir
    console.log("AuthContext: Login realizado com sucesso, usuário:", data.user);
    // router.push("/views/home");
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setUser(null);
      // Limpar cache ao fazer logout
      authCache = null;
      router.push("/login");
    }
  };

  const refreshUser = useCallback(async () => {
    // Forçar atualização limpando cache
    authCache = null;
    await checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = React.useMemo(() => ({
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isDono: user?.tipoUsuario === "dono",
    isUsuario: user?.tipoUsuario === "usuario",
  }), [user, loading, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
