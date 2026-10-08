import type { Field, FieldType, TableRowData } from "../../types/table.types";
import { hasTemplate, type RenderedCellMap } from "../../tables/formula/types";

import { View, Text, TouchableOpacity, Switch } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";

import { useTheme } from "../../contexts";
import { createStyles, formatDate } from "../../utils";
import { useTranslate } from "../../hooks";

export const TABLE_COLUMN_WIDTH = 180;
export const TABLE_ACTION_WIDTH = 48;

export type TableRowProps = {
  row: TableRowData;
  fields: Field[];
  renderedCells?: RenderedCellMap;
  onCellPress: (field: Field, row: TableRowData) => void;
  onCellLongPress: (field: Field, row: TableRowData) => void;
  onCellBooleanChange?: (rowId: string, fieldId: string, value: string) => void;
  onRowLongPress?: () => void;
  onRowDelete?: () => void;
};

export const TableRow = ({
  row,
  fields,
  renderedCells,
  onCellPress,
  onCellLongPress,
  onCellBooleanChange,
  onRowLongPress,
  onRowDelete,
}: TableRowProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  /** Эффективный тип: override ячейки важнее типа поля. */
  const effectiveType = (field: Field): FieldType =>
    row.cellTypes?.[field.id] ?? field.type;

  const renderValue = (field: Field) => {
    const raw = row.cells[field.id] ?? "";
    const type = effectiveType(field);

    if (hasTemplate(raw)) {
      const rendered = renderedCells?.get(`${row.id}:${field.id}`) ?? "…";
      const isError = rendered.startsWith("#");
      return (
        <View style={styles.cellInner}>
          <Text
            style={[styles.cellText, isError && styles.formulaError]}
            numberOfLines={2}
          >
            {rendered}
          </Text>
          <MaterialIcons
            name="functions"
            size={14}
            color={isError ? colors.danger : colors.primary}
          />
        </View>
      );
    }

    if (type === "boolean") {
      const isTrue = raw === "true";
      return (
        <View style={styles.booleanCell}>
          <Switch
            value={isTrue}
            onValueChange={() =>
              onCellBooleanChange?.(row.id, field.id, isTrue ? "false" : "true")
            }
            trackColor={{ false: colors.inputBorder, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      );
    }

    if (type === "date") {
      return (
        <View style={styles.cellInner}>
          <Text
            style={[styles.cellText, !raw && styles.placeholderText]}
            numberOfLines={2}
          >
            {raw ? formatDate(raw) : "—"}
          </Text>
          <MaterialIcons name="event" size={14} color={colors.textMuted} />
        </View>
      );
    }

    if (type === "select") {
      return (
        <View style={styles.cellInner}>
          <Text
            style={[styles.cellText, !raw && styles.placeholderText]}
            numberOfLines={2}
          >
            {raw || "—"}
          </Text>
          <MaterialIcons
            name="arrow-drop-down"
            size={16}
            color={colors.textMuted}
          />
        </View>
      );
    }

    return (
      <Text
        style={[styles.cellText, !raw && styles.placeholderText]}
        numberOfLines={2}
      >
        {raw || t("tables.cell.empty")}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={styles.row}
      onLongPress={onRowLongPress}
      delayLongPress={600}
      activeOpacity={1}
    >
      {fields.map((field) => {
        const isBoolean = effectiveType(field) === "boolean";
        return (
          <TouchableOpacity
            key={field.id}
            style={styles.cell}
            activeOpacity={isBoolean ? 1 : 0.5}
            disabled={isBoolean}
            onPress={() => onCellPress(field, row)}
            onLongPress={() => onCellLongPress(field, row)}
            delayLongPress={400}
          >
            {renderValue(field)}
          </TouchableOpacity>
        );
      })}

      {onRowDelete && (
        <TouchableOpacity
          style={styles.actionCell}
          onPress={onRowDelete}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel={t("tables.deleteRowConfirm.title")}
        >
          <MaterialIcons
            name="delete-outline"
            size={20}
            color={colors.danger}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const getStyles = createStyles((colors) => ({
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  cell: {
    width: TABLE_COLUMN_WIDTH,
    minHeight: 52,
    borderRightWidth: 1,
    borderRightColor: colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: "center",
  },
  actionCell: {
    width: TABLE_ACTION_WIDTH,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  cellInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  cellText: {
    fontSize: 14,
    color: colors.text,
    flexShrink: 1,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  formulaError: {
    color: colors.danger,
  },
  booleanCell: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
}));
