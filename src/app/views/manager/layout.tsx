"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import UniversalLoader from "@/components/UniversalLoader";

// Lazy load componentes pesados
const Sidebar = dynamic(() => import("./components/Sidebar"), {
  ssr: false,
  loading: () => (
    <div className="hidden md:block w-64 bg-white border-r border-gray-200">
      <div className="p-6">
        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  ),
});

const Modal = dynamic(() => import("@/components/Modal"), {
  ssr: false,
});

const CompanyDetailsStepper = dynamic(
  () => import("@/components/CompanyDetailsStepper"),
  {
    ssr: false,
  },
);

const Button = dynamic(() => import("@/components/visual/Button"), {
  ssr: false,
});

const CardIcon = dynamic(() => import("@/components/visual/CardIcon"), {
  ssr: false,
});

const WelcomeModal = dynamic(() => import("./components/WelcomeModal"), {
  ssr: false,
});

interface User {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: "dono" | "usuario";
  isAdmin?: boolean;
}

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isAuthenticated, isDono } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [startCompanySetup, setStartCompanySetup] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [planName, setPlanName] = useState<string | undefined>();

  // Carrega o estado do sidebar do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setSidebarCollapsed(savedState === "true");
    }
  }, []);

  // Verificar se deve mostrar modal de boas-vindas e buscar plano
  useEffect(() => {
    const planActivated = searchParams?.get("planActivated");
    if (planActivated === "true") {
      // Buscar assinatura do usuário para pegar o nome do plano
      fetch("/api/subscriptions/me", { credentials: "include" })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Erro ao buscar assinatura");
        })
        .then((data) => {
          if (data?.subscription?.plan?.name) {
            setPlanName(data.subscription.plan.name);
          }
          setShowWelcome(true);
        })
        .catch((error) => {
          console.error("Erro ao buscar plano:", error);
          // Mostrar modal mesmo sem o nome do plano
          setShowWelcome(true);
        });

      // Limpar parâmetro da URL
      const url = new URL(window.location.href);
      url.searchParams.delete("planActivated");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  // Salva o estado do sidebar no localStorage quando muda
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Verificar autorização e onboarding
  useEffect(() => {
    if (authLoading) return;

    // Se não está autenticado, redireciona para login
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Se não é dono, redireciona para home
    if (!isDono) {
      router.push("/views/home");
      return;
    }

    // Verificar onboarding em background de forma não bloqueante
    checkOnboardingStatusAsync();
  }, [authLoading, isAuthenticated, isDono, router]);

  // Verificação de onboarding assíncrona que não bloqueia renderização
  const checkOnboardingStatusAsync = () => {
    if (checkingOnboarding) return;

    setCheckingOnboarding(true);

    // Usar fetch sem await para não bloquear
    fetch("/api/onboarding/status", {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Erro ao verificar onboarding");
      })
      .then((data) => {
        if (data.needsOnboarding) {
          setShowOnboarding(true);
          setStartCompanySetup(true);
        }
      })
      .catch((error) => {
        console.error("Erro ao verificar onboarding:", error);
      })
      .finally(() => {
        setCheckingOnboarding(false);
      });
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Recarrega a página para atualizar tudo
    window.location.reload();
  };

  // Mostrar loader apenas no carregamento inicial de autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <UniversalLoader size="xl" text="Carregando..." />
      </div>
    );
  }

  // Se não está autenticado ou não é dono, não renderizar nada (redirecionamento acontece no useEffect)
  if (!isAuthenticated || !isDono) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        adminMode={adminMode}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        user={user}
        onToggleAdminMode={() => setAdminMode(!adminMode)}
      />

      {/* Mobile: botão para abrir sidebar */}
      <button
        type="button"
        aria-label="Abrir menu"
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed z-40 top-4 left-4 inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0 px-4 md:px-6">
          {children}
        </main>
      </div>

      {/* Pré-modal: solicitar completar cadastro da empresa (modal normal) */}
      {showOnboarding && (
        <Modal
          isOpen={showOnboarding && !startCompanySetup}
          onClose={() => {}}
          title="Complete o cadastro da empresa"
          variant="center"
          dismissible={false}
          maxWidth="md"
        >
          <div className="p-6">
            <div className="flex gap-4">
              <div className="hidden sm:flex items-start">
                <div className="h-16 flex items-center">
                  <CardIcon size="md" />
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-[#B0736B] bg-[#C5837B]/10 px-2.5 py-1 rounded-full">
                  Leva ~2–3 min
                </div>
                <p className="mt-3 text-sm text-gray-700">
                  Olá{user?.nome ? `, ${user.nome.split(" ")[0]}` : ""}! Para
                  habilitar todos os recursos, precisamos completar o cadastro
                  da sua empresa. É rápido e você pode ajustar depois.
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CardIcon size="sm" color="#10b981" icon="check" />
                    Nome da empresa
                  </div>
                  <div className="flex items-center gap-2">
                    <CardIcon size="sm" color="#10b981" icon="check" />
                    Contato
                  </div>
                  <div className="flex items-center gap-2">
                    <CardIcon size="sm" color="#10b981" icon="check" />
                    Serviços
                  </div>
                  <div className="flex items-center gap-2">
                    <CardIcon size="sm" color="#10b981" icon="check" />
                    Horários de funcionamento
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => setStartCompanySetup(true)}
                    variant="primary"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Onboarding: modal fullscreen com stepper */}
      {showOnboarding && startCompanySetup && (
        <Modal
          isOpen={showOnboarding && startCompanySetup}
          onClose={() => {}}
          title=""
          variant="fullscreen"
          hideHeader
          dismissible={false}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full max-w-3xl">
              <CompanyDetailsStepper onComplete={handleOnboardingComplete} />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de boas-vindas após ativação do plano */}
      {showWelcome && user && (
        <WelcomeModal
          userName={user.nome || "Usuário"}
          planName={planName}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
}
