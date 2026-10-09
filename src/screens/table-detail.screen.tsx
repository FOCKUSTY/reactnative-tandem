import type { NavigationProperty } from "../types";
import type { Field, TableRowData } from "../types/table.types";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  TableRow,
  TABLE_COLUMN_WIDTH,
  CreateFieldModal,
  SkeletonRecordDetail,
  TABLE_ACTION_WIDTH,
  RenameFieldModal,
  RenameTableModal,
  OverflowMenu,
  ModalWrapper,
} from "../components";
import {
  useTableWithFormulas,
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
  useInsertRow,
} from "../hooks";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import { tablesService } from "../api";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { isTempId, makeTempId } from "../tables/draft";

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

  const { table, renderedCells, isLoading, draft } =
    useTableWithFormulas(tableId);

  const [draftMode, setDraftMode] = useState(false);
  const draftModeRef = useRef(draftMode);
  draftModeRef.current = draftMode;

  const [saving, setSaving] = useState(false);

  const createRow = useCreateRow();
  const insertRow = useInsertRow();
  const deleteRow = useDeleteRow();
  const createField = useCreateField();
  const deleteField = useDeleteField();
  const updateCell = useCreateOrUpdateCell();
  const deleteTable = useDeleteTable();

  const queryClient = useQueryClient();

  const [fieldModalVisible, setFieldModalVisible] = useState(false);

  const updateField = useUpdateField();
  const [renameField, setRenameField] = useState<Field | null>(null);
  const [renameTableVisible, setRenameTableVisible] = useState(false);
  const updateTable = useUpdateTable();

  const [insertPositionVisible, setInsertPositionVisible] = useState(false);
  const [insertPositionText, setInsertPositionText] = useState("");

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
    if (draftModeRef.current && isTempId(id)) {
      draft.updateField(id, { name });
      setRenameField(null);
      return;
    }
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
            onPress={() => setFieldModalVisible(true)}
            style={styles.headerButton}
            disabled={!table}
            accessibilityLabel={t("tables.addField")}
          >
            <MaterialIcons
              name="playlist-add"
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
          <OverflowMenu
            actions={[
              {
                label: t("tables.share"),
                onPress: handleShareTable,
              },
              {
                label: t("tables.deleteConfirm.title"),
                onPress: handleDeleteTable,
                destructive: true,
              },
              {
                label: draftMode
                  ? t("tables.draft.turnOff")
                  : t("tables.draft.turnOn"),
                onPress: () => setDraftMode((v) => !v),
              },
            ]}
          />
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
  }, [navigation, table, colors, t, draftMode]);

  const addDraftRow = (position: number) => {
    draft.addRow({
      tempId: makeTempId("row"),
      position,
      cells: {},
      cellTypes: {},
    });
  };

  const handleAddRow = () => {
    if (draftMode) return addDraftRow(-1);
    createRow.mutate({ tableId, data: { position: -1 } });
  };

  const handleAddRowMenu = () => {
    if (draftMode) {
      Alert.alert(t("tables.insertRow.addTitle"), undefined, [
        { text: t("tables.insertRow.atStart"), onPress: () => addDraftRow(1) },
        { text: t("tables.insertRow.atEnd"), onPress: () => addDraftRow(-1) },
        {
          text: t("tables.insertRow.atPosition"),
          onPress: () => {
            setInsertPositionText("");
            setInsertPositionVisible(true);
          },
        },
        { text: t("common.cancel"), style: "cancel" },
      ]);
      return;
    }

    Alert.alert(t("tables.insertRow.addTitle"), undefined, [
      {
        text: t("tables.insertRow.atStart"),
        onPress: () => createRow.mutate({ tableId, data: { position: 1 } }),
      },
      {
        text: t("tables.insertRow.atEnd"),
        onPress: () => createRow.mutate({ tableId, data: { position: -1 } }),
      },
      {
        text: t("tables.insertRow.atPosition"),
        onPress: () => {
          setInsertPositionText("");
          setInsertPositionVisible(true);
        },
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const handleInsertAtPosition = () => {
    const parsed = parseInt(insertPositionText.trim(), 10);
    if (!Number.isFinite(parsed) || parsed === 0) {
      Alert.alert(t("common.error"), t("tables.errors.invalidPosition"));
      return;
    }

    if (draftMode) {
      addDraftRow(parsed);
      setInsertPositionVisible(false);
      return;
    }

    createRow.mutate(
      { tableId, data: { position: parsed } },
      {
        onSuccess: () => setInsertPositionVisible(false),
        onError: () =>
          Alert.alert(t("common.error"), t("tables.errors.addRowFailed")),
      },
    );
  };

  const computeInsertPosition = (
    referenceRowId: string,
    position: "above" | "below",
  ): number => {
    if (!table) return -1;
    const realRows = table.rows.filter((r) => !isTempId(r.id));
    const idx = realRows.findIndex((r) => r.id === referenceRowId);
    if (idx < 0) return -1;
    return position === "above" ? idx + 1 : idx + 2;
  };

  const handleInsertRow = (
    referenceRowId: string,
    position: "above" | "below",
  ) => {
    if (!table) return;

    if (draftMode) {
      addDraftRow(computeInsertPosition(referenceRowId, position));
      return;
    }

    insertRow.mutate(
      {
        tableId,
        rows: table.rows,
        referenceRowId,
        position,
      },
      {
        onError: () => {
          Alert.alert(t("common.error"), t("tables.errors.insertFailed"));
        },
      },
    );
  };

  const handleRowMenu = (row: TableRowData) => {
    Alert.alert(t("tables.insertRow.menuTitle"), undefined, [
      {
        text: t("tables.insertRow.above"),
        onPress: () => handleInsertRow(row.id, "above"),
      },
      {
        text: t("tables.insertRow.below"),
        onPress: () => handleInsertRow(row.id, "below"),
      },
      {
        text: t("tables.insertRow.duplicate"),
        onPress: () => handleDuplicateRow(row),
      },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => handleDeleteRow(row.id),
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const handleDuplicateRow = async (row: TableRowData) => {
    if (!table) return;
    try {
      const created = await tablesService.createRow(tableId, {});
      const newRowId = created.data.id;
      for (const field of table.fields) {
        const value = row.cells[field.id];
        if (value) {
          await tablesService.createOrUpdateCell({
            rowId: newRowId,
            fieldId: field.id,
            value,
          });
        }
      }
      const refIndex = table.rows.findIndex((r) => r.id === row.id);
      const ids = table.rows.map((r) => r.id);
      ids.splice(refIndex + 1, 0, newRowId);
      await tablesService.reorderRows({ tableId, ids });
      queryClient.invalidateQueries({ queryKey: ["table", tableId] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    } catch {
      Alert.alert(t("common.error"), t("tables.errors.duplicateRowFailed"));
    }
  };

  const handleDeleteRow = (rowId: string) => {
    if (draftMode && isTempId(rowId)) {
      draft.removeRow(rowId);
      return;
    }

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
    if (draftMode && isTempId(fieldId)) {
      draft.removeField(fieldId);
      return;
    }

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
      mode: draftMode ? "edit" : "view",
      draftTableId: draftMode ? tableId : undefined,
    });
  };

  const handleCellLongPress = (field: Field, row: TableRowData) => {
    navigation.navigate("CellScreen", {
      tableId,
      rowId: row.id,
      fieldId: field.id,
      tableName: table?.name,
      mode: "edit",
      draftTableId: draftMode ? tableId : undefined,
    });
  };

  const handleBooleanChange = (
    rowId: string,
    fieldId: string,
    value: string,
  ) => {
    if (draftMode) {
      draft.setChange({ rowId, fieldId, value });
      return;
    }
    updateCell.mutate({ rowId, fieldId, value });
  };

  useEffect(() => {
    if (draft.hasChanges && !draftMode) setDraftMode(true);
  }, [draft.hasChanges, draftMode]);

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
          style={styles.hScroll}
          contentContainerStyle={styles.hScrollContent}
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
                      accessibilityLabel={t("tables.deleteFieldConfirm.title")}
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

            <ScrollView
              style={styles.bodyScroll}
              contentContainerStyle={styles.vScroll}
              showsVerticalScrollIndicator
            >
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
                    renderedCells={renderedCells}
                    onCellPress={handleCellPress}
                    onCellLongPress={handleCellLongPress}
                    onCellBooleanChange={handleBooleanChange}
                    onRowLongPress={() => handleRowMenu(row)}
                    onRowDelete={() => handleDeleteRow(row.id)}
                  />
                ))
              )}
            </ScrollView>
          </View>
        </ScrollView>
      )}

      {hasFields && (
        <TouchableOpacity
          style={[styles.fab, draftMode && draft.hasChanges && { bottom: 96 }]}
          onPress={handleAddRow}
          onLongPress={handleAddRowMenu}
          delayLongPress={400}
        >
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <CreateFieldModal
        visible={fieldModalVisible}
        onClose={() => setFieldModalVisible(false)}
        onCreate={(data) => {
          if (draftMode) {
            draft.addField({
              tempId: makeTempId("field"),
              name: data.name,
              type: data.type,
              required: data.required,
              options: data.options,
              defaultValue: data.defaultValue,
            });
            setFieldModalVisible(false);
            return;
          }
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

      <ModalWrapper
        visible={insertPositionVisible}
        onClose={() => setInsertPositionVisible(false)}
        title={t("tables.insertRow.atPositionTitle")}
        confirmText={t("common.create")}
        onConfirm={handleInsertAtPosition}
        loading={createRow.isPending}
      >
        <Text style={styles.modalLabel}>
          {t("tables.insertRow.positionHint")}
        </Text>
        <TextInput
          style={styles.modalInput}
          value={insertPositionText}
          onChangeText={setInsertPositionText}
          placeholder={t("tables.insertRow.positionPlaceholder")}
          placeholderTextColor={colors.textMuted}
          keyboardType="numbers-and-punctuation"
          autoFocus
        />
      </ModalWrapper>

      {draftMode && draft.hasChanges && (
        <View style={styles.draftBar}>
          <Text style={styles.draftCount}>
            {t("tables.draft.count", { count: draft.changeCount })}
          </Text>
          <View style={styles.draftActions}>
            <TouchableOpacity
              style={[styles.draftButton, styles.draftDiscard]}
              disabled={saving}
              onPress={() => {
                Alert.alert(
                  t("tables.draft.discardTitle"),
                  t("tables.draft.discardMessage"),
                  [
                    { text: t("common.cancel"), style: "cancel" },
                    {
                      text: t("common.confirm"),
                      style: "destructive",
                      onPress: () => {
                        draft.discardAll();
                        setDraftMode(false);
                      },
                    },
                  ],
                );
              }}
            >
              <Text style={styles.draftDiscardText}>
                {t("tables.draft.discard")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.draftButton,
                styles.draftSave,
                saving && styles.draftSaveDisabled,
              ]}
              disabled={saving}
              onPress={async () => {
                if (saving) return;
                setSaving(true);
                try {
                  const result = await draft.saveAll();
                  if (result.failed === 0) {
                    Toast.show({
                      type: "success",
                      text1: t("tables.draft.saved", {
                        count: result.succeeded,
                      }),
                      position: "bottom",
                    });
                  } else {
                    Alert.alert(
                      t("common.error"),
                      t("tables.draft.partialFailure", {
                        failed: result.failed,
                        total: result.total,
                      }),
                    );
                  }
                } finally {
                  setSaving(false);
                }
              }}
            >
              <MaterialIcons name="save" size={18} color="#fff" />
              <Text style={styles.draftSaveText}>
                {t("tables.draft.save", { count: draft.changeCount })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  draftBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  draftCount: {
    fontSize: 14,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  draftActions: {
    flexDirection: "row",
    gap: 8,
  },
  draftButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  draftDiscard: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  draftDiscardText: {
    color: colors.text,
    fontWeight: "600",
  },
  draftSave: {
    backgroundColor: colors.primary,
  },
  draftSaveDisabled: {
    opacity: 0.6,
  },
  draftSaveText: {
    color: "#fff",
    fontWeight: "600",
  },
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
  /** Горизонтальный скролл занимает всю высоту экрана под контейнером. */
  hScroll: {
    flex: 1,
  },
  /** Растягивает tableWrap по вертикали на всю доступную высоту. */
  hScrollContent: {
    alignItems: "stretch",
  },
  /** Вертикальный скролл — только тело таблицы; шапка снаружи. */
  bodyScroll: {
    flex: 1,
  },
  vScroll: {
    paddingBottom: 100,
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
    gap: 4,
  },
  headerButton: {
    padding: 6,
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
  modalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
}));

export default TableDetailScreen;
