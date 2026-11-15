import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Building2, GraduationCap, Pencil, Plus, Search, SearchX, Trash2, UserPlus, Users } from 'lucide-react';
import Modal from '@/components/Modal';
import StatCard from '@/components/StatCard';
import StudentForm from '@/components/StudentForm';
import { EmptyState, ErrorState, LoadingState } from '@/components/DataState';
import { useToast } from '@/components/ToastProvider';
import { errorMessage } from '@/services/http';
import { studentApi } from '@/services/studentApi';
import type { LoadStatus, Student, StudentDraft } from '@/types';

type ActiveDialog = { type: 'create' } | { type: 'edit'; student: Student } | { type: 'delete'; student: Student } | null;

const COMMON_DEPARTMENTS = ['Computer Science', 'Data Science', 'Mathematics', 'Statistics', 'Physics', 'Commerce'];
const SEARCH_DELAY_MS = 300;

export default function StudentsPage() {
  const toast = useToast();
  const [all, setAll] = useState<Student[]>([]);
  const [results, setResults] = useState<Student[] | null>(null); // null = not searching
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [department, setDepartment] = useState('all');
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [deleting, setDeleting] = useState(false);
  const searchId = useRef(0);

  // Full list (GET /api/students)
  const loadAll = useCallback(async () => {
    try {
      const data = await studentApi.list();
      setAll(data);
      setError('');
      setStatus('ready');
    } catch (e) {
      setError(errorMessage(e, 'Could not load students.'));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Debounce the search box
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  // Name search (GET /api/students/search/:name)
  const runSearch = useCallback(async (term: string) => {
    const id = ++searchId.current;
    if (!term) {
      setResults(null);
      setSearching(false);
      setSearchError('');
      return;
    }
    setSearching(true);
    try {
      const data = await studentApi.search(term);
      if (id !== searchId.current) return;
      setResults(data);
      setSearchError('');
    } catch (e) {
      if (id !== searchId.current) return;
      setSearchError(errorMessage(e, 'Search failed.'));
    } finally {
      if (id === searchId.current) setSearching(false);
    }
  }, []);

  useEffect(() => {
    void runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  const refreshAfterChange = async () => {
    await Promise.all([loadAll(), runSearch(debouncedQuery)]);
  };

  const departments = useMemo(
    () => Array.from(new Set(all.map((s) => s.department))).sort((a, b) => a.localeCompare(b)),
    [all],
  );
  const suggestions = useMemo(
    () => Array.from(new Set([...departments, ...COMMON_DEPARTMENTS])).sort((a, b) => a.localeCompare(b)),
    [departments],
  );

  const base = results ?? all;
  const visible = useMemo(
    () => (department === 'all' ? base : base.filter((s) => s.department === department)),
    [base, department],
  );

  const close = () => setDialog(null);

  const handleSave = async (draft: StudentDraft) => {
    if (dialog?.type === 'edit') {
      await studentApi.update(dialog.student.id, draft);
      toast.success(`${draft.name} was updated.`);
    } else {
      await studentApi.create(draft);
      toast.success(`${draft.name} was registered.`);
    }
    close();
    await refreshAfterChange();
  };

  const handleDelete = async () => {
    if (dialog?.type !== 'delete') return;
    setDeleting(true);
    try {
      await studentApi.remove(dialog.student.id);
      toast.success(`${dialog.student.name} was deleted.`);
      close();
      await refreshAfterChange();
    } catch (e) {
      toast.error(errorMessage(e, 'Could not delete the student.'));
      if (e instanceof Error && /not found/i.test(e.message)) {
        close();
        await refreshAfterChange();
      }
    } finally {
      setDeleting(false);
    }
  };

  const filtering = debouncedQuery !== '' || department !== 'all';
  const clearFilters = () => {
    setQuery('');
    setDebouncedQuery('');
    setDepartment('all');
  };

  return (
    <div className="animate-fade-in mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Student Management</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Register students and keep their details up to date. Records are stored in the NexCampus database.
          </p>
        </div>
        <button onClick={() => setDialog({ type: 'create' })} className="btn-primary self-start sm:self-auto" disabled={status === 'error'}>
          <Plus className="h-4 w-4" /> Register student
        </button>
      </header>

      {status === 'loading' && <LoadingState label="Loading students…" />}

      {status === 'error' && <ErrorState title="Could not load students" message={error} onRetry={() => { setStatus('loading'); void loadAll(); }} />}

      {status === 'ready' && (
        <>
          <section className="mb-8 grid gap-4 sm:grid-cols-3">
            <StatCard label="Registered students" value={all.length} icon={Users} />
            <StatCard label="Departments" value={departments.length} icon={Building2} />
            <StatCard label={filtering ? 'Matching filters' : 'Shown below'} value={visible.length} icon={GraduationCap} />
          </section>

          <div className="card mb-6 grid gap-4 p-4 sm:grid-cols-[1fr_240px] sm:p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                aria-label="Search students by name"
                placeholder="Search students by name"
                className="input pl-11"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter students by department"
              className="input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
            {searching ? 'Searching…' : `Showing ${visible.length} ${visible.length === 1 ? 'student' : 'students'}`}
          </p>

          {searchError && (
            <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {searchError}
            </p>
          )}

          {all.length === 0 ? (
            <EmptyState
              icon={<UserPlus className="h-7 w-7" />}
              title="No students registered yet"
              action={<button onClick={() => setDialog({ type: 'create' })} className="btn-primary"><Plus className="h-4 w-4" /> Register the first student</button>}
            >
              Use the form to add a student. Saved students are kept in the database and will still be here after you refresh.
            </EmptyState>
          ) : visible.length === 0 && !searching ? (
            <EmptyState
              icon={<SearchX className="h-7 w-7" />}
              title="No matching students"
              action={filtering ? <button onClick={clearFilters} className="btn-secondary">Clear search and filters</button> : undefined}
            >
              Try a different name or department.
            </EmptyState>
          ) : (
            <ul className="space-y-3" aria-label="Registered students">
              {visible.map((student) => (
                <li key={student.id} className="card flex flex-col gap-4 p-5 transition hover:border-brand-300 sm:flex-row sm:items-center dark:hover:border-brand-700">
                  <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg font-bold text-brand-700 sm:flex dark:bg-brand-900/40 dark:text-brand-300" aria-hidden="true">
                    {student.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                        {student.registerNumber}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Semester {student.semester}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {student.department}
                      </span>
                    </div>
                    <h3 className="truncate font-semibold text-slate-900 dark:text-white">{student.name}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{student.course}</p>
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      Registered {new Date(student.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 sm:shrink-0">
                    <button onClick={() => setDialog({ type: 'edit', student })} className="btn-secondary !px-3 !py-2 text-sm" aria-label={`Edit ${student.name}`}>
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => setDialog({ type: 'delete', student })}
                      aria-label={`Delete ${student.name}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/40 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {(dialog?.type === 'create' || dialog?.type === 'edit') && (
        <Modal title={dialog.type === 'edit' ? 'Edit student' : 'Register student'} onClose={close}>
          <StudentForm
            key={dialog.type === 'edit' ? dialog.student.id : 'new'}
            initial={dialog.type === 'edit' ? dialog.student : undefined}
            departmentSuggestions={suggestions}
            onSubmit={handleSave}
            onCancel={close}
          />
        </Modal>
      )}

      {dialog?.type === 'delete' && (
        <Modal title="Delete this student?" onClose={deleting ? () => undefined : close}>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">{dialog.student.name}</span> ({dialog.student.registerNumber}) will be permanently removed from the database. This cannot be undone.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button onClick={close} className="btn-secondary" disabled={deleting}>Keep student</button>
            <button onClick={handleDelete} className="btn-danger" disabled={deleting}>
              <Trash2 className="h-4 w-4" /> {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
