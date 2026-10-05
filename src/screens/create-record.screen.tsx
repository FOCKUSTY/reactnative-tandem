import type { MyRecord } from "../types";

import { useMemo } from "react";
import { useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";

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

export const CreateRecordScreen = () => {
  const { t } = useTranslate();
  const { colors } = useTheme();
  const styles = getStyles(colors);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
        <Text style={styles.label}>{t("records.field.title")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("records.placeholder.title")}
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {titlePreview && <TemplatePreview result={titlePreview} />}

      <View style={styles.field}>
        <Text style={styles.label}>{t("records.field.content")} *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t("records.placeholder.content")}
          placeholderTextColor={colors.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {contentPreview && <TemplatePreview result={contentPreview} />}

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

const getStyles = createStyles((colors) => ({
  content: { padding: 16, paddingBottom: 40 },
  textArea: { minHeight: 120, textAlignVertical: "top" },
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
