"use client";

import { useState } from "react";

interface OptimizedBannerProps {
  src: string;
  alt: string;
  className?: string;
}

export default function OptimizedBanner({ src, alt, className = "" }: OptimizedBannerProps) {
  const [imageError, setImageError] = useState(false);

  // Função para gerar URL otimizada do Cloudinary
  const getOptimizedImageUrl = (originalUrl: string) => {
    if (!originalUrl) return originalUrl;

    // Se for URL do Cloudinary, adicionar parâmetros de otimização
    if (originalUrl.includes('cloudinary.com')) {
      // Tamanho padrão: 1200x300 (4:1 ratio para banner)
      // Qualidade alta para banners
      const optimizedUrl = originalUrl.replace('/upload/', '/upload/w_1200,h_300,c_fill,q_auto,f_auto/');
      return optimizedUrl;
    }

    return originalUrl;
  };

  // Função para gerar URL de fallback com tamanho menor
  const getFallbackImageUrl = (originalUrl: string) => {
    if (!originalUrl) return originalUrl;

    if (originalUrl.includes('cloudinary.com')) {
      // Fallback menor para carregamento rápido
      const fallbackUrl = originalUrl.replace('/upload/', '/upload/w_600,h_150,c_fill,q_auto,f_auto/');
      return fallbackUrl;
    }

    return originalUrl;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <div className={`w-full h-full bg-gradient-to-r from-[#C5837B]/10 via-[#C5837B]/5 to-transparent flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-sm">Banner não disponível</div>
      </div>
    );
  }

  return (
    <img
      src={getOptimizedImageUrl(src)}
      alt={alt}
      className={`w-full h-full object-cover transition-opacity duration-300 ${className}`}
      onError={handleImageError}
      loading="lazy"
      // Atributos para melhor performance
      decoding="async"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
    />
  );
}






