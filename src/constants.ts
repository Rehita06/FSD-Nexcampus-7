import type { AudienceId, CategoryId } from '@/types';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  office: string;
  keywords: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'attendance',
    label: 'Attendance',
    office: 'Academic Office',
    keywords: ['attendance', 'present', 'absent', 'absence', 'percentage', 'shortage', 'class'],
  },
  {
    id: 'leave',
    label: 'Leave Procedures',
    office: 'Academic Office or your Class Coordinator',
    keywords: ['leave', 'holiday', 'medical', 'application', 'vacation', 'off', 'permission'],
  },
  {
    id: 'hostel',
    label: 'Hostel Rules',
    office: "Hostel Warden's Office",
    keywords: ['hostel', 'curfew', 'gate', 'entry', 'timing', 'timings', 'warden', 'residence', 'night', 'visitor'],
  },
  {
    id: 'library',
    label: 'Library',
    office: 'Central Library Desk',
    keywords: ['library', 'book', 'books', 'borrow', 'return', 'reading', 'journal', 'fine'],
  },
  {
    id: 'id-cards',
    label: 'Student ID Cards',
    office: 'Administration Office (ID Card Section)',
    keywords: ['id', 'card', 'identity', 'lost', 'replacement', 'badge'],
  },
  {
    id: 'examinations',
    label: 'Examinations',
    office: 'Examination Cell',
    keywords: ['exam', 'exams', 'examination', 'test', 'paper', 'result', 'results', 'hall', 'revaluation', 'grade'],
  },
  {
    id: 'discipline',
    label: 'Discipline & Conduct',
    office: "Dean of Students' Office",
    keywords: ['discipline', 'conduct', 'dress', 'code', 'ragging', 'behaviour', 'behavior', 'complaint', 'misconduct'],
  },
  {
    id: 'scholarships',
    label: 'Scholarships & Support',
    office: 'Student Support and Scholarship Cell',
    keywords: ['scholarship', 'scholarships', 'fee', 'fees', 'financial', 'aid', 'support', 'stipend', 'bursary'],
  },
  {
    id: 'general',
    label: 'General Guidance',
    office: 'Student Services Desk',
    keywords: ['campus', 'orientation', 'newcomer', 'freshers', 'general', 'help'],
  },
];

export const AUDIENCES: { id: AudienceId; label: string }[] = [
  { id: 'all', label: 'All students' },
  { id: 'new-students', label: 'New students' },
  { id: 'hostel-residents', label: 'Hostel residents' },
  { id: 'day-scholars', label: 'Day scholars' },
];

export const ROUTES = [
  { id: 'home', label: 'Home' },
  { id: 'chat', label: 'Ask NexCampus' },
  { id: 'hub', label: 'Campus Hub' },
  { id: 'tools', label: 'Campus Tools' },
  { id: 'students', label: 'Students' },
  { id: 'admin', label: 'Admin' },
] as const;

export const STORAGE_KEYS = {
  chat: 'nexcampus.chat.v1',
  theme: 'nexcampus.theme.v1',
  campus: 'nexcampus.campus-location.v1',
  focusSessions: 'nexcampus.focus-sessions.v1',
} as const;

export function getCategory(id: CategoryId): CategoryInfo {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function getAudienceLabel(id: AudienceId): string {
  return AUDIENCES.find((a) => a.id === id)?.label ?? 'All students';
}
