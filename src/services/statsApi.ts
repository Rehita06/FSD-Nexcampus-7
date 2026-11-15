import { request } from '@/services/http';
import type { DashboardStats } from '@/types';

export const statsApi = {
  get: (signal?: AbortSignal) => request<DashboardStats>('GET', '/stats', undefined, signal),
};
