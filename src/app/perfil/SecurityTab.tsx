"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/visual/Button";
import Input from "@/components/visual/Input";
import Select from "@/components/visual/Select";
import { useToast } from "@/contexts/ToastContext";

// --- Início dos Componentes e Funções de Placeholder ---


// Constante de placeholder para SECURITY_QUESTIONS
const SECURITY_QUESTIONS = [
  { value: "nome_mae", label: "Qual o nome de solteira da sua mãe?" },
  { value: "nome_animal", label: "Qual o nome do seu primeiro animal de estimação?" },
  { value: "cidade_nascimento", label: "Em qual cidade você nasceu?" },
  { value: "personalizada", label: "Pergunta personalizada" },
];


// Componente de placeholder para OtpInput
const OtpInput = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    maxLength={6}
    className="w-full px-3 py-2 text-center tracking-[1em] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="------"
  />
);


// Componente de Skeleton para os cards
const SecurityCardSkeleton = () => (
  <div className="relative">
    <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
    <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-3"></div>
            <div className="h-2 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>
        </div>
        <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);






// --- Fim dos Componentes e Funções de Placeholder ---


interface SecurityInfo {
  securityLevel: number;
  level: "baixo" | "medio" | "alto";
  factors: Array<{ name: string; status: string }>;
  lastPasswordChange: string | null;
  twoFactorEnabled: boolean;
  recoveryEmail: string | null;
  recoveryEmailVerified: boolean;
  securityQuestionsCount: number;
  activeSessions: number;
}

interface Session {
  id: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  ip: string | null;
  location: string | null;
  lastActivity: string;
  createdAt: string;
}

interface LoginHistory {
  id: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  ip: string | null;
  location: string | null;
  success: boolean;
  failureReason: string | null;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  ip: string | null;
  device: string | null;
  createdAt: string;
}

interface SecurityQuestion {
  id: string;
  question: string;
  createdAt: string;
}

