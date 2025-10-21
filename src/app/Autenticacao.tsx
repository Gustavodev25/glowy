"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import Login from "./components/Login";
import Cadastro from "./components/Cadastro";
import TipoUsuario from "./components/TipoUsuario";

export default function Autenticacao() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTipoUsuario, setShowTipoUsuario] = useState(false);

  const loginRef = useRef<HTMLDivElement>(null);
  const cadastroRef = useRef<HTMLDivElement>(null);
  const tipoUsuarioRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rightSideRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const speechBubbleRef = useRef<HTMLDivElement>(null);
  const typingTextRef = useRef<HTMLSpanElement>(null);

  const animateTransition = (toLogin: boolean) => {
    if (isAnimating) return;

    setIsAnimating(true);

    const currentComponent = toLogin ? cadastroRef.current : loginRef.current;
    const nextComponent = toLogin ? loginRef.current : cadastroRef.current;

    // Animação simplificada sem blur (muito mais performática)
    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
      },
    });

    // Fade out rápido
    tl.to(currentComponent, {
      opacity: 0,
      y: -10,
      duration: 0.2,
      ease: "power2.in",
    })
      .call(() => {
        setIsLogin(toLogin);
      })
      .set(nextComponent, {
        opacity: 0,
        y: 10,
      })
      // Fade in rápido
      .to(nextComponent, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
  };

  const handleToggleToSignup = () => {
    animateTransition(false);
  };

  const handleToggleToLogin = () => {
    animateTransition(true);
  };

  const handleCadastroSuccess = () => {
    console.log("🎉 handleCadastroSuccess chamado!");
    console.log("📊 Estados antes:", { isLogin, showTipoUsuario });
    setShowTipoUsuario(true);
    console.log("✅ showTipoUsuario definido como true");
  };

  const handleTipoSelecionado = async (tipo: "dono" | "usuario") => {
    try {
      console.log("Enviando tipo de usuário:", tipo);
      const response = await fetch("/api/auth/tipo-usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tipoUsuario: tipo }),
      });

      console.log("Resposta recebida:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Dados recebidos:", data);

        // Se for dono, redirecionar diretamente para o manager
        if (tipo === "dono") {
          router.push("/views/manager");
        } else {
          // Se for cliente, redirecionar para a página inicial
          router.push("/views/home");
        }
      } else {
        const error = await response.json();
        console.error("Erro ao salvar tipo de usuário:", error);
        alert("Erro: " + (error.error || "Erro ao salvar tipo de usuário"));
      }
    } catch (error) {
      console.error("Erro ao salvar tipo de usuário:", error);
      alert("Erro de conexão: " + error);
    }
  };

  const handleVoltarTipoUsuario = () => {
    setShowTipoUsuario(false);
  };


  // Frases para alternar
  const phrases = [
    "Agende seus serviços de forma simples e rápida!",
    "Gerencie sua agenda e clientes com facilidade.",
    "Controle financeiro completo do seu negócio.",
    "Clientes podem agendar 24h por dia!",
    "Relatórios detalhados de vendas e lucros.",
    "Sistema completo para donos e clientes.",
    "Organize horários e maximize seus ganhos!",
    "Agendamentos online nunca foram tão fáceis.",
  ];

  // Variáveis para controlar os timers
  let currentTypeTimer: NodeJS.Timeout | null = null;
  let currentEraseTimer: NodeJS.Timeout | null = null;

  // Função para animação de digitação
  const typeText = (element: HTMLElement, text: string, speed: number = 80) => {
    // Limpar timer anterior se existir
    if (currentTypeTimer) {
      clearInterval(currentTypeTimer);
    }

    // Limpar texto atual
    element.textContent = "";

    let i = 0;

    currentTypeTimer = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        if (currentTypeTimer) {
          clearInterval(currentTypeTimer);
          currentTypeTimer = null;
        }
      }
    }, speed);
  };

  // Função para animação de apagamento
  const eraseText = (element: HTMLElement, speed: number = 50) => {
    return new Promise<void>((resolve) => {
      // Limpar timer anterior se existir
      if (currentEraseTimer) {
        clearInterval(currentEraseTimer);
      }

      const text = element.textContent || "";
      let i = text.length;

      currentEraseTimer = setInterval(() => {
        if (i >= 0) {
          element.textContent = text.substring(0, i);
          i--;
        } else {
          if (currentEraseTimer) {
            clearInterval(currentEraseTimer);
            currentEraseTimer = null;
          }
          resolve();
        }
      }, speed);
    });
  };

  // Função para alternar frases
  const startPhraseRotation = () => {
    let currentIndex = 0;
    let rotationInterval: NodeJS.Timeout | null = null;

    const rotatePhrases = async () => {
      if (typingTextRef.current) {
        // Limpar qualquer animação em andamento
        if (currentTypeTimer) {
          clearInterval(currentTypeTimer);
          currentTypeTimer = null;
        }
        if (currentEraseTimer) {
          clearInterval(currentEraseTimer);
          currentEraseTimer = null;
        }

        // Apagar texto atual com animação
        await eraseText(typingTextRef.current, 50);

        // Aguardar um pouco antes de escrever o novo
        setTimeout(() => {
          if (typingTextRef.current) {
            // Digitar nova frase
            typeText(typingTextRef.current, phrases[currentIndex], 80);
          }
        }, 500);

        // Próxima frase
        currentIndex = (currentIndex + 1) % phrases.length;
      }
    };

    // Iniciar primeira frase
    rotatePhrases();

    // Alternar a cada 8 segundos
    rotationInterval = setInterval(rotatePhrases, 8000);

    // Retornar função para limpar o intervalo
    return () => {
      if (rotationInterval) {
        clearInterval(rotationInterval);
      }
      if (currentTypeTimer) {
        clearInterval(currentTypeTimer);
      }
      if (currentEraseTimer) {
        clearInterval(currentEraseTimer);
      }
    };
  };

  // Animação inicial quando o componente monta - simplificada
  useEffect(() => {
    const initialElement = isLogin ? loginRef.current : cadastroRef.current;

    if (initialElement) {
      // Animação inicial simples e rápida sem blur
      gsap.fromTo(
        initialElement,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        },
      );

      // Animação do lado direito simplificada
      if (
        imageRef.current &&
        speechBubbleRef.current &&
        typingTextRef.current
      ) {
        gsap.fromTo(
          imageRef.current,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            delay: 0.1,
            ease: "power2.out",
          },
        );

        gsap.fromTo(
          speechBubbleRef.current,
          {
            opacity: 0,
            y: -10,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            delay: 0.2,
            ease: "power2.out",
            onComplete: () => {
              // Iniciar rotação de frases
              const cleanup = startPhraseRotation();
              (window as any).phraseRotationCleanup = cleanup;
            },
          },
        );
      }
    }
  }, []);

  // Debug: Monitorar mudanças de estado
  useEffect(() => {
    console.log("🔄 Estados atualizados:", { isLogin, showTipoUsuario });
    console.log("🎯 Renderização atual:", {
      loginVisible: isLogin,
      cadastroVisible: !isLogin && !showTipoUsuario,
      tipoUsuarioVisible: showTipoUsuario
    });
  }, [isLogin, showTipoUsuario]);

  // Limpar intervalos quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Limpar rotação de frases
      if ((window as any).phraseRotationCleanup) {
        (window as any).phraseRotationCleanup();
        (window as any).phraseRotationCleanup = null;
      }

      // Limpar timers de digitação
      if (currentTypeTimer) {
        clearInterval(currentTypeTimer);
        currentTypeTimer = null;
      }
      if (currentEraseTimer) {
        clearInterval(currentEraseTimer);
        currentEraseTimer = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row relative">
      {/* Lado esquerdo - Formulário */}
      <div className="flex-[2] flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div
          ref={containerRef}
          className="max-w-md w-full space-y-6 sm:space-y-8"
        >
          {/* Renderizar ambos os componentes com refs */}
          {isLogin && (
            <div ref={loginRef}>
              <Login onToggleToSignup={handleToggleToSignup} />
            </div>
          )}

          {!isLogin && !showTipoUsuario && (
            <div ref={cadastroRef}>
              <Cadastro
                onToggleToLogin={handleToggleToLogin}
                onCadastroSuccess={handleCadastroSuccess}
              />
            </div>
          )}

          {showTipoUsuario && (
            <div ref={tipoUsuarioRef}>
              <TipoUsuario
                onTipoSelecionado={handleTipoSelecionado}
                onVoltar={handleVoltarTipoUsuario}
              />
            </div>
          )}
        </div>
      </div>


      {/* Lado direito - Gradiente com imagem, título e subtítulo */}
      <div className="flex flex-[1] p-4 sm:p-6 lg:p-4 min-h-[300px] lg:min-h-screen">
        <div
          ref={rightSideRef}
          className="w-full h-full rounded-lg overflow-hidden relative flex flex-col items-center justify-center py-6 sm:py-8"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #F5D2D2 0%, #C5837B 100%)",
          }}
        >
          {/* Balão de fala */}
          <div
            ref={speechBubbleRef}
            className="relative bg-white rounded-2xl p-3 sm:p-4 shadow-lg max-w-[280px] sm:max-w-xs mb-3 sm:mb-4 mx-4"
          >
            {/* Setinha apontando para baixo */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 sm:border-l-8 border-r-6 sm:border-r-8 border-t-6 sm:border-t-8 border-l-transparent border-r-transparent border-t-white"></div>

            {/* Texto com animação de digitação */}
            <span
              ref={typingTextRef}
              className="text-gray-800 text-xs sm:text-sm font-medium"
            ></span>

            {/* Cursor piscante */}
            <span className="animate-pulse text-gray-800">|</span>
          </div>

          {/* Imagem */}
          <div
            ref={imageRef}
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-lg overflow-hidden"
          >
            <img
              src="/assets/mascote.png"
              alt="Mascote do App"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
