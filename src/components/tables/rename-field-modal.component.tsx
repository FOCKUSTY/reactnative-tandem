import { useEffect, useState } from "react";
import { TextInput, View, Text } from "react-native";

import { ModalWrapper } from "../common";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";
import type { Field } from "../../types/table.types";

export type RenameFieldModalProps = {
  visible: boolean;
  field: Field | null;
  onClose: () => void;
  onRename: (id: string, name: string) => void;
  loading?: boolean;
};

export const RenameFieldModal = ({
  visible,
  field,
  onClose,
  onRename,
  loading = false,
}: RenameFieldModalProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  const [name, setName] = useState("");

  useEffect(() => {
    if (visible && field) {
      setName(field.name);
    }
  }, [visible, field]);

  const handleConfirm = () => {
    if (!field) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === field.name) {
      onClose();
      return;
    }
    onRename(field.id, trimmed);
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={t("tables.renameFieldTitle")}
      confirmText={t("common.save")}
      onConfirm={handleConfirm}
      loading={loading}
      confirmDisabled={!name.trim() || name.trim() === field?.name}
    >
      <Text style={styles.label}>{t("tables.field.name")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("tables.field.namePlaceholder")}
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        autoFocus
        selectTextOnFocus
      />

      {field && (
        <View style={styles.meta}>
          <Text style={styles.metaLabel}>{t("tables.field.type")}</Text>
          <Text style={styles.metaValue}>
            {t(`tables.field.types.${field.type}` as any)}
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
