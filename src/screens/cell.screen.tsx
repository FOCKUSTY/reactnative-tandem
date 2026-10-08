import type { NavigationProperty, TableWithRecordRows } from "../types";

import { View, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";

import { CellEditor, CellViewer, SkeletonCreateRecord } from "../components";
import { useTable, useTranslate } from "../hooks";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import type { CellBaseProps } from "../components";

export type CellScreenRouteProperties = {
  key: string;
  name: "CellScreen";
  params: {
    tableId: string;
    rowId: string;
    fieldId: string;
    tableName?: string;
    mode?: "view" | "edit";
  };
};

export const CellScreen = () => {
  const route = useRoute<CellScreenRouteProperties>();
  const navigation = useNavigation<NavigationProperty>();

  const { tableId, fieldId, rowId, mode = "view" } = route.params;

  const { data, isLoading } = useTable(tableId);
  const table = data as TableWithRecordRows | undefined;

  const fieldIndex = table?.fields.findIndex((f) => f.id === fieldId) ?? -1;
  const field = fieldIndex >= 0 ? table?.fields[fieldIndex] : undefined;
  const totalFields = table?.fields.length ?? 0;

  const rowIndex = table?.rows.findIndex((r) => r.id === rowId) ?? -1;
  const currentRow = rowIndex >= 0 ? table?.rows[rowIndex] : undefined;
  const totalRows = table?.rows.length ?? 0;

  const goToRow = (idx: number) => {
    if (!table || idx < 0 || idx >= totalRows) return;
    navigation.setParams({ rowId: table.rows[idx].id } as any);
  };

  const goToField = (idx: number) => {
    if (!table || idx < 0 || idx >= totalFields) return;
    navigation.setParams({ fieldId: table.fields[idx].id } as any);
  };

  if (isLoading) return <SkeletonCreateRecord />;
  if (!table || !field || !currentRow || rowIndex < 0 || fieldIndex < 0) {
    return <NotFound />;
  }

  const baseProps: CellBaseProps = {
    table,
    field,

    rowId: currentRow.id,
    initialValue: currentRow.cells[fieldId] ?? "",
    initialCellType: currentRow.cellTypes?.[fieldId] ?? null,

    rowNumber: rowIndex + 1,
    totalRows,
    hasPrevRow: rowIndex > 0,
    hasNextRow: rowIndex < totalRows - 1,
    onPrevRow: () => goToRow(rowIndex - 1),
    onNextRow: () => goToRow(rowIndex + 1),

    fieldNumber: fieldIndex + 1,
    totalFields,
    hasPrevField: fieldIndex > 0,
    hasNextField: fieldIndex < totalFields - 1,
    onPrevField: () => goToField(fieldIndex - 1),
    onNextField: () => goToField(fieldIndex + 1),
  };

  return mode === "edit" ? (
    <CellEditor {...baseProps} />
  ) : (
    <CellViewer {...baseProps} />
  );
};

const NotFound = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);
  return (
    <View style={styles.center}>
      <MaterialIcons name="error-outline" size={48} color={colors.danger} />
      <Text style={styles.errorText}>{t("records.error.notFound")}</Text>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
}));

export default CellScreen;
