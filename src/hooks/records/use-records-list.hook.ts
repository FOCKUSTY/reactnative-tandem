import type { NavigationProperty } from "../../types";

import { useRecords, useDeleteRecord } from "./use-records.hook";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Alert } from "react-native";

export type RecordsScreenRouteProperty = {
  key: string;
  name: "Records";
  params: { sectionId: string; title: string };
};

export const useRecordsList = () => {
  const navigation = useNavigation<NavigationProperty>();
  const route = useRoute<RecordsScreenRouteProperty>();
  const { sectionId, title } = route.params;

  const { data: records = [], isLoading } = useRecords({
    sectionIds: [sectionId],
  });
  const deleteMutation = useDeleteRecord();

  const handleDelete = (id: string) => {
    Alert.alert("Удалить запись?", "Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  const handleCreate = () => {
    navigation.navigate("CreateRecord", {
      sectionId,
      record: undefined,
    });
  };

  const handleRecordPress = (id: string) => {
    navigation.navigate("RecordDetail", { id });
  };

  return {
    records,
    isLoading,
    sectionId,
    title,
    handleDelete,
    handleCreate,
    handleRecordPress,
  };
};
