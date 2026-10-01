import { useEffect, useState } from "react";
import { TextInput, View, Text } from "react-native";

import { ModalWrapper } from "../common";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";
import type { TableWithRecordRows } from "../../types/table.types";

export type RenameTableModalProps = {
  visible: boolean;
  table: TableWithRecordRows | null;
  onClose: () => void;
  onRename: (id: string, name: string) => void;
  loading?: boolean;
};

export const RenameTableModal = ({
  visible,
  table,
  onClose,
  onRename,
  loading = false,
}: RenameTableModalProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  const [name, setName] = useState("");

  useEffect(() => {
    if (visible && table) {
      setName(table.name);
    }
  }, [visible, table]);

  const handleConfirm = () => {
    if (!table) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === table.name) {
      onClose();
      return;
    }
    onRename(table.id, trimmed);
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={t("tables.renameTableTitle")}
      confirmText={t("common.save")}
      onConfirm={handleConfirm}
      loading={loading}
      confirmDisabled={!name.trim() || name.trim() === table?.name}
    >
      <Text style={styles.label}>{t("tables.name")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("tables.namePlaceholder")}
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        autoFocus
        selectTextOnFocus
      />

      {table &&
        (table._count?.rows !== undefined ||
          table._count?.fields !== undefined) && (
          <View style={styles.meta}>
            <Text style={styles.metaLabel}>
              {t("tables.rowsCount", { count: table._count?.rows ?? 0 })}
            </Text>
            <Text style={styles.metaValue}>
              {table._count?.fields ?? 0} {t("tables.fieldLabelShort")}
            </Text>
          </View>
        )}
    </ModalWrapper>
  );
};

const getStyles = createStyles((colors) => ({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  metaLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  metaValue: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
}));
