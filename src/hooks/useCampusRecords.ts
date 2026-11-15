import { useCallback, useEffect, useRef, useState } from 'react';
import { recordApi } from '@/services/recordApi';
import { errorMessage } from '@/services/http';
import type { CampusRecord, LoadStatus, RecordDraft } from '@/types';

// Campus records now live in MongoDB behind the Express API. This hook keeps the same shape the
// pages already used (records, addRecord, updateRecord, deleteRecord, resetRecords) and adds
// loading / error state. Mutations resolve only after the server confirms and reject on failure,
// so callers never show a success message for a request that failed.
export function useCampusRecords() {
  const [records, setRecords] = useState<CampusRecord[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    setStatus('loading');
    try {
      const data = await recordApi.list();
      if (id !== requestId.current) return;
      setRecords(data);
      setError('');
      setStatus('ready');
    } catch (e) {
      if (id !== requestId.current) return;
      setError(errorMessage(e, 'Could not load campus records.'));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addRecord = useCallback(async (draft: RecordDraft) => {
    const created = await recordApi.create(draft);
    setRecords((prev) => [created, ...prev]);
  }, []);

  const updateRecord = useCallback(async (id: string, draft: RecordDraft) => {
    const updated = await recordApi.update(id, draft);
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    await recordApi.remove(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const resetRecords = useCallback(async () => {
    const result = await recordApi.resetSamples();
    setRecords(result.records);
  }, []);

  return { records, status, error, refresh, addRecord, updateRecord, deleteRecord, resetRecords };
}
