import type { NavigationProperty } from "../../types";

import { useNavigation, useRoute } from "@react-navigation/native";
import { Alert } from "react-native";

import { useRecord } from "./use-record.hook";
import { useDeleteRecord } from "./use-records.hook";
import { useTranslate } from "../i18n";

export type RecordDetailRouteProperties = {
  key: string;
  name: "RecordDetail";
  params: { id: string };
};

export const useRecordDetail = () => {
  const { t } = useTranslate();
  const navigation = useNavigation<NavigationProperty>();
  const route = useRoute<RecordDetailRouteProperties>();
  const { id } = route.params;

  const { data: record, isLoading, error } = useRecord(id);
  const deleteMutation = useDeleteRecord();

  const handleDelete = () => {
    if (!record) return;
    Alert.alert(
      t("records.deleteConfirm.title"),
      t("records.deleteConfirm.message"),
      [
        { text: t("records.deleteConfirm.cancel"), style: "cancel" },
        {
          text: t("records.deleteConfirm.confirm"),
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(id, {
              onSuccess: () => navigation.goBack(),
            });
          },
        },
      ],
    );
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
