'use client';

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import { createPortal } from 'react-dom'; // Removido 'render' e createRoot
import clsx from 'clsx';
import {
  X,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

// --- Definições de Tipos ---
type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: number;
  title: string | ReactNode;
  description?: string | ReactNode;
  measuredHeight?: number;
  timeout?: NodeJS.Timeout;
  remaining?: number;
  start?: number;
  pause?: () => void;
  resume?: () => void;
  preserve?: boolean;
  type: ToastType;
};

// --- Lógica de Store (Global) ---

// Removida a variável 'root' global, não é mais necessária.
let toastId = 0;

const toastStore = {
  toasts: [] as Toast[],
  listeners: new Set<() => void>(),

  add(
    title: string | ReactNode,
    description: string | ReactNode | undefined,
    type: ToastType,
    options?: {
      preserve?: boolean;
    },
  ) {
    const id = toastId++;

    const toast: Toast = {
      id,
      title,
      description,
      type,
      preserve: options?.preserve,
    };

    if (!toast.preserve) {
      toast.remaining = 5000; // Duração padrão de 5s
      toast.start = Date.now();

      const close = () => {
        toastStore.remove(id);
      };

      toast.timeout = setTimeout(close, toast.remaining);

      toast.pause = () => {
        if (!toast.timeout) return;
        clearTimeout(toast.timeout);
        toast.timeout = undefined;
        toast.remaining! -= Date.now() - toast.start!;
      };

      toast.resume = () => {
        if (toast.timeout) return;
        toast.start = Date.now();
        toast.timeout = setTimeout(close, toast.remaining);
      };
    }

    toastStore.toasts.push(toast);
    toastStore.notify();
  },

  remove(id: number) {
    const toast = toastStore.toasts.find((t) => t.id === id);
    if (toast?.timeout) {
      clearTimeout(toast.timeout);
    }
    toastStore.toasts = toastStore.toasts.filter((t) => t.id !== id);
    toastStore.notify();
  },

  subscribe(listener: () => void) {
    toastStore.listeners.add(listener);
    return () => {
      toastStore.listeners.delete(listener);
    };
  },

  notify() {
    toastStore.listeners.forEach((fn) => fn());
  },
};

// --- Hook de Acesso (O que você usará no seu projeto) ---

interface ToastOptions {
  title: string | ReactNode;
  description?: string | ReactNode;
  preserve?: boolean;
}

/**
 * Hook para disparar toasts de qualquer lugar do seu app.
 * Ex: const toasts = useToasts(); toasts.success({ title: 'Olá!' });
 */
export const useToasts = () => {
  // Removido useEffect que chamava mountContainer.
  // O ToasterHost agora renderiza o container.

  return {
    success: useCallback(({ title, description, ...options }: ToastOptions) => {
      toastStore.add(title, description, 'success', options);
    }, []),
    error: useCallback(({ title, description, ...options }: ToastOptions) => {
      toastStore.add(title, description, 'error', options);
    }, []),
    warning: useCallback(({ title, description, ...options }: ToastOptions) => {
      toastStore.add(title, description, 'warning', options);
    }, []),
    info: useCallback(({ title, description, ...options }: ToastOptions) => {
      toastStore.add(title, description, 'info', options);
    }, []),
  };
};

// --- Objeto Toaster Exportado (NOVO) ---
/**
 * Objeto exportado para compatibilidade com a importação de `toaster`.
 * Ex: import { toaster } from '...'
 * Isso permite que seu ToastProvider funcione.
 */
export const toaster = {
  success: ({ title, description, ...options }: ToastOptions) => {
    // Removido mountContainer();
    toastStore.add(title, description, 'success', options);
  },
  error: ({ title, description, ...options }: ToastOptions) => {
    // Removido mountContainer();
    toastStore.add(title, description, 'error', options);
  },
  warning: ({ title, description, ...options }: ToastOptions) => {
    // Removido mountContainer();
    toastStore.add(title, description, 'warning', options);
  },
  info: ({ title, description, ...options }: ToastOptions) => {
    // Removido mountContainer();
    toastStore.add(title, description, 'info', options);
  },
  // Compat: permite chamadas do tipo toaster.create({ title, description, type, duration })
  // O parâmetro duration é ignorado (usa duração padrão interna)
  create: ({ title, description, type }: { title: any; description?: any; type: ToastType; duration?: number }) => {
    toastStore.add(title, description, type, {});
  },
};

// --- Componente de Estilo (Visual do Toast) ---

