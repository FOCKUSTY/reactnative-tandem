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

/** Один участник пары — как он виден шаблонам. */
export type TemplateIdentityMember = {
  id: string;
  name: string;
  username: string;
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
  /**
   * Автор записи: `[author.name]`, `[author.username]`. Один и тот же
   * для всех, кто эту запись смотрит.
   */
  author: TemplateIdentityMember;
  /**
   * Второй участник пары с точки зрения автора: `[partner.name]`. Тоже
   * не зависит от зрителя. Пустые строки, если пары нет.
   */
  partner: TemplateIdentityMember;
};

export type TemplateContext = {
  record: TemplateRecord;
  now: Date;
  today: Date;
  vars: TemplateVars;
};
