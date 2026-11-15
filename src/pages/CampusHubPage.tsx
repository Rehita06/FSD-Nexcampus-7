import { useMemo, useState } from 'react';
import { Search, SearchX, Info } from 'lucide-react';
import InfoCard from '@/components/InfoCard';
import { CATEGORIES, getCategory } from '@/constants';
import type { CampusRecord, CategoryId } from '@/types';

interface CampusHubPageProps {
  records: CampusRecord[];
}

type CategoryFilter = CategoryId | 'all';

export default function CampusHubPage({ records }: CampusHubPageProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return records.filter((r) => {
      const matchesCategory = category === 'all' || r.category === category;
      const matchesQuery =
        term === '' || r.title.toLowerCase().includes(term) || r.description.toLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    });
  }, [records, query, category]);

  const countFor = (id: CategoryId) => records.filter((r) => r.category === id).length;
  const selectedLabel = category === 'all' ? 'all topics' : getCategory(category).label;

  return (
    <div className="animate-fade-in mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Campus Information Hub</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Search by keyword or pick a topic to see the rules, procedures and services that apply to you.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
        <CategoryChip label="All topics" count={records.length} active={category === 'all'} onClick={() => setCategory('all')} />
        {CATEGORIES.filter((c) => countFor(c.id) > 0).map((c) => (
          <CategoryChip
            key={c.id}
            label={c.label}
            count={countFor(c.id)}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
          />
        ))}
      </div>

      <div className="card mb-8 grid gap-4 p-4 sm:grid-cols-[1fr_220px] sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            aria-label="Search campus information"
            placeholder="Search by keyword, e.g. library, curfew, ID card"
            className="input pl-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter by category"
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryFilter)}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
        Showing {results.length} {results.length === 1 ? 'result' : 'results'} in {selectedLabel}
      </p>

      {results.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((record) => (
            <InfoCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center p-10 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <SearchX className="h-7 w-7" />
          </span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">No matching information</h2>
          <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
            Try different keywords, or contact the office that handles this topic for an accurate answer.
          </p>
        </div>
      )}

      <div className="mt-10 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Information shown here is for guidance. For final decisions on rules, dates and procedures, please confirm with the relevant college office.
        </p>
      </div>
    </div>
  );
}

function CategoryChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${
        active
          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
          : 'border border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-brand-300'
      }`}
    >
      {label}
      <span className={`rounded-full px-2 text-xs ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
        {count}
      </span>
    </button>
  );
}
