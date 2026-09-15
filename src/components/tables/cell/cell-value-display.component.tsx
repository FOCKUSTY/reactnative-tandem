import { Text } from "react-native";
import Markdown from "react-native-markdown-renderer";

import { useTheme } from "../../../contexts";
import { useTranslate } from "../../../hooks";
import { createStyles, formatDate, getMarkdownStyles } from "../../../utils";
import type { Field } from "../../../types/table.types";

export type CellValueDisplayProps = {
  field: Field;
  value: string;
};

export const CellValueDisplay = ({ field, value }: CellValueDisplayProps) => {
  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const markdownStyles = getMarkdownStyles(colors);
  const cellMarkdownStyles = {
    ...markdownStyles,
    root: {
      ...markdownStyles.root,
      flex: 0 as const,
    },
  };

  const empty = !value;

  if (field.type === "multiline") {
    if (empty) {
      return <Text style={styles.valueEmpty}>{t("tables.cell.empty")}</Text>;
    }

    return <Markdown style={cellMarkdownStyles}>{value}</Markdown>;
  }

  const textStyle = [styles.valueText, empty && styles.valueEmpty];

  switch (field.type) {
    case "boolean":
      return (
        <Text style={textStyle}>
          {value === "true" ? t("common.yes") : t("common.no")}
        </Text>
      );
    case "date":
      return (
        <Text style={textStyle}>
          {empty ? t("tables.cell.empty") : formatDate(value)}
        </Text>
      );
    default:
      return (
        <Text style={textStyle}>{empty ? t("tables.cell.empty") : value}</Text>
      );
  }
};

const getStyles = createStyles((colors) => ({
  valueText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  valueEmpty: {
    color: colors.textMuted,
    fontStyle: "italic",
  },
}));
