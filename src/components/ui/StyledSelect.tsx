"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface StyledSelectProps {
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  helpText?: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
}

const StyledSelect = forwardRef<HTMLDivElement, StyledSelectProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      required = false,
      error,
      helpText,
      placeholder = "Selecione uma opção",
      className,
      containerClassName,
      disabled = false,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | null>(
      value || null,
    );
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setSelectedValue(value || null);
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const toggleDropdown = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    const handleOptionClick = (optionValue: string) => {
      setSelectedValue(optionValue);
      if (onChange) {
        onChange(optionValue);
      }
      setIsOpen(false);
    };

    const selectedLabel =
      options.find((opt) => opt.value === selectedValue)?.label || placeholder;

    const selectClasses = cn(
      "w-full px-4 py-3 text-sm bg-white text-gray-600",
      "border border-gray-300 rounded-2xl outline-none",
      "shadow-[3px_3px_0px_#e5e7eb]",
      "transition-all duration-100 ease-in-out",
      "flex justify-between items-center",
      "cursor-pointer",
      disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400",
      isOpen && "shadow-none translate-x-[3px] translate-y-[3px]",
      error ? "border-red-300" : "focus:border-gray-400",
      className,
    );

    const containerClasses = cn("w-full max-w-md", containerClassName);
    const labelClasses = cn(
      "block text-sm font-medium text-gray-700 mb-1",
      error && "text-red-600",
    );
    const errorClasses = cn(
      "mt-1 text-xs text-red-600 transition-opacity duration-200",
      error ? "opacity-100" : "opacity-0 h-0",
    );
    const helpTextClasses = "mt-1 text-xs text-gray-500";
    const optionsClasses = cn(
      "absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg",
      "max-h-60 overflow-auto py-1",
      "transform transition-all duration-100 ease-in-out",
      isOpen
        ? "opacity-100 translate-y-0 visible"
        : "opacity-0 -translate-y-2 invisible",
    );
    const optionClasses = (optionValue: string) =>
      cn(
        "px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100",
        "transition-colors duration-100",
        selectedValue === optionValue && "bg-gray-100 font-medium",
      );

    return (
      <div className={containerClasses} ref={selectRef}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="relative">
          <div
            className={selectClasses}
            onClick={toggleDropdown}
            role="combobox"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleDropdown();
              }
            }}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-invalid={!!error}
            aria-required={required}
          >
            <span className={!selectedValue ? "text-gray-400" : ""}>
              {selectedLabel}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-gray-500 transition-transform duration-200",
                isOpen && "transform rotate-180",
              )}
            />
          </div>

          <div className={optionsClasses} role="listbox">
            {options.map((option) => (
              <div
                key={option.value}
                className={optionClasses(option.value)}
                onClick={() => handleOptionClick(option.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOptionClick(option.value);
                  }
                }}
                role="option"
                aria-selected={selectedValue === option.value}
                tabIndex={0}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
        {error && <p className={errorClasses}>{error}</p>}
        {helpText && !error && <p className={helpTextClasses}>{helpText}</p>}
      </div>
    );
  },
);

StyledSelect.displayName = "StyledSelect";

export { StyledSelect };
