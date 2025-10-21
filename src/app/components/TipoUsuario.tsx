'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useToast } from '@/contexts/ToastContext';

interface TipoUsuarioProps {
  onTipoSelecionado: (tipo: 'dono' | 'usuario') => void;
  onVoltar: () => void;
}

export default function TipoUsuario({ onTipoSelecionado, onVoltar }: TipoUsuarioProps) {
  const [tipoSelecionado, setTipoSelecionado] = useState<'dono' | 'usuario' | null>(null);
  const { success, error: showError } = useToast();

  // Refs para animações
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const donoCardRef = useRef<HTMLDivElement>(null);
  const usuarioCardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const voltarRef = useRef<HTMLButtonElement>(null);

  const handleTipoSelecionado = (tipo: 'dono' | 'usuario') => {
    setTipoSelecionado(tipo);
  };

  const handleConfirmar = () => {
    if (!tipoSelecionado) {
      showError('Selecione um tipo', 'Por favor, selecione o tipo de usuário!');
      return;
    }
    
    success('Tipo selecionado!', 'Perfeito! Vamos continuar com sua conta.');
    onTipoSelecionado(tipoSelecionado);
  };

  // Animação dos elementos quando o componente aparece
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(logoRef.current, 
      { opacity: 0, y: -20, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
    )
    .fromTo(titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      "-=0.3"
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      "-=0.2"
    )
    .fromTo(cardsRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.1"
    )
    .fromTo(buttonRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      "-=0.2"
    )
    .fromTo(voltarRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      "-=0.1"
    );
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo do App */}
      <div ref={logoRef} className="flex justify-start mb-6">
        <img 
          src="/assets/logo.png" 
          alt="Logo do App" 
          className="w-16 h-16 rounded-lg object-cover"
        />
      </div>
      
      <h2 ref={titleRef} className="text-2xl font-bold text-left text-gray-800 mb-2">
        Que tipo de usuário você é?
      </h2>
      <p ref={subtitleRef} className="text-sm text-gray-600 text-left mb-8">
        Escolha abaixo o tipo de conta que melhor se adequa ao seu perfil
      </p>

      <div ref={cardsRef} className="space-y-4 mb-8">
        {/* Card Dono do Estabelecimento */}
        <div
          ref={donoCardRef}
          onClick={() => handleTipoSelecionado('dono')}
          className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
            tipoSelecionado === 'dono'
              ? 'border-[#C5837B] bg-[#C5837B]/5'
              : 'border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img 
                src="/assets/dono.png" 
                alt="Dono do Estabelecimento" 
                className="w-16 h-16 rounded-lg object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Dono do Estabelecimento
              </h3>
              <p className="text-sm text-gray-600">
                Você possui um negócio e quer gerenciar reservas, clientes e horários
              </p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              tipoSelecionado === 'dono'
                ? 'border-[#C5837B] bg-[#C5837B]'
                : 'border-gray-300'
            }`}>
              {tipoSelecionado === 'dono' && (
                <div className="text-white text-xs font-bold">✓</div>
              )}
            </div>
          </div>
        </div>

        {/* Card Usuário Normal */}
        <div
          ref={usuarioCardRef}
          onClick={() => handleTipoSelecionado('usuario')}
          className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
            tipoSelecionado === 'usuario'
              ? 'border-[#C5837B] bg-[#C5837B]/5'
              : 'border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img 
                src="/assets/cliente.png" 
                alt="Usuário Normal" 
                className="w-16 h-16 rounded-lg object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Cliente
              </h3>
              <p className="text-sm text-gray-600">
                Você quer fazer reservas e encontrar estabelecimentos para seus serviços
              </p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              tipoSelecionado === 'usuario'
                ? 'border-[#C5837B] bg-[#C5837B]'
                : 'border-gray-300'
            }`}>
              {tipoSelecionado === 'usuario' && (
                <div className="text-white text-xs font-bold">✓</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          ref={buttonRef}
          onClick={handleConfirmar}
          disabled={!tipoSelecionado}
          className="w-full bg-[#C5837B] text-white py-3 px-4 rounded-md hover:bg-[#B0736B] focus:outline-none focus:ring-2 focus:ring-[#C5837B] focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Continuar
        </button>

        <button
          ref={voltarRef}
          onClick={onVoltar}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-200"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
