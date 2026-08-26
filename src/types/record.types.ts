import { Section } from "./section.types";

export interface MyRecord {
  id: string;
  userId: string;
  section: Section;
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

export type CreateRecordDto = Omit<
  MyRecord,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type UpdateRecordDto = Partial<Omit<MyRecord, "id" | "userId">>;
