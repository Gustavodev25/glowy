"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

interface Step {
  id: string;
  title: string;
  content: ReactNode;
  isValid?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onComplete?: () => void;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  nextButtonText?: string;
  backButtonText?: string;
  completeButtonText?: string;
  className?: string;
}

export default function Stepper({
  steps,
  currentStep,
  onNext,
  onBack,
  onComplete,
  loading = false,
  title,
  subtitle,
  nextButtonText = "Continuar",
  backButtonText = "Voltar",
  completeButtonText = "Finalizar",
  className = "",
}: StepperProps) {
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps;
  const canProceed = steps[currentStep - 1]?.isValid !== false;

  const handleNext = () => {
    if (isLastStep && onComplete) {
      onComplete();
    } else {
      onNext();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      onBack();
    }
  };

  return (
    <div className={`w-full min-h-screen flex items-center justify-center p-4 ${className}`}>
      <div className="w-full max-w-2xl flex flex-col">
        {/* Header + Progress */}
        <div className="px-8 py-6">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-[#C5837B] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 relative">
          <AnimatePresence mode="wait">
            {steps.map((step, index) => {
              if (index + 1 !== currentStep) return null;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {step.content}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 flex items-center justify-between">
          <Button
            onClick={handleBack}
            disabled={currentStep === 1}
            variant="ghost"
          >
            {backButtonText}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed || loading}
            isLoading={loading}
            variant="primary"
          >
            {isLastStep ? completeButtonText : nextButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
