"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useToast } from "@/contexts/ToastContext";
import OtpInput from "@/components/OtpInput";
import Input from "@/components/visual/Input";
import Button from "@/components/visual/Button";
import { useAuth } from "@/hooks/useAuth";

interface LoginProps {
  onToggleToSignup: () => void;
}

export default function Login({ onToggleToSignup }: LoginProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", senha: "" });
  const { login, isLoading, error: authError } = useAuth();
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);
  const [twoFactorMethod, setTwoFactorMethod] = useState<
    "totp" | "whatsapp" | null
  >(null);
  const [totpCode, setTotpCode] = useState("");
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const { success, error: showError } = useToast();

  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const senhaInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.senha) {
      showError("Campos obrigatórios", "Email e senha são obrigatórios!");
      return;
    }
    try {
      const data = await login(formData.email, formData.senha);

      if (data?.twoFactorRequired) {
        setTwoFactorRequired(true);
        setTwoFactorToken(data.twoFactorToken);
        setTwoFactorMethod((data.method as any) || "totp");

        // Mensagem específica baseada no método
        if (data.method === "whatsapp") {
          success(
            "Código enviado por WhatsApp",
            "Verifique seu WhatsApp e insira o código de 6 dígitos.",
          );
        } else {
          success(
            "Verificação 2FA necessária",
            "Insira o código do seu app autenticador.",
          );
        }
        return;
      }

      success("Login realizado!", "Bem-vindo de volta!");
      await routeAfterLogin();
    } catch (err) {
      // O erro já é tratado pelo hook useAuth
      console.error("Erro no login:", err);
    }
  };

  const routeAfterLogin = async () => {
    try {
      const me = await fetch("/api/auth/me", { credentials: "include" });
      if (me.ok) {
        const { user } = await me.json();
        // Redirecionar todos os usuários para a página inicial
        router.push("/views/home");
      } else {
        router.push("/views/home");
      }
    } catch {
      router.push("/views/home");
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorToken) return;
    if (!totpCode || totpCode.trim().length < 6) {
      showError("Código obrigatório", "Informe o código do autenticador.");
      return;
    }
    setIsVerifying2FA(true);
    try {
      const resp = await fetch("/api/auth/login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ twoFactorToken, code: totpCode }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Código inválido");
      success("Login realizado!", "2FA verificado com sucesso.");
      await routeAfterLogin();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao verificar 2FA";
      showError("Erro", msg);
    } finally {
      setIsVerifying2FA(false);
    }
  };

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "-=0.2",
      )
      .fromTo(
        formRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.1",
      )
      .fromTo(
        toggleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "-=0.2",
      );
  }, []);

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <h2
        ref={titleRef}
        className="text-xl sm:text-2xl font-bold text-left text-gray-800 mb-2"
      >
        {twoFactorRequired
          ? "Verificação em duas etapas"
          : "Bem-vindo de volta!"}
      </h2>
      <p
        ref={subtitleRef}
        className="text-xs sm:text-sm text-gray-600 text-left mb-4 sm:mb-6"
      >
        {twoFactorRequired
          ? twoFactorMethod === "whatsapp"
            ? "Digite o código de 6 dígitos enviado por WhatsApp"
            : "Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador"
          : "Entre com suas credenciais para acessar sua conta"}
      </p>

      {!twoFactorRequired && (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            ref={emailInputRef}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Digite seu email"
          />

          <Input
            label="Senha"
            ref={senhaInputRef}
            type="password"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
            placeholder="Digite sua senha"
          />

          <Button
            ref={submitButtonRef}
            type="submit"
            isLoading={isLoading}
            variant="primary"
            fullWidth
            className="mt-2"
          >
            Entrar
          </Button>
        </form>
      )}

      {twoFactorRequired && (
        <form onSubmit={handleVerify2FA} className="space-y-4">
          <div>
            <OtpInput value={totpCode} onChange={setTotpCode} />
          </div>
          <div className="relative w-full">
            <Button
              type="submit"
              isLoading={isVerifying2FA}
              disabled={totpCode.replace(/\D/g, "").length < 6}
              variant="primary"
              fullWidth
            >
              Verificar e Entrar
            </Button>
          </div>
        </form>
      )}

      <div ref={toggleRef} className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {twoFactorRequired ? (
            <button
              ref={toggleButtonRef}
              type="button"
              onClick={() => {
                setTwoFactorRequired(false);
                setTwoFactorToken(null);
                setTotpCode("");
              }}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              ← Voltar
            </button>
          ) : (
            <>
              Não possui uma conta?{" "}
              <button
                ref={toggleButtonRef}
                type="button"
                onClick={onToggleToSignup}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                Cadastre-se!
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
