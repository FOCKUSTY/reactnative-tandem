import type { NavigationProperty, Section } from "../types";

import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import { useState } from "react";

import {
  useSections,
  useCreateSection,
  useDeleteSection,
} from "./use-sections.hook";

export const useSectionsList = () => {
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
      Alert.alert("Ошибка", "Введите название секции");
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
      Alert.alert("Ошибка", "Не удалось создать секцию");
    }
  };

  const handleDeleteSection = (section: Section) => {
    if (section.isSystem) {
      Alert.alert("Системная секция", "Системные секции нельзя удалить");
      return;
    }
    Alert.alert(
      "Удалить секцию?",
      `Все записи в секции "${section.name}" также будут удалены.`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
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
