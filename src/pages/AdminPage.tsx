import { useMemo, useState } from 'react';
import { BookMarked, Pencil, Plus, RotateCcw, Search, Trash2, Users } from 'lucide-react';
import Modal from '@/components/Modal';
import RecordForm from '@/components/RecordForm';
import StatCard from '@/components/StatCard';
import { CategoryBadge } from '@/components/InfoCard';
import { useToast } from '@/components/ToastProvider';
import { errorMessage } from '@/services/http';
import { AUDIENCES, CATEGORIES, getAudienceLabel } from '@/constants';
import type { CampusRecord, RecordDraft } from '@/types';

interface AdminPageProps {
  records: CampusRecord[];
  onAdd: (draft: RecordDraft) => Promise<void>;
  onUpdate: (id: string, draft: RecordDraft) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReset: () => Promise<void>;
}

type ActiveDialog = { type: 'create' } | { type: 'edit'; record: CampusRecord } | { type: 'delete'; record: CampusRecord } | { type: 'reset' } | null;

export default function AdminPage({ records, onAdd, onUpdate, onDelete, onReset }: AdminPageProps) {
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [filter, setFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter(
      (r) =>
        (filter === 'all' || r.category === filter) &&
        (audienceFilter === 'all' || r.audience === audienceFilter) &&
        (term === '' || r.title.toLowerCase().includes(term) || r.description.toLowerCase().includes(term)),
    );
  }, [records, filter, audienceFilter, search]);

  const audienceCount = (id: string) => records.filter((r) => r.audience === id).length;

  const close = () => setDialog(null);

  // Saves go to the API first; the dialog only closes (and a success toast only shows) once the server confirms.
  // A failure is thrown back to RecordForm, which keeps the dialog open and shows the error.
  const handleSave = async (draft: RecordDraft) => {
    if (dialog?.type === 'edit') {
      await onUpdate(dialog.record.id, draft);
      toast.success('Record updated.');
    } else {
      await onAdd(draft);
      toast.success('Record added.');
    }
    close();
  };

  const runAction = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(success);
      close();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-in mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Admin Management</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Add, edit and remove the campus information students see in the Hub and in Ask NexCampus.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setDialog({ type: 'reset' })} className="btn-secondary">
            <RotateCcw className="h-4 w-4" /> Reset samples
          </button>
          <button onClick={() => setDialog({ type: 'create' })} className="btn-primary">
            <Plus className="h-4 w-4" /> Add information
          </button>
        </div>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total records" value={records.length} icon={BookMarked} />
        <StatCard label="Intended for new students" value={audienceCount('new-students')} icon={Users} />
        <StatCard label="Hostel residents" value={audienceCount('hostel-residents')} icon={Users} />
      </section>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Records</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Search records"
              placeholder="Search records"
              className="input pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select aria-label="Filter records by audience" className="input sm:w-48" value={audienceFilter} onChange={(e) => setAudienceFilter(e.target.value)}>
            <option value="all">All audiences</option>
            {AUDIENCES.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
          <select aria-label="Filter records by category" className="input sm:w-64" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All categories ({records.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card p-10 text-center text-slate-600 dark:text-slate-300">
          {records.length === 0
            ? 'No records yet. Add information to get started.'
            : 'No records match your search or filters.'}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((record) => (
            <li key={record.id} className="card flex flex-col gap-4 p-5 transition hover:border-brand-300 sm:flex-row sm:items-center dark:hover:border-brand-700">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <CategoryBadge categoryId={record.category} />
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {getAudienceLabel(record.audience)}
                  </span>
                </div>
                <h3 className="truncate font-semibold text-slate-900 dark:text-white">{record.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{record.description}</p>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  Updated {new Date(record.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 sm:shrink-0">
                <button onClick={() => setDialog({ type: 'edit', record })} className="btn-secondary !px-3 !py-2 text-sm">
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => setDialog({ type: 'delete', record })} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/40 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-500/10">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(dialog?.type === 'create' || dialog?.type === 'edit') && (
        <Modal title={dialog.type === 'edit' ? 'Edit information' : 'Add information'} onClose={close}>
          <RecordForm
            key={dialog.type === 'edit' ? dialog.record.id : 'new'}
            initial={dialog.type === 'edit' ? dialog.record : undefined}
            onSubmit={handleSave}
            onCancel={close}
          />
        </Modal>
      )}

      {dialog?.type === 'delete' && (
        <Modal title="Delete this record?" onClose={close}>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">{dialog.record.title}</span> will be removed from the Hub and from chat answers. This cannot be undone.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button onClick={close} className="btn-secondary" disabled={busy}>Keep record</button>
            <button
              onClick={() => void runAction(() => onDelete(dialog.record.id), 'Record deleted.')}
              className="btn-danger"
              disabled={busy}
            >
              <Trash2 className="h-4 w-4" /> {busy ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}

      {dialog?.type === 'reset' && (
        <Modal title="Reset sample information?" onClose={close}>
          <p className="text-slate-600 dark:text-slate-300">
            All current records in the database will be replaced with the original sample information. Your own additions and edits will be lost.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button onClick={close} className="btn-secondary" disabled={busy}>Cancel</button>
            <button
              onClick={() => void runAction(onReset, 'Sample records restored.')}
              className="btn-danger"
              disabled={busy}
            >
              <RotateCcw className="h-4 w-4" /> {busy ? 'Resetting…' : 'Reset'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
