"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/contexts/ToastContext";
import Input from "@/components/visual/Input";
import Button from "@/components/visual/Button";
import Checkbox from "@/components/visual/Checkbox";

interface CadastroProps {
  onToggleToLogin: () => void;
  onCadastroSuccess?: () => void;
}

export default function Cadastro({
  onToggleToLogin,
  onCadastroSuccess,
}: CadastroProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [termosAceitos, setTermosAceitos] = useState(false);
  const { cadastrar, isLoading, error: authError } = useAuth();
  const { success, error: showError, warning } = useToast();

  // Exibir erros do auth se houver
  useEffect(() => {
    if (authError) {
      showError("Erro no cadastro", authError);
    }
  }, [authError, showError]);

  // Função para calcular a força da senha
  const calcularForcaSenha = (senha: string) => {
    let pontos = 0;
    const criterios = {
      comprimento: senha.length >= 8,
      maiuscula: /[A-Z]/.test(senha),
      minuscula: /[a-z]/.test(senha),
      numero: /\d/.test(senha),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(senha),
    };

    // Pontuação baseada nos critérios
    if (criterios.comprimento) pontos += 1;
    if (criterios.maiuscula) pontos += 1;
    if (criterios.minuscula) pontos += 1;
    if (criterios.numero) pontos += 1;
    if (criterios.especial) pontos += 1;

    return { pontos, criterios };
  };

  const forcaSenha = calcularForcaSenha(formData.senha);

  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const nomeInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const senhaInputRef = useRef<HTMLInputElement>(null);
  const confirmarSenhaInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpar erro quando usuário começar a digitar
    if (authError) {
      // O erro será limpo automaticamente pelo hook useAuth
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermosAceitos(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termosAceitos) {
      warning(
        "Termos de Uso",
        "Você deve aceitar os Termos de Uso para continuar!",
      );
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      showError("Senhas não coincidem", "As senhas não coincidem!");
      return;
    }

    if (formData.senha.length < 6) {
      showError(
        "Senha muito curta",
        "A senha deve ter pelo menos 6 caracteres!",
      );
      return;
    }

    try {
      await cadastrar(formData.nome, formData.email, formData.senha);

      // Sucesso - mostrar mensagem e chamar callback
      success(
        "Conta criada!",
        "Sua conta foi criada com sucesso! Agora escolha seu tipo de usuário.",
      );

      // Chamar callback para mostrar seleção de tipo de usuário
      if (onCadastroSuccess) {
        console.log("🚀 Chamando onCadastroSuccess callback...");
        // Usar setTimeout para garantir que o estado seja atualizado após o render
        setTimeout(() => {
          console.log("⏰ Executando onCadastroSuccess após timeout");
          onCadastroSuccess();
        }, 100);
      } else {
        console.log("❌ onCadastroSuccess callback não fornecido!");
      }
    } catch (err) {
      // Erro já é tratado pelo hook useAuth
      console.error("Erro no cadastro:", err);
    }
  };

  // Funções para animações dos inputs (removidas as animações de transform)

  // Função para animação de shake em caso de erro (removida)

  // Animação dos elementos quando o componente aparece
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      logoRef.current,
      { opacity: 0, y: -20, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
    )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.3",
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
      {/* Logo do App */}
      <div ref={logoRef} className="flex justify-start mb-4 sm:mb-6">
        <img
          src="/assets/logo.png"
          alt="Logo do App"
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
        />
      </div>

      <h2
        ref={titleRef}
        className="text-xl sm:text-2xl font-bold text-left text-gray-800 mb-2"
      >
        Crie sua conta hoje!
      </h2>
      <p
        ref={subtitleRef}
        className="text-xs sm:text-sm text-gray-600 text-left mb-4 sm:mb-6"
      >
        Preencha os dados abaixo para criar sua conta
      </p>

      {/* Exibir erro se houver */}
      {authError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {authError}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome Completo"
          ref={nomeInputRef}
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          placeholder="Digite seu nome completo"
        />

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

        <div className="space-y-1">
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

          {/* Indicador de força da senha */}
          {formData.senha && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${forcaSenha.pontos <= 2
                      ? "bg-red-500"
                      : forcaSenha.pontos <= 3
                        ? "bg-yellow-500"
                        : forcaSenha.pontos <= 4
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                    style={{ width: `${(forcaSenha.pontos / 5) * 100}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${forcaSenha.pontos <= 2
                    ? "text-red-600"
                    : forcaSenha.pontos <= 3
                      ? "text-yellow-600"
                      : forcaSenha.pontos <= 4
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                >
                  {forcaSenha.pontos <= 2
                    ? "Fraca"
                    : forcaSenha.pontos <= 3
                      ? "Média"
                      : forcaSenha.pontos <= 4
                        ? "Boa"
                        : "Forte"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Input
            label="Confirmar Senha"
            ref={confirmarSenhaInputRef}
            type="password"
            id="confirmarSenha"
            name="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            required
            placeholder="Confirme sua senha"
            error={
              formData.senha &&
                formData.confirmarSenha &&
                formData.senha !== formData.confirmarSenha
                ? "As senhas não coincidem"
                : undefined
            }
          />
        </div>

        {/* Checkbox para Termos de Uso */}
        <Checkbox
          id="termos"
          name="termos"
          checked={termosAceitos}
          onChange={handleCheckboxChange}
          label={
            <>
              Ao criar uma conta, você concorda com nossos{" "}
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Termos de Uso
              </a>
            </>
          }
          required
        />

        <Button
          ref={submitButtonRef}
          type="submit"
          isLoading={isLoading}
          variant="primary"
          fullWidth
          className="text-sm sm:text-base"
        >
          Criar Conta
        </Button>
      </form>

      <div ref={toggleRef} className="mt-4 sm:mt-6 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          Possui uma conta?{" "}
          <button
            ref={toggleButtonRef}
            type="button"
            onClick={onToggleToLogin}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            Login!
          </button>
        </p>
      </div>
    </div>
  );
}
