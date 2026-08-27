import type { NavigationProperty } from "../types";

import { useNavigation, useRoute } from "@react-navigation/native";
import { Alert } from "react-native";

import { useRecord } from "./use-record.hook";
import { useDeleteRecord } from "./use-records.hook";

export type RecordDetailRouteProperties = {
  key: string;
  name: "RecordDetail";
  params: { id: string };
};

export const useRecordDetail = () => {
  const navigation = useNavigation<NavigationProperty>();
  const route = useRoute<RecordDetailRouteProperties>();
  const { id } = route.params;

  const { data: record, isLoading, error } = useRecord(id);
  const deleteMutation = useDeleteRecord();

  const handleDelete = () => {
    if (!record) return;
    Alert.alert("Удалить запись?", "Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(id, {
            onSuccess: () => navigation.goBack(),
          });
        },
      },
    ]);
  };

  const handleEdit = () => {
    if (record) {
      navigation.navigate("CreateRecord", {
        sectionId: record.sectionId,
        record,
      });
    }
  };

  return {
    record,
    isLoading,
    error,
    handleDelete,
    handleEdit,
  };
};
