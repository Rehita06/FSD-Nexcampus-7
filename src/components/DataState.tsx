import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="card flex flex-col items-center gap-3 p-10 text-center text-slate-600 dark:text-slate-300">
      <Loader2 className="h-7 w-7 animate-spin text-brand-600 dark:text-brand-300" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry, title = 'Something went wrong' }: { message: string; onRetry?: () => void; title?: string }) {
  return (
    <div role="alert" className="card flex flex-col items-center p-10 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-5">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center p-10 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {icon}
      </span>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      {children && <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// Page-level wrapper used by pages that cannot render anything useful without data.
export function PageShell({ children }: { children: ReactNode }) {
  return <div className="animate-fade-in mx-auto max-w-3xl px-4 py-16 sm:px-6">{children}</div>;
}
