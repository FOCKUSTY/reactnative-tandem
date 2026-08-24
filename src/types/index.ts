export interface User {
  id: number;
  username: string;
  name: string;
}

export interface MyRecord {
  id: number;
  userId: number;
  section: string;
  title?: string;
  content?: string;
  dateEvent?: string | null;
  isCompleted: boolean;
  isPinned: boolean;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type Section = 
  | 'rules'
  | 'dates'
  | 'plans'
  | 'notes'
  | 'questions'
  | 'contacts'
  | 'definitions'
  | 'discasses'
  | 'fanfics';

export interface NavigationParams {
  section: Section;
  title?: string;
  record?: MyRecord;
  id?: number;
}