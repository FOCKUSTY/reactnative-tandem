import type { MyRecord, NavigationProperty } from "../types";

import { useMemo, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";

import { useRecordForm } from "../hooks";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import {
  hasTemplate,
  renderTemplateWithDiagnostics,
  type TemplateRenderResult,
} from "../template";
import {
  SectionSelectorComponent,
  TagsInputComponent,
  DatePickerComponent,
  CheckboxRowComponent,
  SkeletonCreateRecord,
  RecurringPicker,
} from "../components";
import { useTranslate } from "../hooks";

export type CreateRecordRouteProperties = {
  key: string;
  name: "CreateRecord";
  params: { sectionId?: string; record?: MyRecord };
};

/**
 * Токены, которые показываем в палитре под полем ввода. Только переменные —
 * функции вроде `days(a, b)` слишком длинные для чипа, их смотрим на экране
 * подсказки по кнопке «?».
 */
const VARIABLE_TOKENS = [
  "[date]",
  "[now]",
  "[today]",
  "[createdAt]",
  "[updatedAt]",
  "[title]",
  "[content]",
  "[tags]",
  "[section]",
  "[sectionSlug]",
  "[author.name]",
  "[author.username]",
  "[partner.name]",
  "[partner.username]",
] as const;

export const CreateRecordScreen = () => {
  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProperty>();
  const route = useRoute<CreateRecordRouteProperties>();
  const { sectionId: initialSectionId, record } = route.params || {};

  const {
    sections,
    sectionsLoading,
    selectedSectionId,
    setSelectedSectionId,
    title,
    setTitle,
    content,
    setContent,
    dateEvent,
    tags,
    tagInput,
    setTagInput,
    completed,
    setCompleted,
    pinned,
    setPinned,
    sectionModalVisible,
    setSectionModalVisible,
    createSectionModalVisible,
    setCreateSectionModalVisible,
    newSectionName,
    setNewSectionName,
    loading,
    isEditing,
    handleAddTag,
    handleRemoveTag,
    handleDateChange,
    handleCreateSection,
    handleSubmit,
    recurring,
    setRecurring,
    recurringInterval,
    setRecurringInterval,
    isReport,
    setIsReport,
  } = useRecordForm({ initialSectionId, record });

  const previewNow = useMemo(() => new Date().toISOString(), []);

  const [titleSelection, setTitleSelection] = useState({ start: 0, end: 0 });
  const [contentSelection, setContentSelection] = useState({
    start: 0,
    end: 0,
  });
  const [lastFocusedField, setLastFocusedField] = useState<"title" | "content">(
    "content",
  );
  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);

  if (loading) {
    return <SkeletonCreateRecord />;
  }

  const previewRecord = {
    id: record?.id ?? "",
    userId: record?.userId ?? "",
    sectionId: selectedSectionId ?? "",
    title,
    content,
    dateEvent: dateEvent ? dateEvent.toISOString() : null,
    isCompleted: completed,
    isPinned: pinned,
    tags,
    metadata: {},
    createdAt: record?.createdAt ?? previewNow,
    updatedAt: previewNow,
  };

  const titlePreview = hasTemplate(title)
    ? renderTemplateWithDiagnostics(title, previewRecord)
    : null;
  const contentPreview = hasTemplate(content)
    ? renderTemplateWithDiagnostics(content, previewRecord)
    : null;

  /**
   * Вставляет токен в позицию курсора того поля, которое последним было в
   * фокусе. Позицию храним в `selection` state и передаём в `selection` prop
   * TextInput'а — так RN сам поставит курсор сразу после вставленного токена.
   */
  const insertToken = (token: string) => {
    const isTitle = lastFocusedField === "title";
    const value = isTitle ? title : content;
    const setValue = isTitle ? setTitle : setContent;
    const selection = isTitle ? titleSelection : contentSelection;
    const setSelection = isTitle ? setTitleSelection : setContentSelection;
    const inputRef = isTitle ? titleInputRef : contentInputRef;

    const before = value.slice(0, selection.start);
    const after = value.slice(selection.end);
    const cursor = selection.start + token.length;

    setValue(before + token + after);
    setSelection({ start: cursor, end: cursor });
    inputRef.current?.focus();
  };

  const openHelp = () => navigation.navigate("TemplateHelp");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Text style={styles.label}>{t("records.field.section")} *</Text>
        <SectionSelectorComponent
          sections={sections}
          loading={sectionsLoading}
          selectedId={selectedSectionId}
          onSelect={setSelectedSectionId}
          modalVisible={sectionModalVisible}
          setModalVisible={setSectionModalVisible}
          createModalVisible={createSectionModalVisible}
          setCreateModalVisible={setCreateSectionModalVisible}
          newSectionName={newSectionName}
          setNewSectionName={setNewSectionName}
          onCreateSection={handleCreateSection}
        />
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{t("records.field.title")}</Text>
          <TouchableOpacity
            onPress={openHelp}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={t("templateHelp.open")}
          >
            <MaterialIcons
              name="help-outline"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>
        <TextInput
          ref={titleInputRef}
          style={styles.input}
          placeholder={t("records.placeholder.title")}
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          selection={titleSelection}
          onSelectionChange={(e) => setTitleSelection(e.nativeEvent.selection)}
          onFocus={() => setLastFocusedField("title")}
        />
      </View>

      {titlePreview && <TemplatePreview result={titlePreview} />}

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{t("records.field.content")} *</Text>
          <TouchableOpacity
            onPress={openHelp}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={t("templateHelp.open")}
          >
            <MaterialIcons
              name="help-outline"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>
        <TextInput
          ref={contentInputRef}
          style={[styles.input, styles.textArea]}
          placeholder={t("records.placeholder.content")}
          placeholderTextColor={colors.textMuted}
          value={content}
          onChangeText={setContent}
          selection={contentSelection}
          onSelectionChange={(e) =>
            setContentSelection(e.nativeEvent.selection)
          }
          onFocus={() => setLastFocusedField("content")}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {contentPreview && <TemplatePreview result={contentPreview} />}

      <VariablePalette onInsert={insertToken} />

      <View style={styles.field}>
        <Text style={styles.label}>{t("records.field.date")}</Text>
        <DatePickerComponent date={dateEvent} onDateChange={handleDateChange} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t("records.field.tags")}</Text>
        <TagsInputComponent
          tags={tags}
          inputValue={tagInput}
          onInputChange={setTagInput}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />
      </View>

      <View style={styles.field}>
        <View style={styles.recurringRow}>
          <Text style={styles.label}>{t("records.repeat")}</Text>
          <Switch
            value={recurring}
            onValueChange={setRecurring}
            trackColor={{ false: colors.inputBorder, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
        {recurring && (
          <RecurringPicker
            value={recurringInterval}
            onChange={setRecurringInterval}
          />
        )}
      </View>

      <View style={styles.field}>
        <View style={styles.recurringRow}>
          <Text style={styles.label}>{t("records.field.isReport")}</Text>
          <Switch
            value={isReport}
            onValueChange={setIsReport}
            trackColor={{ false: colors.inputBorder, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </View>

      <CheckboxRowComponent
        completed={completed}
        pinned={pinned}
        onToggleCompleted={() => setCompleted(!completed)}
        onTogglePinned={() => setPinned(!pinned)}
      />

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading
            ? t("common.saving")
            : isEditing
              ? t("common.edit")
              : t("common.create")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

/**
 * Превью шаблона: сам результат рендера + список ошибок, если какие-то
 * выражения не распарсились. Ошибки подсвечиваем красным — иначе опечатку
 * легко принять за «шаблон так и должен выглядеть».
 */
const TemplatePreview = ({ result }: { result: TemplateRenderResult }) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <View style={styles.preview}>
      <Text style={styles.previewLabel}>
        {t("records.template.previewLabel")}
      </Text>
      <Text style={styles.previewText} numberOfLines={5}>
        {result.text}
      </Text>
      {result.errors.map((error, index) => (
        <Text
          key={`${error.expression}-${index}`}
          style={styles.previewErrorText}
        >
          {t("records.template.errorLabel", { expression: error.expression })}
        </Text>
      ))}
    </View>
  );
};

/**
 * Палитра переменных под полем ввода. Горизонтальный скролл с чипсами,
 * тап по чипсу вставляет токен в позицию курсора активного поля.
 * `keyboardShouldPersistTaps="handled"` — чтобы тап по чипсу не сбрасывал
 * клавиатуру.
 */
const VariablePalette = ({
  onInsert,
}: {
  onInsert: (token: string) => void;
}) => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  return (
    <View style={styles.paletteWrapper}>
      <Text style={styles.paletteLabel}>
        {t("records.template.variablesLabel")}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.paletteContent}
        keyboardShouldPersistTaps="handled"
      >
        {VARIABLE_TOKENS.map((token) => (
          <TouchableOpacity
            key={token}
            style={styles.paletteChip}
            onPress={() => onInsert(token)}
            activeOpacity={0.6}
          >
            <Text style={styles.paletteChipText}>{token}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  content: { padding: 16, paddingBottom: 40 },
  textArea: { minHeight: 120, textAlignVertical: "top" },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  preview: {
    marginTop: -8,
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
  },
  previewLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  previewText: {
    color: colors.text,
  },
  previewErrorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  paletteWrapper: {
    marginTop: -8,
    marginBottom: 16,
  },
  paletteLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
  paletteContent: {
    gap: 6,
    paddingRight: 16,
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
  saveButtonDisabled: { opacity: 0.6 },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: colors.text,
  },
  recurringRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
}));

export default CreateRecordScreen;
