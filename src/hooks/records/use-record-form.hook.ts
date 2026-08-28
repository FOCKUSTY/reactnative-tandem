import type { MyRecord, NavigationProperty } from "../../types";

import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useCreateSection, useSections } from "../sections";
import { useCreateRecord, useUpdateRecord } from "./use-records.hook";
import { useTranslate } from "../i18n";

export type UseRecordFormProperties = {
  initialSectionId?: string;
  record?: MyRecord;
};

export const useRecordForm = ({
  initialSectionId,
  record,
}: UseRecordFormProperties) => {
  const { t } = useTranslate();
  const navigation = useNavigation<NavigationProperty>();
  const isEditing = !!record;

  const { data: sections = [], isLoading: sectionsLoading } = useSections();
  const createRecordMutation = useCreateRecord();
  const updateRecordMutation = useUpdateRecord();
  const createSectionMutation = useCreateSection();

  const [selectedSectionId, setSelectedSectionId] = useState<
    string | undefined
  >(initialSectionId);
  const [title, setTitle] = useState(record?.title || "");
  const [content, setContent] = useState(record?.content || "");
  const [dateEvent, setDateEvent] = useState<Date | null>(
    record?.dateEvent ? new Date(record.dateEvent) : null,
  );
  const [datePickerShowed, setDatePickerShowed] = useState(false);
  const [tags, setTags] = useState<string[]>(record?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [completed, setCompleted] = useState(record?.isCompleted || false);
  const [pinned, setPinned] = useState(record?.isPinned || false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [createSectionModalVisible, setCreateSectionModalVisible] =
    useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!(initialSectionId && sections.length > 0 && !selectedSectionId))
      return;
    const exists = sections.some((s) => s.id === initialSectionId);
    if (exists) {
      setSelectedSectionId(initialSectionId);
      return;
    }
    if (sections.length > 0) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, initialSectionId, selectedSectionId]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleDateChange = (selectedDate?: Date) => {
    setDatePickerShowed(false);
    if (selectedDate) {
      setDateEvent(selectedDate);
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) {
      Alert.alert(t("common.error"), t("sections.errors.nameRequired"));
      return;
    }
    try {
      const newSection = await createSectionMutation.mutateAsync({
        name: newSectionName.trim(),
        slug: undefined,
        isSystem: false,
        order: undefined,
      });
      setSelectedSectionId(newSection.id);
      setNewSectionName("");
      setCreateSectionModalVisible(false);
      setSectionModalVisible(false);
    } catch {
      Alert.alert(t("common.error"), t("sections.errors.createFailed"));
    }
  };

  const handleSubmit = async () => {
    if (!selectedSectionId) {
      Alert.alert(t("common.error"), t("records.errors.selectSection"));
      return;
    }
    if (!content && !title) {
      Alert.alert(
        t("common.error"),
        t("records.errors.titleOrContentRequired"),
      );
      return;
    }

    setLoading(true);
    try {
      const data = {
        sectionId: selectedSectionId,
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        dateEvent: dateEvent ? dateEvent.toISOString() : null,
        isCompleted: completed,
        isPinned: pinned,
        tags,
        metadata: {},
      };

      if (isEditing && record) {
        await updateRecordMutation.mutateAsync({ id: record.id, data });
        Alert.alert(t("common.success"), t("records.saveSuccess"));
      } else {
        await createRecordMutation.mutateAsync(data as any);
        Alert.alert(t("common.success"), t("records.createSuccess"));
      }
      navigation.goBack();
    } catch {
      Alert.alert(t("common.error"), t("records.errors.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  return {
    sections,
    sectionsLoading,
    selectedSectionId,
    setSelectedSectionId,
    title,
    setTitle,
    content,
    setContent,
    dateEvent,
    setDateEvent,
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
  };
};
