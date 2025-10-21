"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function Stepper({
  steps,
  currentStep,
  onStepClick,
}: StepperProps) {
  const stepperRef = useRef<HTMLDivElement>(null);

  // Animação dos elementos quando o componente aparece
  useEffect(() => {
    if (stepperRef.current) {
      gsap.fromTo(
        stepperRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      );
    }
  }, []);

  return (
    <div ref={stepperRef} className="w-full mb-6">
      {/* Indicador de progresso */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-500">
            Passo {currentStep + 1} de {steps.length}
          </span>
          <span className="text-xs font-semibold text-[#C5837B]">
            {steps[currentStep]}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#C5837B] to-[#B0736B] transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Dots indicadores */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={index}
              className={`transition-all duration-300 rounded-full ${
                isActive
                  ? "w-8 h-2 bg-[#C5837B] shadow-sm"
                  : isCompleted
                    ? "w-2 h-2 bg-[#C5837B]"
                    : "w-2 h-2 bg-gray-300"
              }`}
              title={step}
            />
          );
        })}
      </div>
    </div>
  );
}
