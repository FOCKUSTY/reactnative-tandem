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

export type CreateRecordRouteProperties = {
  key: string;
  name: "CreateRecord";
  params: { sectionId?: string; record?: MyRecord };
};

export const CreateRecordScreen = () => {
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
        <Text style={styles.label}>Секция *</Text>
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
        <Text style={styles.label}>Заголовок</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите заголовок"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Содержание *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Введите содержание (поддерживается Markdown)"
          placeholderTextColor={colors.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Дата события</Text>
        <DatePickerComponent
          date={dateEvent}
          visible={datePickerShowed}
          onShow={() => setDatePickerShowed(true)}
          onHide={() => setDatePickerShowed(false)}
          onDateChange={handleDateChange}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Теги</Text>
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
          {loading ? "Сохранение..." : isEditing ? "Обновить" : "Создать"}
        </Text>
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
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
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
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
}));

export default CreateRecordScreen;
