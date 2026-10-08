import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect, useEffect, useState } from "react";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import Markdown from "react-native-markdown-renderer";

import { CellContextBox } from "./cell-context-box.component";
import type { CellBaseProps } from "./cell.types";
import { DatePickerComponent } from "../../common";
import { useTheme } from "../../../contexts";
import { useTranslate, useCreateOrUpdateCell } from "../../../hooks";
import { createStyles, getMarkdownStyles, parseDate } from "../../../utils";
import type { NavigationProperty } from "../../../types";
import { hasTemplate } from "../../../tables/formula/types";

const FORMULA_TOKENS = [
  "С1Р1",
  "С-1Р-1",
  "С1Р1:С3Р5",
  "[Цена]",
  "сумма",
  "среднее",
  "мин",
  "макс",
  "количество",
  "счёт",
  "округл",
  "если",
] as const;

export const CellEditor = (props: CellBaseProps) => {
  const {
    table,
    field,
    rowId,
    initialValue,
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
  } = props;

  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const markdownStyles = getMarkdownStyles(colors);
  const navigation = useNavigation<NavigationProperty>();
  const updateCell = useCreateOrUpdateCell();

  const [value, setValue] = useState(initialValue);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  useEffect(() => {
    setValue(initialValue);
    setSelection({ start: 0, end: 0 });
  }, [rowId, field.id, initialValue]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: field.name });
  }, [navigation, field.name]);

  const isDirty = value !== initialValue;

  const confirmIfDirty = (action: () => void) => {
    if (!isDirty) {
      action();
      return;
    }
    Alert.alert(
      t("tables.cell.unsavedTitle"),
      t("tables.cell.unsavedMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.discard"),
          style: "destructive",
          onPress: action,
        },
      ],
    );
  };

  const handleSave = async () => {
    let finalValue = value;

    if (
      field.type === "number" &&
      finalValue.trim() !== "" &&
      !hasTemplate(finalValue)
    ) {
      finalValue = finalValue.replace(",", ".").trim();
      if (Number.isNaN(Number(finalValue))) {
        Alert.alert(t("common.error"), t("tables.errors.invalidNumber"));
        return;
      }
    }

    try {
      await updateCell.mutateAsync({
        rowId,
        fieldId: field.id,
        value: finalValue,
      });
      navigation.goBack();
    } catch {
      Alert.alert(t("common.error"), t("tables.errors.saveFailed"));
    }
  };

  /**
   * Вставляет токен в позицию курсора в активное поле. Позицию храним в
   * `selection` и передаём в `selection` prop TextInput'а — RN сам поставит
   * курсор сразу после вставленного токена.
   */
  const insertToken = (token: string) => {
    const before = value.slice(0, selection.start);
    const after = value.slice(selection.end);
    const cursor = selection.start + token.length;
    setValue(before + token + after);
    setSelection({ start: cursor, end: cursor });
  };

  const renderMultiline = () => (
    <View>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "edit" && styles.tabActive]}
          onPress={() => setTab("edit")}
        >
          <MaterialIcons
            name="edit"
            size={16}
            color={tab === "edit" ? colors.primary : colors.textMuted}
          />
          <Text
            style={[styles.tabText, tab === "edit" && styles.tabTextActive]}
          >
            {t("tables.cell.tabEdit")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "preview" && styles.tabActive]}
          onPress={() => setTab("preview")}
        >
          <MaterialIcons
            name="visibility"
            size={16}
            color={tab === "preview" ? colors.primary : colors.textMuted}
          />
          <Text
            style={[styles.tabText, tab === "preview" && styles.tabTextActive]}
          >
            {t("tables.cell.tabPreview")}
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "edit" ? (
        <TextInput
          style={[styles.input, styles.textArea]}
          value={value}
          onChangeText={setValue}
          selection={selection}
          onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
          placeholder={t("tables.cell.markdownPlaceholder")}
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
          autoFocus
        />
      ) : (
        <View style={styles.previewBox}>
          {value.trim() ? (
            <Markdown style={markdownStyles}>{value}</Markdown>
          ) : (
            <Text style={styles.valueEmpty}>
              {t("tables.cell.previewEmpty")}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderInput = () => {
    switch (field.type) {
      case "multiline":
        return renderMultiline();

      case "number":
        return (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            selection={selection}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            placeholder={field.name}
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            autoFocus
          />
        );

      case "date": {
        const parsed = parseDate(value);
        return (
          <DatePickerComponent
            date={parsed}
            onDateChange={(date) => setValue(date ? date.toISOString() : "")}
          />
        );
      }

      case "boolean": {
        const isTrue = value === "true";
        return (
          <View style={styles.booleanRow}>
            <Switch
              value={isTrue}
              onValueChange={(v) => setValue(v ? "true" : "false")}
              trackColor={{ false: colors.inputBorder, true: colors.primary }}
              thumbColor={colors.text}
            />
            <Text style={styles.booleanLabel}>
              {isTrue ? t("common.yes") : t("common.no")}
            </Text>
          </View>
        );
      }

      case "select":
        return (
          <View style={styles.optionsList}>
            {(field.options || []).map((option) => {
              const selected = value === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => setValue(selected ? "" : option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {selected && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
            {value !== "" && (
              <TouchableOpacity
                style={styles.clearOption}
                onPress={() => setValue("")}
              >
                <MaterialIcons
                  name="close"
                  size={18}
                  color={colors.textMuted}
                />
                <Text style={styles.clearOptionText}>{t("common.clear")}</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case "text":
      default:
        return (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            selection={selection}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            placeholder={field.name}
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
        );
    }
  };

  const isPending = updateCell.isPending;
  const isMultilinePreview = field.type === "multiline" && tab === "preview";

  const showFormulaUi =
    field.type === "text" ||
    field.type === "number" ||
    field.type === "multiline";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <CellContextBox
        tableName={table.name}
        field={field}
        rowNumber={rowNumber}
        totalRows={totalRows}
        hasPrevRow={hasPrevRow}
        hasNextRow={hasNextRow}
        onPrevRow={() => confirmIfDirty(onPrevRow)}
        onNextRow={() => confirmIfDirty(onNextRow)}
        fieldNumber={fieldNumber}
        totalFields={totalFields}
        hasPrevField={hasPrevField}
        hasNextField={hasNextField}
        onPrevField={() => confirmIfDirty(onPrevField)}
        onNextField={() => confirmIfDirty(onNextField)}
      />

      <Text style={styles.label}>
        {isMultilinePreview
          ? t("tables.cell.tabPreview")
          : t("tables.cell.value")}
      </Text>
      {renderInput()}

      {showFormulaUi && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.paletteContent}
          keyboardShouldPersistTaps="handled"
        >
          {FORMULA_TOKENS.map((token) => (
            <TouchableOpacity
              key={token}
              style={styles.paletteChip}
              onPress={() => insertToken(`{{ ${token} }}`)}
              activeOpacity={0.6}
            >
              <Text style={styles.paletteChipText}>{token}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {showFormulaUi && (
        <TouchableOpacity
          style={styles.formulaHintRow}
          onPress={() => navigation.navigate("FormulaHelp")}
          activeOpacity={0.7}
        >
          <MaterialIcons name="functions" size={16} color={colors.primary} />
          <Text style={styles.formulaHintText}>
            {t("tables.cell.formulaHint")}
          </Text>
        </TouchableOpacity>
      )}

      {isDirty && (
        <Text style={styles.dirtyHint}>{t("tables.cell.unsavedHint")}</Text>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, isPending && styles.disabled]}
        onPress={handleSave}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <MaterialIcons name="check" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>{t("common.save")}</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
        disabled={isPending}
      >
        <Text style={styles.secondaryButtonText}>{t("common.cancel")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStyles = createStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  valueEmpty: {
    color: colors.textMuted,
    fontStyle: "italic",
  },
  dirtyHint: {
    fontSize: 13,
    color: colors.danger,
    textAlign: "center",
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: "top",
  },
  booleanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  booleanLabel: {
    fontSize: 16,
    color: colors.text,
  },
  optionsList: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  optionSelected: {
    backgroundColor: colors.primary + "22",
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  clearOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
  },
  clearOptionText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  previewBox: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 14,
    minHeight: 140,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  formulaHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  formulaHintText: {
    fontSize: 12,
    color: colors.textMuted,
    flexShrink: 1,
  },
  paletteContent: {
    gap: 6,
    paddingRight: 16,
    paddingVertical: 8,
  },
  paletteChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  paletteChipText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: colors.text,
  },
}));
