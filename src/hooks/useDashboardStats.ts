import { useCallback, useEffect, useRef, useState } from 'react';
import { statsApi } from '@/services/statsApi';
import { errorMessage } from '@/services/http';
import type { DashboardStats, LoadStatus } from '@/types';

// Fetches live statistics computed by the backend from MongoDB.
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    setStatus('loading');
    try {
      const data = await statsApi.get();
      if (id !== requestId.current) return;
      setStats(data);
      setStatus('ready');
    } catch (e) {
      if (id !== requestId.current) return;
      setError(errorMessage(e, 'Could not load statistics.'));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, status, error, refresh };
}
