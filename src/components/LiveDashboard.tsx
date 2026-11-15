import { Building2, Layers, RefreshCw, UserPlus, Users } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { ErrorState, LoadingState } from '@/components/DataState';
import { getCategory } from '@/constants';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import type { Route } from '@/types';

function DistributionBars({ rows, empty }: { rows: { label: string; count: number }[]; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-slate-500 dark:text-slate-400">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-medium text-slate-700 dark:text-slate-200">{row.label}</span>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">{row.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-500 dark:bg-brand-400"
              style={{ width: `${Math.max(6, (row.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Dashboard numbers come straight from GET /api/stats (computed from MongoDB on every request).
export default function LiveDashboard({ onNavigate }: { onNavigate: (route: Route) => void }) {
  const { stats, status, error, refresh } = useDashboardStats();

  return (
    <section aria-labelledby="live-dashboard-title">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <h2 id="live-dashboard-title" className="text-3xl font-bold text-slate-900 dark:text-white">Campus at a glance</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Live numbers from the NexCampus database.</p>
        </div>
        {status === 'ready' && (
          <button onClick={() => void refresh()} className="btn-secondary self-start sm:self-auto">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        )}
      </div>

      {status === 'loading' && !stats && <LoadingState label="Loading campus statistics…" />}
      {status === 'error' && <ErrorState title="Statistics unavailable" message={error} onRetry={() => void refresh()} />}

      {status === 'ready' && stats && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Registered students" value={stats.totals.students} icon={Users} hint="Stored in MongoDB" />
            <StatCard label="Campus records" value={stats.totals.records} icon={Layers} hint="Rules, procedures and services" />
            <StatCard label="Departments" value={stats.departmentDistribution.length} icon={Building2} hint="With registered students" />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="card p-5">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Students by department</h3>
              <DistributionBars
                rows={stats.departmentDistribution.map((d) => ({ label: d.department, count: d.count }))}
                empty="No students registered yet."
              />
            </div>

            <div className="card p-5">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Records by category</h3>
              <DistributionBars
                rows={stats.categoryDistribution.map((c) => ({ label: getCategory(c.category).label, count: c.count }))}
                empty="No campus records yet."
              />
            </div>

            <div className="card p-5">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Recently registered</h3>
              {stats.recentStudents.length === 0 ? (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No students registered yet.</p>
                  <button onClick={() => onNavigate('students')} className="btn-secondary !px-3 !py-2 text-sm">
                    <UserPlus className="h-4 w-4" /> Register a student
                  </button>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.recentStudents.map((s) => (
                      <li key={s.id} className="py-2.5 first:pt-0 last:pb-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{s.name}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {s.registerNumber} · {s.department} · {new Date(s.createdAt).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => onNavigate('students')} className="mt-4 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
                    Manage students
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
