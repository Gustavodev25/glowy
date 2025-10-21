"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UniversalLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  text?: string;
}

const BookIcon1 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12z" />
    <path d="M19 16h-12a2 2 0 0 0 -2 2" />
    <path d="M9 8h6" />
  </svg>
);

const BookIcon2 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
    <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
    <path d="M3 6l0 13" />
    <path d="M12 6l0 13" />
    <path d="M21 6l0 13" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
    <path d="M13.5 6.5l4 4" />
  </svg>
);

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export default function UniversalLoader({
  size = "md",
  color = "#C5837B",
  text = "",
}: UniversalLoaderProps) {
  const [currentIcon, setCurrentIcon] = useState(0);
  const icons = [BookIcon1, BookIcon2, PencilIcon];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 800); // Muda o ícone a cada 800ms

    return () => clearInterval(interval);
  }, []);

  const CurrentIconComponent = icons[currentIcon];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative" style={{ color }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIcon}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
            }}
            className="flex items-center justify-center"
          >
            <CurrentIconComponent className={sizeClasses[size]} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
