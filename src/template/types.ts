export type TemplateRecord = {
  id?: string;
  userId?: string;
  sectionId?: string;
  title?: string | null;
  content?: string | null;
  dateEvent?: string | null;
  isCompleted?: boolean;
  isPinned?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  section?: { name?: string; slug?: string } | null;
};

export type TemplateVars = {
  date: Date | null;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  tags: string[];
  section: string;
  sectionSlug: string;
  isCompleted: boolean;
  isPinned: boolean;
  now: Date;
  today: Date;
};

export type TemplateContext = {
  record: TemplateRecord;
  now: Date;
  today: Date;
  vars: TemplateVars;
};
