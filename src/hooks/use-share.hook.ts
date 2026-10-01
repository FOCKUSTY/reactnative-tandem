import { Share } from "react-native";
import { deepLinks, logger } from "../utils";
import { useTranslate } from "./i18n";

const PREVIEW_LENGTH = 140;

const preview = (text?: string | null): string | null => {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  return trimmed.length > PREVIEW_LENGTH
    ? trimmed.slice(0, PREVIEW_LENGTH) + "…"
    : trimmed;
};

const joinMessage = (...parts: (string | null | undefined)[]) =>
  parts.filter((p): p is string => Boolean(p)).join("\n");

export const useShare = () => {
  const { t } = useTranslate();

  const shareRecord = async (record: {
    id: string;
    title?: string;
    content?: string;
  }) => {
    const url = deepLinks.record(record.id);
    const title = record.title || t("records.untitled");
    const message = joinMessage(title, "", preview(record.content), "", url);
    try {
      await Share.share({ message, title, url });
    } catch (e) {
      void logger.warn("Share record failed", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  };

  const shareTable = async (table: {
    id: string;
    name: string;
    description?: string | null;
  }) => {
    const url = deepLinks.table(table.id);
    const message = joinMessage(
      table.name,
      "",
      preview(table.description),
      "",
      url,
    );
    try {
      await Share.share({ message, title: table.name, url });
    } catch (e) {
      void logger.warn("Share table failed", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  };

  const shareCell = async (params: {
    tableId: string;
    rowId: string;
    fieldId: string;
    tableName?: string;
    fieldName?: string;
    value?: string;
  }) => {
    const url = deepLinks.cell(
      params.tableId,
      params.rowId,
      params.fieldId,
      "view",
    );
    const title =
      params.tableName && params.fieldName
        ? `${params.tableName} · ${params.fieldName}`
        : (params.tableName ?? params.fieldName ?? t("tables.title"));
    const message = joinMessage(title, "", preview(params.value), "", url);
    try {
      await Share.share({ message, title, url });
    } catch (e) {
      void logger.warn("Share cell failed", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  };

  return { shareRecord, shareTable, shareCell };
};
