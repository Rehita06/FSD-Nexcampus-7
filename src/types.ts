export type CategoryId =
  | 'attendance'
  | 'leave'
  | 'hostel'
  | 'library'
  | 'id-cards'
  | 'examinations'
  | 'discipline'
  | 'scholarships'
  | 'general';

export type AudienceId = 'all' | 'new-students' | 'hostel-residents' | 'day-scholars';

export interface CampusRecord {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  audience: AudienceId;
  updatedAt: string;
}

export type RecordDraft = Pick<CampusRecord, 'title' | 'description' | 'category' | 'audience'>;

export type Route = 'home' | 'chat' | 'hub' | 'admin' | 'tools' | 'students';

export interface Student {
  id: string;
  name: string;
  registerNumber: string;
  course: string;
  semester: number;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export type StudentDraft = Pick<Student, 'name' | 'registerNumber' | 'course' | 'semester' | 'department'>;

export interface DashboardStats {
  totals: { students: number; records: number };
  departmentDistribution: { department: string; count: number }[];
  categoryDistribution: { category: CategoryId; count: number }[];
  audienceDistribution: { audience: AudienceId; count: number }[];
  recentStudents: Student[];
}

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  category?: CategoryId;
  sourceTitles?: string[];
  office?: string;
  timestamp: string;
}

export type Theme = 'light' | 'dark';

export interface SavedCampusLocation {
  lat: number;
  lng: number;
  savedAt: string;
}
