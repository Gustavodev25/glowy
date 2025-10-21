"use client";

import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

interface HorarioDetalhado {
  dia: number;
  aberto: boolean;
  abertura: string;
  fechamento: string;
  intervaloInicio?: string;
  intervaloFim?: string;
}

interface ScheduleDropdownProps {
  horariosDetalhados: HorarioDetalhado[];
  horarioResumido: string;
}

const diasSemana = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado"
];

// Utilitário de classe (mesmo do Tooltip.tsx)
function cn(...args: (string | object | null | undefined)[]): string {
  let result = '';
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string' || typeof arg === 'number') {
      result += (result ? ' ' : '') + arg;
    } else if (typeof arg === 'object') {
      for (const key in arg) {
        if (Object.prototype.hasOwnProperty.call(arg, key) && (arg as any)[key]) {
          result += (result ? ' ' : '') + key;
        }
      }
    }
  }
  return result;
}

export default function ScheduleDropdown({ horariosDetalhados, horarioResumido }: ScheduleDropdownProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatarHorario = (horario: string) => {
    if (!horario) return '';
    return horario.replace(':', 'h');
  };

  const formatarDiaSemana = (dia: number) => {
    return diasSemana[dia] || `Dia ${dia}`;
  };

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, 200); // Delay menor para melhor UX
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Posicionar abaixo do elemento (bottom)
    let top = triggerRect.bottom + scrollY + 8;
    let left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;

    // Ajustar se sair da tela
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Ajustar horizontalmente
    if (left < 8) {
      left = 8;
    } else if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }

    // Ajustar verticalmente - se não cabe abaixo, colocar acima
    if (top + tooltipRect.height > viewportHeight - 8) {
      top = triggerRect.top + scrollY - tooltipRect.height - 8;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowClasses = () => {
    return cn(
      'absolute w-0 h-0',
      'bottom-full left-1/2 transform -translate-x-1/2',
      'border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-200'
    );
  };

  const getArrowInnerClasses = () => {
    return cn(
      'absolute w-0 h-0',
      'bottom-full left-1/2 transform -translate-x-1/2 translate-y-[1px]',
      'border-l-4 border-r-4 border-b-4 border-transparent border-b-white'
    );
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="flex items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors"
      >
        <span className="text-gray-600">{horarioResumido}</span>
        <Clock size={14} className="text-gray-400" />
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'fixed z-50 px-4 py-3 text-sm bg-white rounded-lg border border-gray-200 shadow-lg',
            'animate-fade-in min-w-[280px]'
          )}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Horários de Funcionamento</h4>
          <div className="space-y-2">
            {horariosDetalhados.length > 0 ? (
              horariosDetalhados.map((horario) => (
                <div key={horario.dia} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">
                    {formatarDiaSemana(horario.dia)}
                  </span>
                  <div className="text-right">
                    {horario.aberto ? (
                      <div>
                        <span className="text-gray-900">
                          {formatarHorario(horario.abertura)} - {formatarHorario(horario.fechamento)}
                        </span>
                        {horario.intervaloInicio && horario.intervaloFim && (
                          <div className="text-xs text-gray-500">
                            Intervalo: {formatarHorario(horario.intervaloInicio)} - {formatarHorario(horario.intervaloFim)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-red-500">Fechado</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-2">
                Horários não configurados
              </div>
            )}
          </div>

          {/* Seta externa (borda) */}
          <div className={getArrowClasses()} />

          {/* Seta interna (fundo) */}
          <div className={getArrowInnerClasses()} />
        </div>
      )}
    </>
  );
}
