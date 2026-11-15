import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}

export default function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4 p-5 hover:-translate-y-0.5 hover:shadow-md">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
        {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
