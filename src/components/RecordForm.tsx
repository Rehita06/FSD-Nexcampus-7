import { useState, type FormEvent } from 'react';
import { AUDIENCES, CATEGORIES } from '@/constants';
import { errorMessage } from '@/services/http';
import type { CampusRecord, RecordDraft } from '@/types';

interface RecordFormProps {
  initial?: CampusRecord;
  onSubmit: (draft: RecordDraft) => void | Promise<void>;
  onCancel: () => void;
}

const EMPTY_DRAFT: RecordDraft = { title: '', description: '', category: 'general', audience: 'all' };

export default function RecordForm({ initial, onSubmit, onCancel }: RecordFormProps) {
  const [draft, setDraft] = useState<RecordDraft>(
    initial ? { title: initial.title, description: initial.description, category: initial.category, audience: initial.audience } : EMPTY_DRAFT,
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof RecordDraft>(key: K, value: RecordDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draft.title.trim();
    const description = draft.description.trim();
    if (title.length < 4) {
      setError('Please enter a title of at least 4 characters.');
      return;
    }
    if (description.length < 10) {
      setError('Please enter a description of at least 10 characters.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({ ...draft, title, description });
    } catch (e) {
      setError(errorMessage(e));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="record-title" className="label">Title</label>
        <input
          id="record-title"
          className="input"
          placeholder="e.g. Hostel gate closing time"
          value={draft.title}
          onChange={(e) => update('title', e.target.value)}
          maxLength={120}
        />
      </div>

      <div>
        <label htmlFor="record-description" className="label">Description</label>
        <textarea
          id="record-description"
          className="input min-h-28 resize-y"
          placeholder="Write the official information students should know"
          value={draft.description}
          onChange={(e) => update('description', e.target.value)}
          maxLength={1000}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="record-category" className="label">Category</label>
          <select
            id="record-category"
            className="input"
            value={draft.category}
            onChange={(e) => update('category', e.target.value as RecordDraft['category'])}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="label">Intended audience</legend>
          <div className="grid gap-2">
            {AUDIENCES.map((a) => (
              <label
                key={a.id}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition ${
                  draft.audience === a.id
                    ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200'
                    : 'border-slate-300 text-slate-700 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="audience"
                  value={a.id}
                  checked={draft.audience === a.id}
                  onChange={() => update('audience', a.id)}
                  className="accent-brand-600"
                />
                {a.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={submitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add information'}
        </button>
      </div>
    </form>
  );
}
