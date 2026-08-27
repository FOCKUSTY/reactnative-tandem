export interface Section {
  id: string;
  userId: string;
  name: string;
  slug: string;
  isSystem: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    records: number;
  };
}

export type CreateSectionDto = {
  name: string;
  slug?: string;
  isSystem?: boolean;
  order?: number;
};

export type UpdateSectionDto = Partial<Pick<Section, "name" | "order">>;
