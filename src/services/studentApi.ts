import { request } from '@/services/http';
import type { Student, StudentDraft } from '@/types';

export const studentApi = {
  list: (signal?: AbortSignal) => request<Student[]>('GET', '/students', undefined, signal),
  search: (name: string, signal?: AbortSignal) =>
    request<Student[]>('GET', `/students/search/${encodeURIComponent(name)}`, undefined, signal),
  get: (id: string) => request<Student>('GET', `/students/${id}`),
  create: (draft: StudentDraft) => request<Student>('POST', '/students', draft),
  update: (id: string, draft: StudentDraft) => request<Student>('PUT', `/students/${id}`, draft),
  remove: (id: string) => request<{ message: string; id: string }>('DELETE', `/students/${id}`),
};
