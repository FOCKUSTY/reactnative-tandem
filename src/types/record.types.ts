import { Section } from "./section.types";

export interface MyRecord {
  id: string;
  userId: string;
  sectionId: string;
  title?: string;
  content?: string;
  dateEvent?: string | null;
  isCompleted: boolean;
  isPinned: boolean;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  section?: Pick<Section, "id" | "name" | "slug">;
  isRecurring: boolean;
  recurringInterval?: string | null;
}

export type CreateRecordDto = Omit<
  MyRecord,
  "id" | "userId" | "createdAt" | "updatedAt" | "section"
> & {
  sectionId: string;
  isRecurring?: boolean;
  recurringInterval?: string | null;
};

export type UpdateRecordDto = Partial<
  Omit<MyRecord, "id" | "userId" | "section">
> & {
  isRecurring?: boolean;
  recurringInterval?: string | null;
};
