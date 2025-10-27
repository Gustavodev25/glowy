'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useToast } from '@/contexts/ToastContext';
import Button from '@/components/visual/Button';

interface TipoUsuarioProps {
  onTipoSelecionado: (tipo: 'dono' | 'usuario') => void;
  onVoltar: () => void;
}

export default function TipoUsuario({ onTipoSelecionado, onVoltar }: TipoUsuarioProps) {
  const [tipoSelecionado, setTipoSelecionado] = useState<'dono' | 'usuario' | null>(null);
  const { success, error: showError } = useToast();

  // Refs para animações
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

    tl.fromTo(titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
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
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <h2 ref={titleRef} className="text-xl sm:text-2xl font-bold text-left text-gray-800 mb-2">
        Que tipo de usuário você é?
      </h2>
      <p ref={subtitleRef} className="text-sm text-gray-600 text-left mb-8">
        Escolha abaixo o tipo de conta que melhor se adequa ao seu perfil
      </p>

      <div ref={cardsRef} className="space-y-4 mb-8">
        {/* Card Dono do Estabelecimento */}
        <div ref={donoCardRef} className="relative">
          <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
          <div
            onClick={() => handleTipoSelecionado('dono')}
            className={`relative z-10 flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
            tipoSelecionado === 'dono'
              ? 'bg-gray-50 border-[#C5837B]'
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}
          >
          <div className="relative z-10 mr-3">
            <img
              src="/assets/dono.png"
              alt="Dono do Estabelecimento"
              className="w-12 h-12 rounded-lg object-cover"
            />
          </div>
          <div className="relative z-10 flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Dono do Estabelecimento
            </h3>
            <p className="text-sm text-gray-600">
              Você possui um negócio e quer gerenciar reservas, clientes e horários
            </p>
          </div>
          </div>
        </div>

        {/* Card Cliente */}
        <div ref={usuarioCardRef} className="relative">
          <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
          <div
            onClick={() => handleTipoSelecionado('usuario')}
          className={`relative z-10 flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
            tipoSelecionado === 'usuario'
              ? 'bg-gray-50 border-[#C5837B]'
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="relative z-10 mr-3">
            <img
              src="/assets/cliente.png"
              alt="Cliente"
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          </div>
          <div className="relative z-10 flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Cliente
            </h3>
            <p className="text-sm text-gray-600">
              Você quer fazer reservas e encontrar estabelecimentos para seus serviços
            </p>
          </div>
        </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          ref={buttonRef}
          onClick={handleConfirmar}
          disabled={!tipoSelecionado}
          variant="primary"
          fullWidth
        >
          Continuar
        </Button>

        <Button
          ref={voltarRef}
          onClick={onVoltar}
          variant="secondary"
          fullWidth
        >
          Voltar
        </Button>
      </div>
    </div>
  );
}
