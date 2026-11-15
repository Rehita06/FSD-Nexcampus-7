import { request } from '@/services/http';
import type { CampusRecord, RecordDraft } from '@/types';

export const recordApi = {
  list: (signal?: AbortSignal) => request<CampusRecord[]>('GET', '/records', undefined, signal),
  get: (id: string) => request<CampusRecord>('GET', `/records/${id}`),
  create: (draft: RecordDraft) => request<CampusRecord>('POST', '/records', draft),
  update: (id: string, draft: RecordDraft) => request<CampusRecord>('PUT', `/records/${id}`, draft),
  remove: (id: string) => request<{ message: string; id: string }>('DELETE', `/records/${id}`),
  resetSamples: () => request<{ message: string; records: CampusRecord[] }>('POST', '/records/reset-samples'),
};
