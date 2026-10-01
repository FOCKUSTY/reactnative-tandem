import * as Linking from "expo-linking";

export const deepLinks = {
  record: (id: string) => `https://tandem-links.vercel.app/record/${id}`,
  section: (sectionId: string, title?: string) =>
    Linking.createURL(`/section/${sectionId}`, {
      queryParams: title ? { title } : undefined,
    }),
  table: (tableId: string) =>
    `https://tandem-links.vercel.app/table/${tableId}`,
  cell: (
    tableId: string,
    rowId: string,
    fieldId: string,
    mode?: "view" | "edit",
  ) =>
    `https://tandem-links.vercel.app/table/${tableId}/cell/${rowId}/${fieldId}?mode=${mode === "view" ? "view" : "edit"}`,
};
