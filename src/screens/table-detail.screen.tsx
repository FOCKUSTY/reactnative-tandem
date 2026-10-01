import type { NavigationProperty, TableWithRecordRows } from "../types";
import type { Field, TableRowData } from "../types/table.types";

import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLayoutEffect, useState } from "react";

import {
  TableRow,
  TABLE_COLUMN_WIDTH,
  CreateFieldModal,
  SkeletonRecordDetail,
  TABLE_ACTION_WIDTH,
  RenameFieldModal,
  RenameTableModal,
} from "../components";
import {
  useTable,
  useCreateRow,
  useDeleteRow,
  useCreateField,
  useDeleteField,
  useCreateOrUpdateCell,
  useDeleteTable,
  useTranslate,
  useUpdateField,
  useShare,
  useUpdateTable,
} from "../hooks";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";

export type TableDetailRouteProperties = {
  key: string;
  name: "TableDetail";
  params: { tableId: string; tableName: string };
};

export const TableDetailScreen = () => {
  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();
  const route = useRoute<TableDetailRouteProperties>();
  const { tableId, tableName } = route.params;

  const { data, isLoading } = useTable(tableId);
  const table = data as TableWithRecordRows | undefined;

  const createRow = useCreateRow();
  const deleteRow = useDeleteRow();
  const createField = useCreateField();
  const deleteField = useDeleteField();
  const updateCell = useCreateOrUpdateCell();
  const deleteTable = useDeleteTable();

  const [fieldModalVisible, setFieldModalVisible] = useState(false);

  const updateField = useUpdateField();
  const [renameField, setRenameField] = useState<Field | null>(null);
  const [renameTableVisible, setRenameTableVisible] = useState(false);
  const updateTable = useUpdateTable();

  const { shareTable } = useShare();

  const handleRenameTable = (id: string, name: string) => {
    updateTable.mutate(
      { id, data: { name } },
      {
        onSuccess: () => setRenameTableVisible(false),
        onError: (err: any) => {
          const message =
            err?.response?.data?.message ||
            t("tables.errors.renameTableFailed");
          Alert.alert(t("common.error"), message);
        },
      },
    );
  };

  const handleShareTable = () => {
    if (!table) return;
    void shareTable({
      id: table.id,
      name: table.name,
      description: table.description,
    });
  };

  const handleRenameField = (id: string, name: string) => {
    updateField.mutate(
      { id, data: { name } },
      {
        onSuccess: () => setRenameField(null),
        onError: (err: any) => {
          const message =
            err?.response?.data?.message || t("tables.errors.renameFailed");
          Alert.alert(t("common.error"), message);
        },
      },
    );
  };

  const handleDeleteTable = () => {
    Alert.alert(
      t("tables.deleteConfirm.title"),
      t("tables.deleteConfirm.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () =>
            deleteTable.mutate(tableId, {
              onSuccess: () => navigation.goBack(),
            }),
        },
      ],
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: table?.name || tableName,
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleShareTable}
            style={styles.headerButton}
            disabled={!table}
          >
            <MaterialIcons name="share" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFieldModalVisible(true)}
            style={[styles.headerButton, { marginLeft: 12 }]}
          >
            <MaterialIcons
              name="playlist-add"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteTable}
            style={[styles.headerButton, { marginLeft: 12 }]}
          >
            <MaterialIcons
              name="delete-outline"
              size={24}
              color={colors.danger}
            />
          </TouchableOpacity>
        </View>
      ),
      headerTitle: () => (
        <TouchableOpacity onPress={() => setRenameTableVisible(true)}>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{ color: colors.text, fontSize: 17, fontWeight: "600" }}
              numberOfLines={1}
            >
              {table?.name || tableName}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
              {t("tables.tapToRename")}
            </Text>
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, table, colors, t]);

  const handleAddRow = () => createRow.mutate({ tableId });

  const handleDeleteRow = (rowId: string) => {
    Alert.alert(
      t("tables.deleteRowConfirm.title"),
      t("tables.deleteRowConfirm.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => deleteRow.mutate(rowId),
        },
      ],
    );
  };

  const handleDeleteField = (fieldId: string) => {
    Alert.alert(
      t("tables.deleteFieldConfirm.title"),
      t("tables.deleteFieldConfirm.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => deleteField.mutate(fieldId),
        },
      ],
    );
  };

  const handleCellPress = (field: Field, row: TableRowData) => {
    navigation.navigate("CellScreen", {
      tableId,
      rowId: row.id,
      fieldId: field.id,
      tableName: table?.name,
      mode: "view",
    });
  };

  const handleCellLongPress = (field: Field, row: TableRowData) => {
    navigation.navigate("CellScreen", {
      tableId,
      rowId: row.id,
      fieldId: field.id,
      tableName: table?.name,
      mode: "edit",
    });
  };

  const handleBooleanChange = (
    rowId: string,
    fieldId: string,
    value: string,
  ) => {
    updateCell.mutate({ rowId, fieldId, value });
  };

  if (isLoading) return <SkeletonRecordDetail />;
  if (!table) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>{t("records.error.notFound")}</Text>
      </View>
    );
  }

  const hasFields = table.fields.length > 0;

  return (
    <View style={styles.container}>
      {table.description ? (
        <Text style={styles.description}>{table.description}</Text>
      ) : null}

      {!hasFields ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="playlist-add"
            size={64}
            color={colors.textMuted}
          />
          <Text style={styles.emptyText}>{t("tables.noFields")}</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setFieldModalVisible(true)}
          >
            <Text style={styles.emptyButtonText}>
              {t("tables.createField")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          contentContainerStyle={styles.hScroll}
        >
          <ScrollView
            showsVerticalScrollIndicator
            contentContainerStyle={styles.vScroll}
          >
            <View style={styles.tableWrap}>
              <View style={styles.headerRow}>
                {table.fields.map((field) => (
                  <View key={field.id} style={styles.headerCell}>
                    <View style={styles.headerTop}>
                      <TouchableOpacity
                        style={styles.headerTitleTouch}
                        activeOpacity={0.6}
                        onPress={() => setRenameField(field)}
                      >
                        <Text style={styles.headerCellText} numberOfLines={2}>
                          {field.name}
                          {field.required ? " *" : ""}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteField(field.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.headerDeleteIcon}
                        accessibilityLabel={t(
                          "tables.deleteFieldConfirm.title",
                        )}
                      >
                        <MaterialIcons
                          name="close"
                          size={14}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.headerCellType}>{field.type}</Text>
                  </View>
                ))}
                <View style={styles.headerActionCell} />
              </View>

              {table.rows.length === 0 ? (
                <View style={styles.emptyTable}>
                  <Text style={styles.emptyText}>{t("tables.emptyTable")}</Text>
                </View>
              ) : (
                table.rows.map((row) => (
                  <TableRow
                    key={row.id}
                    row={row}
                    fields={table.fields}
                    onCellPress={handleCellPress}
                    onCellLongPress={handleCellLongPress}
                    onCellBooleanChange={handleBooleanChange}
                    onRowLongPress={() => handleDeleteRow(row.id)}
                    onRowDelete={() => handleDeleteRow(row.id)}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </ScrollView>
      )}

      {hasFields && (
        <TouchableOpacity style={styles.fab} onPress={handleAddRow}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <CreateFieldModal
        visible={fieldModalVisible}
        onClose={() => setFieldModalVisible(false)}
        onCreate={(data) => {
          createField.mutate(
            { tableId, data },
            { onSuccess: () => setFieldModalVisible(false) },
          );
        }}
        loading={createField.isPending}
      />

      <RenameFieldModal
        visible={!!renameField}
        field={renameField}
        onClose={() => setRenameField(null)}
        onRename={handleRenameField}
        loading={updateField.isPending}
      />

      <RenameTableModal
        visible={renameTableVisible}
        table={table ?? null}
        onClose={() => setRenameTableVisible(false)}
        onRename={handleRenameTable}
        loading={updateTable.isPending}
      />
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 4,
  },
  headerDeleteIcon: {
    padding: 2,
  },
  headerActionCell: {
    width: TABLE_ACTION_WIDTH,
    backgroundColor: colors.inputBackground,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  hScroll: {
    paddingBottom: 100,
  },
  vScroll: {
    paddingBottom: 40,
  },
  tableWrap: {
    margin: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: colors.inputBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerCell: {
    width: TABLE_COLUMN_WIDTH,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: colors.cardBorder,
    justifyContent: "center",
  },
  headerCellText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  headerCellType: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTable: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
}));

export default TableDetailScreen;
