import { View, Text } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";

import { CellPager } from "./cell-pager.component";
import { useTheme } from "../../../contexts";
import { createStyles } from "../../../utils";
import { useTranslate } from "../../../hooks";
import type { Field } from "../../../types/table.types";

export type CellContextBoxProps = {
  tableName: string;
  field: Field;
  rowNumber: number;
  totalRows: number;
  hasPrevRow: boolean;
  hasNextRow: boolean;
  onPrevRow: () => void;
  onNextRow: () => void;
  fieldNumber: number;
  totalFields: number;
  hasPrevField: boolean;
  hasNextField: boolean;
  onPrevField: () => void;
  onNextField: () => void;
};

export const CellContextBox = ({
  tableName,
  field,
  rowNumber,
  totalRows,
  hasPrevRow,
  hasNextRow,
  onPrevRow,
  onNextRow,
  fieldNumber,
  totalFields,
  hasPrevField,
  hasNextField,
  onPrevField,
  onNextField,
}: CellContextBoxProps) => {
  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.infoBox}>
      <View style={styles.infoRow}>
        <MaterialIcons name="table-rows" size={18} color={colors.primary} />
        <Text style={styles.infoTable} numberOfLines={1}>
          {tableName}
        </Text>
      </View>
      <Text style={styles.infoMeta}>
        {field.name}
        {field.required ? " *" : ""}
      </Text>

      <View style={styles.pagerBlock}>
        <CellPager
          label={t("tables.cell.rowLabel")}
          prevIcon="keyboard-arrow-up"
          nextIcon="keyboard-arrow-down"
          current={rowNumber}
          total={totalRows}
          hasPrev={hasPrevRow}
          hasNext={hasNextRow}
          onPrev={onPrevRow}
          onNext={onNextRow}
        />
        <CellPager
          label={t("tables.cell.fieldLabel")}
          prevIcon="chevron-left"
          nextIcon="chevron-right"
          current={fieldNumber}
          total={totalFields}
          hasPrev={hasPrevField}
          hasNext={hasNextField}
          onPrev={onPrevField}
          onNext={onNextField}
        />
      </View>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  infoBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoTable: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flexShrink: 1,
  },
  infoMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
  },
  pagerBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 8,
  },
}));
