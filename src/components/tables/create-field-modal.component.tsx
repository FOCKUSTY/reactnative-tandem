import { useState, useEffect } from "react";
import { TextInput, View, Text, TouchableOpacity, Switch } from "react-native";

import { ModalWrapper } from "../common";
import { useTheme } from "../../contexts";
import { createStyles } from "../../utils";
import { useTranslate } from "../../hooks";
import { FieldType } from "../../types/table.types";

export type CreateFieldModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    type: FieldType;
    required?: boolean;
    options?: string[];
    defaultValue?: string | null;
  }) => void;
  loading?: boolean;
};

const FIELD_TYPES: FieldType[] = [
  "text",
  "multiline",
  "number",
  "date",
  "boolean",
  "select",
];

export const CreateFieldModal = ({
  visible,
  onClose,
  onCreate,
  loading = false,
}: CreateFieldModalProps) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  const [name, setName] = useState("");
  const [type, setType] = useState<FieldType>("text");
  const [required, setRequired] = useState(false);
  const [optionsInput, setOptionsInput] = useState("");
  const [defaultValue, setDefaultValue] = useState("");

  useEffect(() => {
    if (!visible) {
      setName("");
      setType("text");
      setRequired(false);
      setOptionsInput("");
      setDefaultValue("");
    }
  }, [visible]);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const parsedOptions = optionsInput
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    onCreate({
      name: trimmed,
      type,
      required,
      options: type === "select" ? parsedOptions : [],
      defaultValue: defaultValue || null,
    });
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={t("tables.createFieldTitle")}
      confirmText={t("common.create")}
      onConfirm={handleCreate}
      loading={loading}
      confirmDisabled={!name.trim()}
    >
      <Text style={styles.label}>{t("tables.field.name")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("tables.field.namePlaceholder")}
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <Text style={[styles.label, { marginTop: 12 }]}>
        {t("tables.field.type")}
      </Text>
      <View style={styles.typesRow}>
        {FIELD_TYPES.map((ft) => (
          <TouchableOpacity
            key={ft}
            style={[styles.chip, type === ft && styles.chipActive]}
            onPress={() => setType(ft)}
          >
            <Text
              style={[styles.chipText, type === ft && styles.chipTextActive]}
            >
              {t(`tables.field.types.${ft}` as any)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {type === "select" && (
        <>
          <Text style={[styles.label, { marginTop: 12 }]}>
            {t("tables.field.options")}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t("tables.field.optionsPlaceholder")}
            placeholderTextColor={colors.textMuted}
            value={optionsInput}
            onChangeText={setOptionsInput}
          />
        </>
      )}

      <View style={styles.switchRow}>
        <Text style={styles.label}>{t("tables.field.required")}</Text>
        <Switch
          value={required}
          onValueChange={setRequired}
          trackColor={{ false: colors.inputBorder, true: colors.primary }}
          thumbColor={colors.text}
        />
      </View>
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
  typesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  chipTextActive: {
    color: "#fff",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
}));
