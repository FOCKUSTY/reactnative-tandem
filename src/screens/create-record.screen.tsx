import type { MyRecord } from "../types";

import { useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { useRecordForm } from "../hooks";
import { createStyles } from "../utils";
import { useTheme } from "../contexts";
import {
  SectionSelectorComponent,
  TagsInputComponent,
  DatePickerComponent,
  CheckboxRowComponent,
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
    datePickerShowed,
    setDatePickerShowed,
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
  } = useRecordForm({ initialSectionId, record });

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

      <View style={styles.field}>
        <Text style={styles.label}>{t("records.field.date")}</Text>
        <DatePickerComponent
          date={dateEvent}
          visible={datePickerShowed}
          onShow={() => setDatePickerShowed(true)}
          onHide={() => setDatePickerShowed(false)}
          onDateChange={handleDateChange}
        />
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

const getStyles = createStyles((colors) => ({
  content: { padding: 16, paddingBottom: 40 },
  textArea: { minHeight: 120, textAlignVertical: "top" },
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
}));

export default CreateRecordScreen;
