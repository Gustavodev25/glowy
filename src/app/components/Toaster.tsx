'use client';

import { Toaster, Toast, createToaster } from '@ark-ui/react/toast';
import { Portal } from '@ark-ui/react/portal';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export const toaster = createToaster({
  placement: 'bottom-end',
  gap: 16,
  overlap: true,
});

export default function ToasterHost() {
  return (
    <Portal>
      <Toaster toaster={toaster}>
        {(t) => <ToastItem toast={t} />}
      </Toaster>
    </Portal>
  );
}

function ToastItem({ toast }: { toast: any }) {
  const v = getVariant(toast.type as ToastType | undefined);

  return (
    <Toast.Root
      className={[
        'bg-white rounded-[10px] shadow-md border border-[#F0F0F0]',
        'min-w-[20rem] max-w-[28rem] p-4 pr-10 relative',
        'break-words',
        'transition-all duration-300 ease-out will-change-transform',
        'h-[var(--height)] opacity-[var(--opacity)]',
        'translate-x-[var(--x)] translate-y-[var(--y)] scale-[var(--scale)]',
        'z-[var(--z-index)]',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 ${v.iconColor}`}>{v.icon}</span>
        <div className="flex-1 min-w-0">
          <Toast.Title className="text-black font-semibold text-sm">
            {toast.title}
          </Toast.Title>
          {toast.description ? (
            <Toast.Description className="text-black text-sm mt-1">
              {toast.description}
            </Toast.Description>
          ) : null}
        </div>
      </div>
      <Toast.CloseTrigger
        className="absolute top-3 right-3 p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </Toast.CloseTrigger>
    </Toast.Root>
  );
}

function getVariant(type?: ToastType) {
  switch (type) {
    case 'success':
      return { bar: 'bg-green-500', iconColor: 'text-green-600 dark:text-green-400', icon: <CheckCircle2 className="w-5 h-5" /> };
    case 'error':
      return { bar: 'bg-red-500', iconColor: 'text-red-600 dark:text-red-400', icon: <XCircle className="w-5 h-5" /> };
    case 'warning':
      return { bar: 'bg-yellow-500', iconColor: 'text-yellow-600 dark:text-yellow-500', icon: <AlertTriangle className="w-5 h-5" /> };
    default:
      return { bar: 'bg-blue-500', iconColor: 'text-blue-600 dark:text-blue-400', icon: <Info className="w-5 h-5" /> };
  }
}
