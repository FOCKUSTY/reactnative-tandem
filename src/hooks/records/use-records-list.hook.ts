import type { NavigationProperty } from "../../types";

import { useRecords, useDeleteRecord } from "./use-records.hook";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Alert } from "react-native";
import { useTranslate } from "../i18n";

export type RecordsScreenRouteProperty = {
  key: string;
  name: "Records";
  params: { sectionId: string; title: string };
};

export const useRecordsList = () => {
  const { t } = useTranslate();
  const navigation = useNavigation<NavigationProperty>();
  const route = useRoute<RecordsScreenRouteProperty>();
  const { sectionId, title } = route.params;

  const { data: records = [], isLoading } = useRecords({
    sectionIds: [sectionId],
  });
  const deleteMutation = useDeleteRecord();

  const handleDelete = (id: string) => {
    Alert.alert(
      t("records.deleteConfirm.title"),
      t("records.deleteConfirm.message"),
      [
        { text: t("records.deleteConfirm.cancel"), style: "cancel" },
        {
          text: t("records.deleteConfirm.confirm"),
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ],
    );
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
