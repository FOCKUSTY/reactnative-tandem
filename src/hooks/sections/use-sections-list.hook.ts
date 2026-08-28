import type { NavigationProperty, Section } from "../../types";

import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import { useState } from "react";

import {
  useSections,
  useCreateSection,
  useDeleteSection,
} from "./use-sections.hook";
import { useTranslate } from "../i18n";

export const useSectionsList = () => {
  const { t } = useTranslate();
  const navigation = useNavigation<NavigationProperty>();
  const { data: sections = [], isLoading, refetch } = useSections();
  const createMutation = useCreateSection();
  const deleteMutation = useDeleteSection();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) {
      Alert.alert(t("common.error"), t("sections.errors.nameRequired"));
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: newSectionName.trim(),
        slug: undefined,
        isSystem: false,
        order: undefined,
      });
      setNewSectionName("");
      setModalVisible(false);
    } catch {
      Alert.alert(t("common.error"), t("sections.errors.createFailed"));
    }
  };

  const handleDeleteSection = (section: Section) => {
    if (section.isSystem) {
      Alert.alert(
        t("sections.systemSectionTitle"),
        t("sections.systemCannotDelete"),
      );
      return;
    }
    Alert.alert(
      t("sections.deleteConfirm.title"),
      t("sections.deleteConfirm.message", { name: section.name }),
      [
        { text: t("sections.deleteConfirm.cancel"), style: "cancel" },
        {
          text: t("sections.deleteConfirm.confirm"),
          style: "destructive",
          onPress: () => deleteMutation.mutate(section.id),
        },
      ],
    );
  };

  const handlePressSection = (section: Section) => {
    navigation.navigate("Records", {
      sectionId: section.id,
      title: section.name,
    });
  };

  return {
    sections,
    isLoading,
    refreshing,
    modalVisible,
    setModalVisible,
    newSectionName,
    setNewSectionName,
    handleRefresh,
    handleCreateSection,
    handleDeleteSection,
    handlePressSection,
  };
};