export default function SecurityTab() {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [securityQuestions, setSecurityQuestions] = useState<
    SecurityQuestion[]
  >([]);

  // 2FA states
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FAMethodModal, setShow2FAMethodModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showWhats2FAModal, setShowWhats2FAModal] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [twoFASecret, setTwoFASecret] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAStep, setTwoFAStep] = useState<"qr" | "code">("qr");
  const [enabling, setEnabling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  // WhatsApp 2FA states
  const [whatsStep, setWhatsStep] = useState<"phone" | "code">("phone");
  const [whatsPhone, setWhatsPhone] = useState("");
  const [whatsCode, setWhatsCode] = useState("");
  const [sendingWhats, setSendingWhats] = useState(false);
  const [verifyingWhats, setVerifyingWhats] = useState(false);
  const [countryCode, setCountryCode] = useState("+55");
  const [resendTimer, setResendTimer] = useState(0);
  const [disabling, setDisabling] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  // Recovery Email states
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Security Question states
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  useEffect(() => {
    loadSecurityData();
  }, []);

  // Timer para reenvio de código WhatsApp
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const loadSecurityData = async () => {
    try {
      const [infoRes, sessionsRes, historyRes, logsRes, questionsRes] =
        await Promise.all([
          fetch("/api/security/info", { credentials: "include" }),
          fetch("/api/security/sessions", { credentials: "include" }),
          fetch("/api/security/login-history?limit=10", {
            credentials: "include",
          }),
          fetch("/api/security/activity-logs?limit=20", {
            credentials: "include",
          }),
          fetch("/api/security/questions", { credentials: "include" }),
        ]);

      if (infoRes.ok) {
        const data = await infoRes.json();
        setSecurityInfo(data);
        setTwoFAEnabled(data.twoFactorEnabled);
        setRecoveryEmail(data.recoveryEmail || "");
      }

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data.sessions);
      }

      if (historyRes.ok) {
        const data = await historyRes.json();
        setLoginHistory(data.loginHistory);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setActivityLogs(data.activityLogs);
      }

      if (questionsRes.ok) {
        const data = await questionsRes.json();
        setSecurityQuestions(data.questions);
      }
    } catch (error) {
      console.error("Erro ao carregar dados de segurança:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWhats2FA = () => {
    setShowWhats2FAModal(true);
    setWhatsStep("phone");
    setWhatsPhone("");
    setWhatsCode("");
    setCountryCode("+55");
    setResendTimer(0);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Formata: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleSendWhatsStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsPhone) {
      showError("Telefone obrigatório", "Informe seu número de WhatsApp");
      return;
    }
    setSendingWhats(true);
    try {
      // Remove formatação e monta o número completo com código do país
      const cleanPhone = whatsPhone.replace(/\D/g, "");
      const fullPhone = `${countryCode}${cleanPhone}`;

      const res = await fetch("/api/2fa/whatsapp/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar código");
      success("Código enviado", "Enviamos um código via WhatsApp.");
      setWhatsStep("code");
      setResendTimer(60); // Inicia contagem regressiva de 60 segundos
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar código";
      showError("Erro", msg);
    } finally {
      setSendingWhats(false);
    }
  };

  const handleVerifyWhats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsCode || whatsCode.trim().length < 6) {
      showError("Código obrigatório", "Informe o código recebido no WhatsApp");
      return;
    }
    setVerifyingWhats(true);
    try {
      const res = await fetch("/api/2fa/whatsapp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: whatsCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Código inválido");
      setTwoFAEnabled(true);
      setShowWhats2FAModal(false);
      setWhatsPhone("");
      setWhatsCode("");
      success(
        "2FA habilitado!",
        "Agora enviaremos o código via WhatsApp no login.",
      );
      loadSecurityData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao verificar 2FA";
      showError("Erro", msg);
    } finally {
      setVerifyingWhats(false);
    }
  };

  const handleStart2FA = () => {
    setShow2FAMethodModal(true);
  };

  const handleSelect2FAMethod = (method: "totp" | "whatsapp") => {
    setShow2FAMethodModal(false);
    if (method === "totp") {
      handleStartTOTP2FA();
    } else {
      handleStartWhats2FA();
    }
  };

  const handleStartTOTP2FA = async () => {
    setShow2FAModal(true);
    setEnabling(true);
    try {
      const res = await fetch("/api/2fa/setup", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao iniciar 2FA");
      setQrDataUrl(data.qrCodeDataUrl);
      setTwoFASecret(data.secret);
      setTwoFAStep("qr");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao iniciar 2FA";
      showError("Erro", msg);
    } finally {
      setEnabling(false);
    }
  };

  const handleVerify2FASetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFACode || twoFACode.trim().length < 6) {
      showError("Código obrigatório", "Informe o código do autenticador");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: twoFACode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Código inválido");
      setTwoFAEnabled(true);
      setQrDataUrl(null);
      setTwoFASecret(null);
      setTwoFACode("");
      setShow2FAModal(false);
      success("2FA habilitado!", "Seu login agora exigirá o código do app.");
      loadSecurityData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao verificar 2FA";
      showError("Erro", msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      showError("Senha obrigatória", "Informe sua senha atual");
      return;
    }
    setDisabling(true);
    try {
      const res = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ senha: disablePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao desabilitar 2FA");
      setTwoFAEnabled(false);
      setDisablePassword("");
      setShowDisable2FAModal(false);
      success("2FA desabilitado", "Você pode reativar quando quiser.");
      loadSecurityData();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao desabilitar 2FA";
      showError("Erro", msg);
    } finally {
      setDisabling(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const res = await fetch("/api/security/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        success("Sessão encerrada", "A sessão foi encerrada com sucesso.");
        loadSecurityData();
      }
    } catch (error) {
      showError("Erro", "Erro ao encerrar sessão");
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      const res = await fetch("/api/security/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ allExceptCurrent: true }),
      });
      if (res.ok) {
        success(
          "Sessões encerradas",
          "Todas as outras sessões foram encerradas.",
        );
        loadSecurityData();
      }
    } catch (error) {
      showError("Erro", "Erro ao encerrar sessões");
    }
  };

  const handleSaveRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/security/recovery-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recoveryEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      success("Email salvo", data.message);
      setShowRecoveryModal(false);
      loadSecurityData();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao salvar email";
      showError("Erro", msg);
    }
  };

  const handleAddSecurityQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/security/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: newQuestion, answer: newAnswer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      success(
        "Pergunta adicionada",
        "Pergunta de segurança adicionada com sucesso.",
      );
      setShowQuestionModal(false);
      setNewQuestion("");
      setNewAnswer("");
      loadSecurityData();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao adicionar pergunta";
      showError("Erro", msg);
    }
  };

  const handleDeleteSecurityQuestion = async (questionId: string) => {
    try {
      const res = await fetch("/api/security/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ questionId }),
      });
      if (res.ok) {
        success(
          "Pergunta removida",
          "Pergunta de segurança removida com sucesso.",
        );
        loadSecurityData();
      }
    } catch (error) {
      showError("Erro", "Erro ao remover pergunta");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      showError("Erro", "As senhas não coincidem");
      return;
    }

    if (novaSenha.length < 6) {
      showError("Erro", "A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    // Verificar se há perguntas de segurança cadastradas
    if (securityQuestions.length === 0) {
      showError(
        "Atenção",
        "Por favor, cadastre pelo menos uma Pergunta de Segurança antes de alterar sua senha. Isso é importante para recuperação de conta.",
      );
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          senhaAtual,
          novaSenha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao alterar senha");
      }

      success("Senha alterada!", "Sua senha foi alterada com sucesso.");
      setShowPasswordModal(false);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      loadSecurityData();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao alterar senha";
      showError("Erro", msg);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const getPasswordStrength = () => {
    // Implementação básica - pode ser melhorada
    if (!securityInfo?.lastPasswordChange) return 0;
    const daysSinceChange = Math.floor(
      (Date.now() - new Date(securityInfo.lastPasswordChange).getTime()) /
      (1000 * 60 * 60 * 24),
    );
    if (daysSinceChange < 30) return 100;
    if (daysSinceChange < 60) return 75;
    if (daysSinceChange < 90) return 50;
    return 25;
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-6">
        <SecurityCardSkeleton />
        <SecurityCardSkeleton />
        <SecurityCardSkeleton />
        <SecurityCardSkeleton />
        <SecurityCardSkeleton />
        <SecurityCardSkeleton />
      </div>
    );
  }

  const renderContent = () => (
    <div className="flex flex-col space-y-6">
      {/* Nível de Segurança */}
      {securityInfo && (
        <div className="relative">
          <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
          {/* Card principal */}
          <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <svg
                  className="w-5 h-5 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Nível de Segurança
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Status: {securityInfo.level === "alto" ? "Alto" : securityInfo.level === "medio" ? "Médio" : "Baixo"}
                  </p>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1.5">
                      Nível atual:
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${securityInfo.securityLevel >= 75
                            ? "bg-green-500"
                            : securityInfo.securityLevel >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                            }`}
                          style={{ width: `${securityInfo.securityLevel}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {securityInfo.securityLevel}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${securityInfo.securityLevel >= 75
                  ? "bg-green-100 text-green-700"
                  : securityInfo.securityLevel >= 50
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {securityInfo.securityLevel >= 75 ? "Excelente" : securityInfo.securityLevel >= 50 ? "Bom" : "Precisa melhorar"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Card */}
      <div className="relative">
        <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
        {/* Card principal */}
        <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <svg
                className="w-5 h-5 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Alterar Senha
                </h3>
                {securityInfo?.lastPasswordChange && (
                  <p className="text-sm text-gray-600 mt-1">
                    Última alteração:{" "}
                    {formatDate(securityInfo.lastPasswordChange)}
                  </p>
                )}
                {securityInfo?.lastPasswordChange && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1.5">
                      Força da senha atual:
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${getPasswordStrength() >= 75
                            ? "bg-green-500"
                            : getPasswordStrength() >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                            }`}
                          style={{ width: `${getPasswordStrength()}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {getPasswordStrength()}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={() => setShowPasswordModal(true)}
              variant="primary"
              className="flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Alterar Senha
            </Button>
          </div>
        </div>
      </div>

      {/* 2FA - Card Melhorado */}
      <div className="relative">
        {/* Borda de trás estática */}
        <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
        {/* Card principal */}
        <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Autenticação em Duas Etapas (2FA)
                </h3>
                <p className="text-sm text-gray-600">
                  Adicione uma camada extra de seguranca a sua conta
                </p>
              </div>
            </div>
            <div
              className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${twoFAEnabled
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
                }`}
            >
              {twoFAEnabled ? "Ativado" : "Desativado"}
            </div>
          </div>

          {!twoFAEnabled ? (
            <div className="mt-4">
              <p className="text-sm text-gray-700 mb-4">
                O 2FA adiciona uma segunda camada de protecao, exigindo um codigo
                gerado por um aplicativo autenticador ou enviado por WhatsApp alem
                da sua senha.
              </p>
              <Button
                onClick={handleStart2FA}
                disabled={enabling}
                isLoading={enabling}
                variant="primary"
                className="flex items-center gap-2 justify-center"
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Ativar 2FA
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-700 mb-4">
                Autenticacao em duas etapas esta ativa. Sua conta esta protegida
                com uma camada extra de seguranca.
              </p>
              <Button
                onClick={() => setShowDisable2FAModal(true)}
                variant="outline"
                size="sm"
              >
                Desativar 2FA
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Email de Recuperação */}
      <div className="relative">
        {/* Borda de tras estatica */}
        <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
        {/* Card principal */}
        <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Email de Recuperação
          </h3>
          <div className="space-y-3">
            {securityInfo?.recoveryEmail ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-700">
                    {securityInfo.recoveryEmail}
                  </p>
                  <p
                    className={`text-xs mt-1 ${securityInfo.recoveryEmailVerified
                      ? "text-green-600"
                      : "text-yellow-600"
                      }`}
                  >
                    {securityInfo.recoveryEmailVerified
                      ? "✓ Verificado"
                      : "⚠️ Não verificado"}
                  </p>
                </div>
                <Button
                  onClick={() => setShowRecoveryModal(true)}
                  variant="ghost"
                  size="sm"
                >
                  Alterar
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowRecoveryModal(true)}
                variant="primary"
                size="sm"
              >
                Configurar Email de Recuperação
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Perguntas de Segurança */}
      <div className="relative">
        {/* Borda de trás estática */}
        <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
        {/* Card principal */}
        <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Perguntas de Segurança
            </h3>
            <span className="text-sm text-gray-500">
              {securityQuestions.length}/3
            </span>
          </div>
          <div className="space-y-3">
            {securityQuestions.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <p className="text-sm text-gray-700">{q.question}</p>
                <Button
                  onClick={() => handleDeleteSecurityQuestion(q.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Remover
                </Button>
              </div>
            ))}
            {securityQuestions.length < 3 && (
              <Button
                onClick={() => setShowQuestionModal(true)}
                variant="outline"
                fullWidth
                className="border-dashed"
              >
                + Adicionar Pergunta
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sessões Ativas */}
      <div className="relative">
        {/* Borda de trás estática */}
        <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
        {/* Card principal */}
        <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Sessões Ativas
            </h3>
            {sessions.length > 1 && (
              <Button
                onClick={handleTerminateAllSessions}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Encerrar todas as outras
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma sessão ativa</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {session.device || "Dispositivo desconhecido"} •{" "}
                        {session.browser || "Navegador desconhecido"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {session.ip || "IP desconhecido"} •{" "}
                        {session.location || "Localização desconhecida"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Última atividade: {formatDate(session.lastActivity)}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleTerminateSession(session.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 ml-4"
                    >
                      Encerrar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Histórico de Login */}
      <div className="relative">
        {/* Borda de trás estática */}
        <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
        {/* Card principal */}
        <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Histórico de Login
          </h3>
          <div className="space-y-2">
            {loginHistory.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum histórico de login</p>
            ) : (
              loginHistory.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg ${log.success ? "bg-gray-50" : "bg-red-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${log.success ? "text-gray-900" : "text-red-900"
                          }`}
                      >
                        {log.success
                          ? "✓ Login bem-sucedido"
                          : "✗ Tentativa de login falhada"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {log.device || "Dispositivo desconhecido"} •{" "}
                        {log.browser || "Navegador desconhecido"} •{" "}
                        {log.ip || "IP desconhecido"}
                      </p>
                      {!log.success && log.failureReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Motivo: {log.failureReason}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 ml-4">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="relative">
        {/* Borda de trás estática */}
        <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
        {/* Card principal */}
        <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Atividades Recentes
          </h3>
          <div className="space-y-2">
            {activityLogs.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {log.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(log.createdAt)} • {log.ip || "IP desconhecido"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      <Modal
        isOpen={show2FAMethodModal}
        onClose={() => setShow2FAMethodModal(false)}
        title="Escolher Método de 2FA"
        maxWidth="md"
      >
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-700 text-left">
            Escolha como você gostaria de receber o código de verificação:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Aplicativo Autenticador */}
            <button
              onClick={() => handleSelect2FAMethod("totp")}
              className="p-6 border border-gray-200 rounded-lg hover:border-[#C5837B] hover:bg-gray-50 transition text-left"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">
                  Aplicativo Autenticador
                </h3>
                <p className="text-sm text-gray-600">
                  Use apps como Google Authenticator, Authy ou Microsoft
                  Authenticator
                </p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-600">✓</span>
                    <span>Mais seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-600">✓</span>
                    <span>Funciona offline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-600">✓</span>
                    <span>Códigos temporários</span>
                  </div>
                </div>
              </div>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => handleSelect2FAMethod("whatsapp")}
              className="p-6 border border-gray-200 rounded-lg hover:border-[#C5837B] hover:bg-gray-50 transition text-left"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                <p className="text-sm text-gray-600">
                  Receba códigos de verificação via mensagem no WhatsApp
                </p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-600">✓</span>
                    <span>Mais conveniente</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-600">✓</span>
                    <span>Não precisa instalar app</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-600">✓</span>
                    <span>Funciona em qualquer celular</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center">
            <Button
              onClick={() => setShow2FAMethodModal(false)}
              variant="ghost"
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={show2FAModal}
        onClose={() => {
          setShow2FAModal(false);
          setQrDataUrl(null);
          setTwoFASecret(null);
          setTwoFACode("");
          setTwoFAStep("qr");
        }}
        title="Ativar 2FA - Aplicativo Autenticador"
        maxWidth="md"
      >
        <div className="p-6 space-y-4">
          {!qrDataUrl ? (
            <div className="text-center text-gray-600">
              {enabling ? "Gerando QR code..." : "Iniciando configuração..."}
            </div>
          ) : twoFAStep === "qr" ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                1. Escaneie este QR no seu aplicativo autenticador.
              </p>
              <div className="flex items-center justify-center">
                <img src={qrDataUrl || ""} alt="QR 2FA" className="w-56 h-56" />
              </div>
              {twoFASecret && (
                <p className="text-xs text-gray-500 text-center">
                  Chave manual (se precisar): {twoFASecret}
                </p>
              )}
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={() => setTwoFAStep("code")}
                  variant="primary"
                >
                  Já escaneei
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerify2FASetup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Digite o código de 6 dígitos
                </label>
                <OtpInput value={twoFACode} onChange={setTwoFACode} />
              </div>
              <Button
                type="submit"
                disabled={
                  verifying || (twoFACode?.replace(/\D/g, "").length ?? 0) < 6
                }
                isLoading={verifying}
                variant="primary"
                fullWidth
              >
                Verificar e Ativar
              </Button>
            </form>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        title="Email de Recuperação"
        maxWidth="md"
      >
        <form onSubmit={handleSaveRecoveryEmail} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email alternativo
            </label>
            <Input
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
          >
            Salvar Email
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          setNewQuestion("");
          setNewAnswer("");
          setSelectedQuestion("");
          setCustomQuestion("");
        }}
        title="Adicionar Pergunta de Segurança"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSecurityQuestion} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pergunta
            </label>
            <Select
              value={selectedQuestion}
              onChange={(val) => {
                setSelectedQuestion(val);
                if (val && val !== "personalizada") {
                  const opt = SECURITY_QUESTIONS.find((q) => q.value === val);
                  setNewQuestion(opt?.label || "");
                } else {
                  setNewQuestion("");
                }
              }}
              placeholder="Selecione uma pergunta"
              options={SECURITY_QUESTIONS}
              required
            />
            {selectedQuestion === "personalizada" && (
              <Input
                type="text"
                value={customQuestion}
                onChange={(e) => {
                  setCustomQuestion(e.target.value);
                  setNewQuestion(e.target.value);
                }}
                placeholder="Digite sua pergunta personalizada"
                required
                className="mt-2"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resposta
            </label>
            <Input
              type="text"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Digite sua resposta"
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
          >
            Adicionar Pergunta
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={showDisable2FAModal}
        onClose={() => {
          setShowDisable2FAModal(false);
          setDisablePassword("");
        }}
        title="Desativar Autenticação em Duas Etapas"
        maxWidth="md"
      >
        <form onSubmit={handleDisable2FA} className="p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Atenção</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Ao desativar o 2FA, sua conta ficará menos segura. Para
                  confirmar esta ação, digite sua senha atual.
                </p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha Atual *
            </label>
            <Input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              placeholder="Digite sua senha atual"
              required
            />
          </div>
          <div className="pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={disabling}
              isLoading={disabling}
              variant="outline"
              fullWidth
              size="sm"
            >
              Desativar 2FA
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showWhats2FAModal}
        onClose={() => {
          setShowWhats2FAModal(false);
          setWhatsStep("phone");
          setWhatsPhone("");
          setWhatsCode("");
          setCountryCode("+55");
          setResendTimer(0);
        }}
        title="Ativar 2FA por WhatsApp"
        maxWidth="md"
      >
        <div className="p-6 space-y-4">
          {whatsStep === "phone" ? (
            <form onSubmit={handleSendWhatsStart} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu WhatsApp
                </label>
                <div className="flex gap-2 items-center">
                  <div className="w-28 flex-shrink-0">
                    <Select
                      value={countryCode}
                      onChange={(val) => setCountryCode(val)}
                      size="sm"
                      options={[
                        { value: "+55", label: "🇧🇷 +55" },
                        { value: "+1", label: "🇺🇸 +1" },
                        { value: "+351", label: "🇵🇹 +351" },
                        { value: "+34", label: "🇪🇸 +34" },
                        { value: "+44", label: "🇬🇧 +44" },
                        { value: "+33", label: "🇫🇷 +33" },
                        { value: "+49", label: "🇩🇪 +49" },
                        { value: "+39", label: "🇮🇹 +39" },
                        { value: "+52", label: "🇲🇽 +52" },
                        { value: "+54", label: "🇦🇷 +54" },
                      ]}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="tel"
                      value={whatsPhone}
                      onChange={(e) =>
                        setWhatsPhone(formatPhoneNumber(e.target.value))
                      }
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Digite seu número com DDD
                </p>
              </div>
              <Button
                type="submit"
                disabled={sendingWhats}
                isLoading={sendingWhats}
                variant="primary"
                fullWidth
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Enviar código
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyWhats} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digite o código recebido
                </label>
                <OtpInput value={whatsCode} onChange={setWhatsCode} />
              </div>
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={
                    verifyingWhats ||
                    (whatsCode?.replace(/\D/g, "").length ?? 0) < 6
                  }
                  isLoading={verifyingWhats}
                  variant="primary"
                  fullWidth
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Verificar e Ativar
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleSendWhatsStart(e as any)}
                  disabled={resendTimer > 0}
                  variant="secondary"
                  fullWidth
                >
                  {resendTimer > 0 ? `Reenviar (${resendTimer}s)` : "Reenviar"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setSenhaAtual("");
          setNovaSenha("");
          setConfirmarSenha("");
        }}
        title="Alterar Senha"
        maxWidth="md"
      >
        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha Atual *
            </label>
            <Input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Digite sua senha atual"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha *
            </label>
            <Input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite sua nova senha (mín. 6 caracteres)"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha *
            </label>
            <Input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme sua nova senha"
              required
            />
          </div>
          <div className="pt-4 border-t border-gray-200">
            <Button
              type="submit"
              variant="primary"
              fullWidth
            >
              Alterar Senha
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );

  return renderContent();
}