function ToastItemVisual({ toast }: { toast: Toast }) {
  const v = getVariant(toast.type);
  const title = toast.title as string;
  const description = toast.description as string | undefined;

  return (
    <div className="relative">
      {/* Borda de trás estática */}
      <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>

      {/* Card principal */}
      <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${v.iconWrapperClass}`}
          >
            <v.icon className={`w-6 h-6 ${v.iconClass}`} />
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-semibold text-sm">{title}</p>
            {description && (
              <p className="text-gray-600 text-sm mt-1">{description}</p>
            )}
          </div>

          {/* Botão de fechar */}
          <button
            onClick={() => toastStore.remove(toast.id)}
            className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Container (Lógica de Animação e Posição) ---

const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shownIds, setShownIds] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  // Garante que o container do portal exista no body
  useEffect(() => {
    let el = document.getElementById('toast-portal-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-portal-container';
      // Estilos do container
      el.className = 'fixed bottom-4 right-4 z-[9999] pointer-events-none w-[420px]';
      document.body.appendChild(el);
    }
    setPortalNode(el);
  }, []);

  // Mede a altura de cada toast para a animação de empilhar
  const measureRef = (toast: Toast) => (node: HTMLDivElement | null) => {
    if (node && toast.measuredHeight == null) {
      toast.measuredHeight = node.getBoundingClientRect().height;
      toastStore.notify();
    }
  };

  // Se inscreve no store para receber atualizações de toasts
  useEffect(() => {
    setToasts([...toastStore.toasts]);
    const unsubscribe = toastStore.subscribe(() => {
      setToasts([...toastStore.toasts]);
    });
    return unsubscribe;
  }, []);

  // Controla quais toasts devem animar a entrada
  useEffect(() => {
    const unseen = toasts.filter((t) => !shownIds.includes(t.id)).map((t) => t.id);
    if (unseen.length > 0) {
      requestAnimationFrame(() => {
        setShownIds((prev) => [...prev, ...unseen]);
      });
    }
  }, [toasts]);

  const lastVisibleCount = 3; // Mostra 3 toasts, o resto fica "atrás"
  const lastVisibleStart = Math.max(0, toasts.length - lastVisibleCount);

  // Lógica de animação 3D (do seu código de exemplo)
  const getFinalTransform = (index: number, length: number) => {
    if (index === length - 1) {
      return 'none'; // O toast do topo não se move
    }
    const offset = length - 1 - index;

    // Calcula a altura dos toasts acima
    let translateY = 0;
    for (let i = length - 1; i > index; i--) {
      const toastHeight = toasts[i]?.measuredHeight || 76; // Altura padrão
      if (isHovered) {
        translateY += toastHeight + 10; // Espaçamento quando hover
      } else {
        translateY += 10; // Espaçamento "colapsado"
      }
    }

    const z = -offset;
    const scale = isHovered ? 1 : 1 - 0.05 * offset;

    return `translate3d(0, ${-translateY}px, ${z}px) scale(${scale})`;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    toastStore.toasts.forEach((t) => t.pause?.());
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    toastStore.toasts.forEach((t) => t.resume?.());
  };

  // Calcula a altura total do container para a animação
  const visibleToasts = toasts.slice(lastVisibleStart);
  const containerHeight = visibleToasts.reduce((acc, toast, index) => {
    const height = toast.measuredHeight || 76;
    if (isHovered) {
      return acc + height + (index === 0 ? 0 : 10);
    }
    return acc + (index === visibleToasts.length - 1 ? height : 10);
  }, 0);

  if (!portalNode) return null;

  return createPortal(
    <div
      className="relative pointer-events-auto w-full"
      style={{ height: containerHeight, transition: 'height 0.35s ease' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {toasts.map((toast, index) => {
        const isVisible = index >= lastVisibleStart;

        return (
          <div
            key={toast.id}
            ref={measureRef(toast)}
            className={clsx(
              'absolute right-0 bottom-0 w-[420px]',
              isVisible ? 'opacity-100' : 'opacity-0',
              index < lastVisibleStart && 'pointer-events-none',
            )}
            style={{
              transition: 'all .35s cubic-bezier(.25,.75,.6,.98)',
              transform: shownIds.includes(toast.id)
                ? getFinalTransform(index, toasts.length)
                : 'translate3d(0, 100%, 150px) scale(1)',
            }}
          >
            <ToastItemVisual toast={toast} />
          </div>
        );
      })}
    </div>,
    portalNode,
  );
};

// --- Montagem do Container ---

// Removida a função mountContainer().
// A montagem agora é tratada pelo ToasterHost.

// --- Funções Auxiliares de Estilo ---

function getVariant(type: ToastType): {
  icon: LucideIcon;
  iconWrapperClass: string;
  iconClass: string;
} {
  switch (type) {
    case 'success':
      return {
        icon: CheckCircle2,
        iconWrapperClass: 'bg-green-50',
        iconClass: 'text-green-600',
      };
    case 'error':
      return {
        icon: AlertCircle,
        iconWrapperClass: 'bg-red-50',
        iconClass: 'text-red-600',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        iconWrapperClass: 'bg-yellow-50',
        iconClass: 'text-yellow-600',
      };
    case 'info':
    default:
      return {
        icon: Info,
        iconWrapperClass: 'bg-blue-50',
        iconClass: 'text-blue-600',
      };
  }
}

// --- Componente Host (para seu layout) ---

/**
 * Componente "vazio" que inicializa o sistema de toast.
 * Use isso no seu layout.tsx ou App.tsx
 */
export default function ToasterHost() {
  // Alterado: Em vez de chamar mountContainer,
  // este componente agora renderiza o ToastContainer,
  // que então usa um portal. Isso corrige o erro do createRoot.
  return <ToastContainer />;
}
