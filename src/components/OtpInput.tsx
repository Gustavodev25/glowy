"use client";

import { useEffect, useMemo, useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  className?: string;
}

export default function OtpInput({ value, onChange, length = 6, className }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(() => {
    const only = (value || "").replace(/\D/g, "").slice(0, length);
    const arr = new Array(length).fill("");
    for (let i = 0; i < only.length; i++) arr[i] = only[i] ?? "";
    return arr as string[];
  }, [value, length]);

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, length);
  }, [length]);

  const setDigit = (idx: number, char: string) => {
    const next = digits.slice();
    next[idx] = char;
    onChange(next.join(""));
  };

  const focusInput = (idx: number) => {
    const el = inputsRef.current[idx];
    el?.focus();
    el?.select?.();
  };

  const bounce = (idx: number) => {
    const el = inputsRef.current[idx];
    if (!el) return;
    try {
      el.animate([
        { transform: "scale(1)" },
        { transform: "scale(1.08)" },
        { transform: "scale(1)" },
      ], { duration: 160, easing: "ease-out" });
    } catch {}
  };

  return (
    <div className={`grid grid-cols-6 gap-2 md:gap-3 w-full ${className ?? ""}`}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={d}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (!v) {
              setDigit(i, "");
              return;
            }
            // Handle paste of multiple digits
            if (v.length > 1) {
              const combined = (digits.join("").slice(0, i) + v + digits.slice(i + 1).join("")).replace(/\D/g, "").slice(0, length);
              onChange(combined);
              for (let k = 0; k < v.length && i + k < length; k++) bounce(i + k);
              const nextIndex = Math.min(i + v.length, length - 1);
              focusInput(nextIndex);
              return;
            }
            setDigit(i, v);
            bounce(i);
            if (i < length - 1) focusInput(i + 1);
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, "");
            if (!text) return;
            const room = length - i;
            const toApply = text.slice(0, room);
            const combined = (digits.join("").slice(0, i) + toApply + digits.slice(i + toApply.length).join("")).slice(0, length);
            onChange(combined);
            for (let k = 0; k < toApply.length && i + k < length; k++) bounce(i + k);
            const nextIndex = Math.min(i + toApply.length, length - 1);
            focusInput(nextIndex);
          }}
          onKeyDown={(e) => {
            const key = e.key;
            if (key === "Backspace") {
              if (digits[i]) {
                setDigit(i, "");
              } else if (i > 0) {
                focusInput(i - 1);
                setTimeout(() => setDigit(i - 1, ""), 0);
              }
            }
            if (key === "ArrowLeft" && i > 0) focusInput(i - 1);
            if (key === "ArrowRight" && i < length - 1) focusInput(i + 1);
          }}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full h-14 md:h-16 text-center text-2xl font-semibold border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5837B] focus:border-[#C5837B] text-black transition-transform duration-150"
        />)
      )}
    </div>
  );
}
