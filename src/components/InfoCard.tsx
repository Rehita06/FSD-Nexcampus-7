import type { ReactNode } from 'react';
import { getAudienceLabel, getCategory } from '@/constants';
import type { CampusRecord } from '@/types';

export function CategoryBadge({ categoryId }: { categoryId: CampusRecord['category'] }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
      {getCategory(categoryId).label}
    </span>
  );
}

interface InfoCardProps {
  record: CampusRecord;
  actions?: ReactNode;
}

export default function InfoCard({ record, actions }: InfoCardProps) {
  return (
    <article className="card group flex flex-col p-5 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CategoryBadge categoryId={record.category} />
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {getAudienceLabel(record.audience)}
        </span>
      </div>
      <h3 className="text-lg font-semibold leading-snug text-slate-900 dark:text-white">{record.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{record.description}</p>
      {actions && <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">{actions}</div>}
    </article>
  );
}
