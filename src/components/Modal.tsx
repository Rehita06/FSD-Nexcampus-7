import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-slate-900/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[90vh] w-full animate-pop-in overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-xl sm:rounded-3xl dark:bg-slate-900"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
